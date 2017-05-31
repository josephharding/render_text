
RenderText.prototype.startTime;
RenderText.prototype._texture;
RenderText.prototype._glyphs;
RenderText.prototype._quad;
RenderText.prototype._glyph_program;
RenderText.prototype._quad_program;

function RenderText(gl, image, image_dim) {
  this.startTime = Date.now();
 
  this._glyph_program = createProgram(gl,
    getShader(gl, "offset-vs"), getShader(gl, "simple-texture-fs"));

  this._quad_program = createProgram(gl,
    getShader(gl, "simple-vs"), getShader(gl, "other-texture-fs"));

  this.resolutionUL = gl.getUniformLocation(this._glyph_program, "u_resolution");
  this.scaleUL = gl.getUniformLocation(this._glyph_program, "u_scale");
  this.imageUL = gl.getUniformLocation(this._glyph_program, "u_image");

  this.q_resolutionUL = gl.getUniformLocation(this._quad_program, "u_resolution");
  this.timeUL = gl.getUniformLocation(this._quad_program, "u_time");
  this.q_imageUL = gl.getUniformLocation(this._quad_program, "u_image");

  console.log("g a_position:", gl.getAttribLocation(this._glyph_program, "a_position"));
  console.log("g a_uv:", gl.getAttribLocation(this._glyph_program, "a_uv"));
  console.log("g a_offset:", gl.getAttribLocation(this._glyph_program, "a_offset"));
 
  this._glyph = new GlyphGrid(gl, image, image_dim); // actual text mesh and texture
	this._quad = new Quad(gl); // canvas for doing screen capture and applying blur effect

	this._texture = gl.createTexture();
};

RenderText.prototype.updateText = function(str) {
	this._glyph.updateText(str);
};

RenderText.prototype.draw = function(gl) {
  gl.useProgram(this._glyph_program);

  gl.uniform1i(this.imageUL, 0);
  gl.uniform2f(this.scaleUL, 0.5, 0.5);
	gl.uniform2f(this.resolutionUL, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
 
	this._glyph.draw(gl);

	gl.useProgram(this._quad_program);

  gl.uniform1i(this.q_imageUL, 0);
  gl.uniform1f(this.timeUL, Date.now() - this.startTime);
  gl.uniform2f(this.q_resolutionUL,
  	gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.bindTexture(gl.TEXTURE_2D, this._texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0,
    gl.drawingBufferWidth, gl.drawingBufferHeight, 0);

  gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

  this._quad.draw(gl, this._texture);

  gl.useProgram(this._glyph_program);

  gl.uniform1i(this.imageUL, 0);
  gl.uniform2f(this.scaleUL, 0.5, 0.5);
  gl.uniform2f(this.resolutionUL, gl.drawingBufferWidth, gl.drawingBufferHeight);

  this._glyph.draw(gl);
  
	gl.disable(gl.BLEND);
};
