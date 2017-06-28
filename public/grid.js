
Grid.prototype._vao;
Grid.prototype._positions;
Grid.prototype._uvs;

function Grid(dims, len, uvs, gl) {
  this._uvs = uvs;
 	this._positions = [];
  	
  var origin_x = 0;
  var origin_y = 0;
  for(var i = 0; i < len; i++) {
    var sec_width = dims[i * 2];
    var sec_height = dims[(i * 2) + 1];
    this._positions = this._positions.concat([origin_x, origin_y]);
    this._positions = this._positions.concat([origin_x + sec_width, origin_y]);
    this._positions = this._positions.concat([origin_x + sec_width, origin_y + sec_height]);
    this._positions = this._positions.concat([origin_x + sec_width, origin_y + sec_height]);
    this._positions = this._positions.concat([origin_x, origin_y + sec_height]);
    this._positions = this._positions.concat([origin_x, origin_y]);
    
    origin_x += sec_width;   
	}

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
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);  
}

Grid.prototype.draw = function(gl) {
  gl.bindVertexArray(this._vao);
  
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
	 
  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 2);
  
  gl.disableVertexAttribArray(0);
  gl.disableVertexAttribArray(1);
};
