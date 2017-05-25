
Quad.prototype._vao;
Quad.prototype._positions;
Quad.prototype._uvs;

function Quad(gl) {
  this._uvs = [
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 0,
    1, 1
  ];

  var x = 0.6;
  var y = 0.3;
 	this._positions = [
    -x, -y,
    -x, y,
    x, y,
    -x, -y,
    x, -y,
    x, y
  ];
 
	this._vao = gl.createVertexArray();
	gl.bindVertexArray(this._vao);
	
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._uvs), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
}

Quad.prototype.draw = function(gl, texture) {

  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.bindVertexArray(this._vao);
  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 2);
};
