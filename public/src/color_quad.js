
ColorQuad.prototype._vao;
ColorQuad.prototype._positions;
ColorQuad.prototype._colors;

function ColorQuad(gl, data) {

  this._colors = data.colors;
 	this._positions = data.verts;
  
  this._program = createProgram(gl, getShader(gl, "color-vs"), getShader(gl, "color-fs"));
	this._posAL = gl.getAttribLocation(this._program, "a_position");
	this._colorAL = gl.getAttribLocation(this._program, "a_color");
	
	this._vao = gl.createVertexArray();
	gl.bindVertexArray(this._vao);
	
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(this._posAL, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this._posAL);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._colors), gl.STATIC_DRAW);
  gl.vertexAttribPointer(this._colorAL, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this._colorAL);
}

ColorQuad.prototype.draw = function(gl) {
	gl.useProgram(this._program);
  
	gl.bindVertexArray(this._vao);
  
  gl.enableVertexAttribArray(this._posAL);
  gl.enableVertexAttribArray(this._colorAL);

  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 3);

  gl.disableVertexAttribArray(this._posAL);
  gl.disableVertexAttribArray(this._colorAL);
};
