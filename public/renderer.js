
Renderer.prototype.three_program;

Renderer.prototype.matrixML;
Renderer.prototype.mvp;

Renderer.prototype.r;

function Renderer() {
}

Renderer.prototype.init = function (gl) {
  this._gl = gl;	

	this.three_program = createProgram(gl, getShader(gl, "3d-vs"), getShader(gl, "3d-fs"));

  this.worldUL = this._gl.getUniformLocation(this.three_program, "u_world");
  this.worldVPUL = this._gl.getUniformLocation(this.three_program, "u_worldViewProjection");
  this.imageUL = this._gl.getUniformLocation(this.three_program, "u_image");
  this.lightUL = this._gl.getUniformLocation(this.three_program, "u_light");
  this.offsetUL = this._gl.getUniformLocation(this.three_program, "u_offset");

  /*
  console.log("t a_position:", gl.getAttribLocation(this.three_program, "a_position"));
  console.log("t a_uv:", gl.getAttribLocation(this.three_program, "a_uv"));
  console.log("t a_normal:", gl.getAttribLocation(this.three_program, "a_normal"));	
  */

  this.r = 0;
  this.world = mat4.create();
  this.viewProjection = mat4.create();
    
  this.light = vec3.create();
  vec3.normalize(this.light, vec3.fromValues(1, 0, -1));
};

Renderer.prototype.draw = function (text, thing, thingTwo) {
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

  mat4.perspective(this.viewProjection, glMatrix.toRadian(120),
    this._gl.drawingBufferWidth / this._gl.drawingBufferHeight, 1, 100);
 
  mat4.identity(this.world); 
  mat4.translate(this.world, this.world, vec4.fromValues(0, 0, -30, 0));
  mat4.scale(this.world, this.world, vec3.fromValues(20, 20, 1));
  mat4.rotate(this.world, this.world, glMatrix.toRadian(20), vec3.fromValues(1, 0, 0));
  mat4.rotate(this.world, this.world, glMatrix.toRadian(this.r), vec3.fromValues(0, 1, 0));

  mat4.mul(this.viewProjection, this.viewProjection, this.world);

  this._gl.uniform3fv(this.lightUL, this.light);
  this._gl.uniformMatrix4fv(this.worldUL, false, this.world);	
  this._gl.uniformMatrix4fv(this.worldVPUL, false, this.viewProjection);	
  this._gl.uniform1i(this.imageUL, 0);	

  this._gl.enable(this._gl.DEPTH_TEST); 
	//this._gl.enable(this._gl.CULL_FACE);
	//this._gl.cullFace(this._gl.BACK);

  thing.setOffset(this.offsetUL, 15, 0, 0);
  thing.draw(this.offsetUL, this._gl);
  
  thingTwo.setOffset(this.offsetUL, -15, 0, 0);
  thingTwo.draw(this.offsetUL, this._gl);
  
  this._gl.disable(this._gl.DEPTH_TEST);
	//this._gl.disable(this._gl.CULL_FACE);
	
	this.r++;
};
