
Thing.prototype._vao;
Thing.prototype._positions;

function Thing(gl, data) {
 	this._positions = data;
 
  var colors = [];
  for(var i = 0; i < data.length; i++) {
    colors = colors.concat([Math.random(), Math.random(), Math.random()]);
  }

	this._vao = gl.createVertexArray();
	gl.bindVertexArray(this._vao);
	
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
}

Thing.prototype.draw = function(gl) { 
  gl.bindVertexArray(this._vao);

  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 3);
};
