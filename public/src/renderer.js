
Renderer.prototype.three_program;

Renderer.prototype.matrixML;
Renderer.prototype.mvp;

Renderer.prototype.r;

function Renderer() {
  this.modelViewMatrixStack = [];
}

Renderer.prototype.init = function (gl) {
  this._gl = gl;	

	this.three_program = createProgram(gl, getShader(gl, "thing-vs"), getShader(gl, "thing-fs"));
	
  this.modelViewUL = this._gl.getUniformLocation(this.three_program, "u_modelView");
  this.projectionUL = this._gl.getUniformLocation(this.three_program, "u_projection");
  this.imageUL = this._gl.getUniformLocation(this.three_program, "u_image");
  this.lightUL = this._gl.getUniformLocation(this.three_program, "u_light");
  this.offsetUL = this._gl.getUniformLocation(this.three_program, "u_offset");

  /*
  console.log("t a_position:", gl.getAttribLocation(this.three_program, "a_position"));
  console.log("t a_uv:", gl.getAttribLocation(this.three_program, "a_uv"));
  console.log("t a_normal:", gl.getAttribLocation(this.three_program, "a_normal"));	
  */

  this.r = 0;
  this.modelView = mat4.create();
  this.projection = mat4.create();
    
  this.light = vec3.create();
  vec3.normalize(this.light, vec3.fromValues(1, 0, -1));
  
  mat4.perspective(this.projection, glMatrix.toRadian(120),
    this._gl.drawingBufferWidth / this._gl.drawingBufferHeight, 1, 100);
};

Renderer.prototype.draw = function (text, thing, thingTwo, color_quad) {
  // the buffer width and height are controlled by the canvas atts width and height 
  this._gl.viewport(0, 0, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

  /*
  console.log("this._gl.drawingBufferWidth:", this._gl.drawingBufferWidth); // 300
  console.log("this._gl.drawingBufferHeight:", this._gl.drawingBufferHeight); // 150
  */

	this._gl.clearColor(0, 0, 0, 1);
	this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

	// start drawing test 3D scene
  /*	
  this._gl.useProgram(this.three_program);

  mat4.identity(this.modelView); 
  
  mat4.translate(this.modelView, this.modelView, vec4.fromValues(0, 0, -30, 0));
  mat4.scale(this.modelView, this.modelView, vec3.fromValues(10, 10, 1));
  mat4.rotate(this.modelView, this.modelView, glMatrix.toRadian(20), vec3.fromValues(1, 0, 0));
  
  this.mvPushMatrix();
  mat4.rotate(this.modelView, this.modelView, glMatrix.toRadian(this.r), vec3.fromValues(0, 1, 0));

  this._gl.uniform3fv(this.lightUL, this.light);
  this._gl.uniformMatrix4fv(this.modelViewUL, false, this.modelView);	
  this._gl.uniformMatrix4fv(this.projectionUL, false, this.projection);	
  this._gl.uniform1i(this.imageUL, 0);	

  this._gl.enable(this._gl.DEPTH_TEST); 
	//this._gl.enable(this._gl.CULL_FACE);
	//this._gl.cullFace(this._gl.BACK);

  thing.setOffset(this.offsetUL, 0, 0, 0);
  thing.draw(this.offsetUL, this._gl);
  
  this.mvPopMatrix();
  
  this.mvPushMatrix();
  mat4.rotate(this.modelView, this.modelView, glMatrix.toRadian(this.r), vec3.fromValues(0, 1, 0));
  mat4.translate(this.modelView, this.modelView, vec4.fromValues(5, 0, 0, 1));

  this._gl.uniform3fv(this.lightUL, this.light);
  this._gl.uniformMatrix4fv(this.modelViewUL, false, this.modelView);	
  this._gl.uniformMatrix4fv(this.projectionUL, false, this.projection);	
  this._gl.uniform1i(this.imageUL, 0);	
  
  thingTwo.setOffset(this.offsetUL, 0, 0, 0);
  thingTwo.draw(this.offsetUL, this._gl);
	
  this.mvPopMatrix();
  
  this._gl.disable(this._gl.DEPTH_TEST);
	//this._gl.disable(this._gl.CULL_FACE);
  */	
  color_quad.draw(gl);
  
  text.draw(this._gl);

  this.r++;
};

Renderer.prototype.mvPushMatrix = function () {
  var copy = mat4.create();
  mat4.copy(copy, this.modelView);
  this.modelViewMatrixStack.push(copy);
};

Renderer.prototype.mvPopMatrix = function () {
  if (this.modelViewMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  this.modelView = this.modelViewMatrixStack.pop();
};
