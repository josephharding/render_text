
Renderer.prototype.program;
Renderer.prototype.other_program;
Renderer.prototype.imageUniformLocation;
Renderer.prototype.resolutionUniformLocation;
Renderer.prototype.imageUniformLocationTwo;
Renderer.prototype.resolutionUniformLocationTwo;

//var positionAttributeLocation;
//var uvAttributeLocation;

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

function Renderer() {
  console.log("you made a renderer!");
}

Renderer.prototype.init = function (gl, image) {
  this._gl = gl;	

	var vertexShader = this.getShader("clip-space-vs");
	var fragmentShader = this.getShader("simple-texture-fs");
	this.program = this.createProgram(vertexShader, fragmentShader);

	var vertexShaderTwo = this.getShader("clip-space-vs");
	var fragmentShaderTwo = this.getShader("other-texture-fs");
	this.other_program = this.createProgram(vertexShaderTwo, fragmentShaderTwo);

  /*
  positionAttributeLocation = this._gl.getAttribLocation(this.program, "a_position");
  uvAttributeLocation = this._gl.getAttribLocation(this.program, "a_uv");
  console.log("positionAttributeLocation:", positionAttributeLocation);
  console.log("uvAttributeLocation:", uvAttributeLocation);
  */
  /*
  this._gl.bindAttribLocation(this.program, 1, "a_position");
  this._gl.bindAttribLocation(this.program, 0, "a_uv"); 
  */ 

  this.resolutionUniformLocation = this._gl.getUniformLocation(this.program, "u_resolution"); 
  this.imageUniformLocation = this._gl.getUniformLocation(this.program, "u_image"); 
  
  this.resolutionUniformLocationTwo = this._gl.getUniformLocation(this.other_program, "u_resolution"); 
  this.imageUniformLocationTwo = this._gl.getUniformLocation(this.other_program, "u_image"); 
};

Renderer.prototype.draw = function (mygrid, myquad) {
  this._gl.viewport(0, 0, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

  /*
  console.log("this._gl.drawingBufferWidth:", this._gl.drawingBufferWidth); // 300
  console.log("this._gl.drawingBufferHeight:", this._gl.drawingBufferHeight); // 150
  */

	// Clear the canvas
	this._gl.clearColor(0, 0, 0, 0);
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
	
	this._gl.useProgram(this.program);	

  this._gl.uniform1i(this.imageUniformLocation, 0);
  this._gl.uniform2f(this.resolutionUniformLocation,
		this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);
  
  mygrid.draw(this._gl);
	
  this._gl.useProgram(this.other_program);
  
  this._gl.uniform1i(this.imageUniformLocationTwo, 0);
  this._gl.uniform2f(this.resolutionUniformLocationTwo,
		this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight, 0);

	myquad.draw(this._gl, tex);
};
