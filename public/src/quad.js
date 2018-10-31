
Quad.prototype._vao;
Quad.prototype._positions;
Quad.prototype._uvs;

function Quad(gl, program) {
  this._uvs = [
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 0,
    1, 1
  ];

  var x = 1;
  var y = 1;
 	this._positions = [
    -x, -y,
    -x, y,
    x, y,
    -x, -y,
    x, -y,
    x, y
  ];

  this._pos_loc = gl.getAttribLocation(program, "a_position");
  this._uv_loc = gl.getAttribLocation(program, "a_uv");

	this._vao = gl.createVertexArray();
	gl.bindVertexArray(this._vao);
	
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this._pos_loc);
  gl.vertexAttribPointer(this._pos_loc, 2, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._uvs), gl.STATIC_DRAW);
  gl.vertexAttribPointer(this._uv_loc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this._uv_loc);
}

Quad.prototype.draw = function(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.bindVertexArray(this._vao);
  
  gl.enableVertexAttribArray(this._pos_loc);
  gl.enableVertexAttribArray(this._uv_loc);

  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 2);

  gl.disableVertexAttribArray(this._pos_loc);
  gl.disableVertexAttribArray(this._uv_loc);
};
