
Grid.prototype._vao;
Grid.prototype._positions;
Grid.prototype._uvs;

function Grid(sec_width, sec_height, width, height, uvs, gl) {
  this._uvs = uvs;
 	this._positions = [];
  this._offset = [];
  
  var x = -.6;
  var y = 0;
	
  for(var i = 0; i < width; i++) {
		for(var j = 0; j < height; j++) {
			var origin_x = i * sec_width;
      origin_x -= i * 0.05; // TODO: come back here and think about how we space out characters
			var origin_y = j * sec_height;	
			this._positions = this._positions.concat([origin_x, origin_y]);
			this._positions = this._positions.concat([origin_x + sec_width, origin_y]);
			this._positions = this._positions.concat([origin_x + sec_width, origin_y + sec_height]);
			this._positions = this._positions.concat([origin_x + sec_width, origin_y + sec_height]);
			this._positions = this._positions.concat([origin_x, origin_y + sec_height]);
			this._positions = this._positions.concat([origin_x, origin_y]);
       
			this._offset = this._offset.concat([x, y, x, y, x, y, x, y, x, y, x, y]);
    }
	}

	this._vao = gl.createVertexArray();
	gl.bindVertexArray(this._vao);
	
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._uvs), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
  
  var offsetBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._offset), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

Grid.prototype.draw = function(gl) {
  gl.bindVertexArray(this._vao);
  
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  gl.enableVertexAttribArray(2);
	 
  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 2);
  
  gl.disableVertexAttribArray(0);
  gl.disableVertexAttribArray(1);
  gl.disableVertexAttribArray(2);  
};
