
RenderText.prototype._start_time;
RenderText.prototype._draw_scale;
RenderText.prototype._texture;
RenderText.prototype._glyphs;
RenderText.prototype._quad;
RenderText.prototype._glyph_program;
RenderText.prototype._quad_program;

function RenderText(gl, uv, image, image_dim) {
  this._start_time = Date.now();
  this._draw_scale = 1.0;
  this._offset = [-1.0, 0.0]; // this value is -1 to 1

  this._glyph_program = createProgram(gl,
    getShader(gl, "glyph-grid-vs"), getShader(gl, "glyph-grid-fs"));

  this._quad_program = createProgram(gl,
    getShader(gl, "text-quad-vs"), getShader(gl, "text-quad-fs"));

  this.resolutionUL = gl.getUniformLocation(this._glyph_program, "u_resolution");
  this.scaleUL = gl.getUniformLocation(this._glyph_program, "u_scale");
  this.offsetUL = gl.getUniformLocation(this._glyph_program, "u_offset");
  this.imageUL = gl.getUniformLocation(this._glyph_program, "u_image");
  this.timeUL = gl.getUniformLocation(this._glyph_program, "u_time");
  this.wordWidthUL = gl.getUniformLocation(this._glyph_program, "u_word_width");

  this.q_resolutionUL = gl.getUniformLocation(this._quad_program, "u_resolution");
  this.q_timeUL = gl.getUniformLocation(this._quad_program, "u_time");
  this.q_imageUL = gl.getUniformLocation(this._quad_program, "u_image");

  /*
  console.log("g a_position:", gl.getAttribLocation(this._glyph_program, "a_position"));
  console.log("g a_uv:", gl.getAttribLocation(this._glyph_program, "a_uv"));
  console.log("g a_offset:", gl.getAttribLocation(this._glyph_program, "a_offset"));
  */

  this._glyph = new GlyphGrid(gl, uv, image, image_dim); // actual text mesh and texture
	this._quad = new Quad(gl); // canvas for doing screen capture and applying blur effect

	this._texture = gl.createTexture();

	// create the frame buffer where the render text is drawn in the first pass	
	this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  gl.bindTexture(gl.TEXTURE_2D, this._texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight,
    0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	var renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
    gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

RenderText.prototype.updateText = function(str) {
	this._glyph.updateText(str);
};

RenderText.prototype.draw = function(gl) {
  gl.useProgram(this._glyph_program);

  gl.uniform1i(this.imageUL, 0);
  gl.uniform1f(this.timeUL, Date.now() - this._start_time);
  gl.uniform1f(this.wordWidthUL, this._glyph.getWidth());
  gl.uniform2f(this.scaleUL, this._draw_scale, this._draw_scale);
  gl.uniform2f(this.offsetUL, this._offset[0], this._offset[1]);
	gl.uniform2f(this.resolutionUL, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  // draw the glyphs once to a framebuffer so we can blur it on the quad
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer); 
  
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
  this._glyph.draw(gl);
	
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // now draw the texture we captured on the quad..
	gl.useProgram(this._quad_program);

  gl.uniform1i(this.q_imageUL, 0);
  gl.uniform1f(this.q_timeUL, Date.now() - this._start_time);
  gl.uniform2f(this.q_resolutionUL,
  	gl.drawingBufferWidth, gl.drawingBufferHeight);

  // this was the way to take a snapshot if we weren't using frame buffers, expect that
  // it would have taken a snap of the whole render space, including the ships and everything
	/* 
	gl.bindTexture(gl.TEXTURE_2D, this._texture);
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0,
  gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
	*/

  //this._quad.draw(gl, this._texture);

  // now a final pass drawing the glyphs directly on the screen (not a frame buffer now)
  gl.useProgram(this._glyph_program);

  gl.uniform1i(this.imageUL, 0);
  gl.uniform2f(this.scaleUL, this._draw_scale, this._draw_scale);
  gl.uniform2f(this.resolutionUL, gl.drawingBufferWidth, gl.drawingBufferHeight);

  this._glyph.draw(gl);
  
	gl.disable(gl.BLEND);
};
