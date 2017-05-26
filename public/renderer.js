
Renderer.prototype.program;
Renderer.prototype.other_program;
Renderer.prototype.three_program;

Renderer.prototype.matrixML;
Renderer.prototype.mvp;

Renderer.prototype.r;
Renderer.prototype.startTime;

Renderer.prototype.imageUL;
Renderer.prototype.resolutionUL;
Renderer.prototype.scaleUL;

Renderer.prototype.imageUniformLocationTwo;
Renderer.prototype.resolutionUniformLocationTwo;
Renderer.prototype.timeUL;

function Renderer() {
  this.startTime = Date.now();
}

Renderer.prototype.getShader = function (id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
	  return null;
	}
	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
    if (k.nodeType == 3) {
        str += k.textContent;
    }
    k = k.nextSibling;
	}
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
    shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
    shader = this._gl.createShader(this._gl.VERTEX_SHADER);
	} else {
    return null;
	}
	this._gl.shaderSource(shader, str);
	this._gl.compileShader(shader);
	if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
    alert(this._gl.getShaderInfoLog(shader));
    return null;
	}
	return shader;
};

Renderer.prototype.createProgram = function(vertexShader, fragmentShader) {
  var program = this._gl.createProgram();
  this._gl.attachShader(program, vertexShader);
  this._gl.attachShader(program, fragmentShader);
  this._gl.linkProgram(program);
  var success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(this._gl.getProgramInfoLog(program));
  this._gl.deleteProgram(program);
}

Renderer.prototype.init = function (gl, image) {
  this._gl = gl;	

	this.program = this.createProgram(
    this.getShader("offset-vs"), this.getShader("simple-texture-fs"));
	
  this.other_program = this.createProgram(
    this.getShader("simple-vs"), this.getShader("other-texture-fs"));

	this.three_program = this.createProgram(
    this.getShader("3d-vs"), this.getShader("3d-fs"));

  this.matrixUL = this._gl.getUniformLocation(this.three_program, "u_matrix");

  this.r = 0;
  this.mvp = mat4.create();

  /*
  var positionAttributeLocation = this._gl.getAttribLocation(this.program, "a_position");
  var uvAttributeLocation = this._gl.getAttribLocation(this.program, "a_uv");
  var offsetAttributeLocation = this._gl.getAttribLocation(this.program, "a_offset");
  console.log("positionAttributeLocation:", positionAttributeLocation);
  console.log("uvAttributeLocation:", uvAttributeLocation);
  console.log("offsetAttributeLocation:", offsetAttributeLocation);
  */ 
  /*
  this._gl.bindAttribLocation(this.program, 1, "a_position");
  this._gl.bindAttribLocation(this.program, 0, "a_uv"); 
  */ 

  this.resolutionUL = this._gl.getUniformLocation(this.program, "u_resolution"); 
  this.scaleUL = this._gl.getUniformLocation(this.program, "u_scale"); 
  this.imageUL = this._gl.getUniformLocation(this.program, "u_image"); 
  
  this.resolutionUniformLocationTwo = this._gl.getUniformLocation(this.other_program, "u_resolution"); 
  this.timeUL = this._gl.getUniformLocation(this.other_program, "u_time"); 
  this.imageUniformLocationTwo = this._gl.getUniformLocation(this.other_program, "u_image"); 
};

Renderer.prototype.copyDrawBufferToTexture = function() {
  this._gl.useProgram(this.other_program);
 
  this._gl.uniform1i(this.imageUniformLocationTwo, 0);
  this._gl.uniform1f(this.timeUL, Date.now() - this.startTime);
  this._gl.uniform2f(this.resolutionUniformLocationTwo,
		this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);
  
  var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0,
    this._gl.drawingBufferWidth, this._gl.drawingBufferHeight, 0);

  return tex;
};

Renderer.prototype.draw = function (mygrid, myquad, mything) {
  // the buffer width and height are controlled by the canvas atts width and height 
  this._gl.viewport(0, 0, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

  /*
  console.log("this._gl.drawingBufferWidth:", this._gl.drawingBufferWidth); // 300
  console.log("this._gl.drawingBufferHeight:", this._gl.drawingBufferHeight); // 150
  */

	// Clear the canvas
	this._gl.clearColor(0, 0, 0, 1);
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);

  this._gl.enable(this._gl.BLEND);
  this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE);
  
	this._gl.useProgram(this.program);	

  this._gl.uniform1i(this.imageUL, 0);
  this._gl.uniform2f(this.resolutionUL, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

  mygrid.draw(this._gl);

  var tex = this.copyDrawBufferToTexture();

	this._gl.clearColor(0, 0, 0, 1);
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
	
  myquad.draw(this._gl, tex);

  this._gl.useProgram(this.program);	

  this._gl.uniform1i(this.imageUL, 0);
  this._gl.uniform2f(this.scaleUL, 0.5, 0.5);
  this._gl.uniform2f(this.resolutionUL, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

  mygrid.draw(this._gl);

  /*
  mat4.ortho(this.mvp, -this._gl.drawingBufferWidth/2, this._gl.drawingBufferWidth/2, 
    -this._gl.drawingBufferHeight/2, this._gl.drawingBufferHeight/2, 0, 10);
  */
  
	// start drawing test 3D scene
	this._gl.useProgram(this.three_program);	

  mat4.perspective(this.mvp, glMatrix.toRadian(120),
    this._gl.drawingBufferWidth / this._gl.drawingBufferHeight, 0, 10);
 
  mat4.translate(this.mvp, this.mvp, vec4.fromValues(0, 0, -30, 0));
  mat4.scale(this.mvp, this.mvp, vec3.fromValues(20, 20, 1));
  mat4.rotate(this.mvp, this.mvp, glMatrix.toRadian(20), vec3.fromValues(1, 0, 0));
  mat4.rotate(this.mvp, this.mvp, glMatrix.toRadian(this.r), vec3.fromValues(0, 1, 0));
  
  this._gl.uniformMatrix4fv(this.matrixUL, false, this.mvp);
	
	this._gl.enable(this._gl.CULL_FACE);
	this._gl.cullFace(this._gl.BACK);
 
  mything.draw(this._gl);
  
	this._gl.disable(this._gl.CULL_FACE);
	
	this.r++;
};
