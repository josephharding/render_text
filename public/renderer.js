
Renderer.prototype.three_program;

Renderer.prototype.matrixML;
Renderer.prototype.mvp;

Renderer.prototype.r;

function Renderer() {
}

Renderer.prototype.init = function (gl, image) {
  this._gl = gl;	

	this.three_program = createProgram(gl, getShader(gl, "3d-vs"), getShader(gl, "3d-fs"));

  this.matrixUL = this._gl.getUniformLocation(this.three_program, "u_matrix");

  this.r = 0;
  this.mvp = mat4.create();
};

Renderer.prototype.draw = function (text, mything) {
  // the buffer width and height are controlled by the canvas atts width and height 
  this._gl.viewport(0, 0, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

  /*
  console.log("this._gl.drawingBufferWidth:", this._gl.drawingBufferWidth); // 300
  console.log("this._gl.drawingBufferHeight:", this._gl.drawingBufferHeight); // 150
  */

	this._gl.clearColor(0, 0, 0, 1);
	this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

	text.draw(this._gl);

	// start drawing test 3D scene
	this._gl.useProgram(this.three_program);	

  mat4.perspective(this.mvp, glMatrix.toRadian(120),
    this._gl.drawingBufferWidth / this._gl.drawingBufferHeight, 1, 100);
 
  mat4.translate(this.mvp, this.mvp, vec4.fromValues(0, 0, -30, 0));
  mat4.scale(this.mvp, this.mvp, vec3.fromValues(20, 20, 1));
  mat4.rotate(this.mvp, this.mvp, glMatrix.toRadian(20), vec3.fromValues(1, 0, 0));
  mat4.rotate(this.mvp, this.mvp, glMatrix.toRadian(this.r), vec3.fromValues(0, 1, 0));
  
  this._gl.uniformMatrix4fv(this.matrixUL, false, this.mvp);	
 
  this._gl.enable(this._gl.DEPTH_TEST); 
	this._gl.enable(this._gl.CULL_FACE);
	this._gl.cullFace(this._gl.BACK);

  mything.draw(this._gl);
  
  this._gl.disable(this._gl.DEPTH_TEST);
	this._gl.disable(this._gl.CULL_FACE);
	
	this.r++;
};
