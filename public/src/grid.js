
Grid.prototype._vao;
Grid.prototype._positions;
Grid.prototype._uvs;
Grid.prototype._width;

function Grid(dims, len, uvs, gl, program) {
  this._uvs = uvs;
 	this._positions = [];
  	
  this._pos_loc = gl.getAttribLocation(program, "a_position");
  this._uv_loc = gl.getAttribLocation(program, "a_uv");
  
  this._width = 0;
  var origin_y = 0;
  for(var i = 0; i < len; i++) {
    var sec_width = dims[i * 2];
    var sec_height = dims[(i * 2) + 1];
    this._positions = this._positions.concat([this._width, origin_y]);
    this._positions = this._positions.concat([this._width + sec_width, origin_y]);
    this._positions = this._positions.concat([this._width + sec_width, origin_y + sec_height]);
    this._positions = this._positions.concat([this._width + sec_width, origin_y + sec_height]);
    this._positions = this._positions.concat([this._width, origin_y + sec_height]);
    this._positions = this._positions.concat([this._width, origin_y]);
    
    this._width += sec_width;   
	}

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
  gl.enableVertexAttribArray(this._uv_loc);
  gl.vertexAttribPointer(this._uv_loc, 2, gl.FLOAT, false, 0, 0);  
};

Grid.prototype.getWidth = function() {
  return this._width;
};

Grid.prototype.draw = function(gl) {
  gl.bindVertexArray(this._vao);
  
  gl.enableVertexAttribArray(this._pos_loc);
  gl.enableVertexAttribArray(this._uv_loc);
	 
  gl.drawArrays(gl.TRIANGLES, 0, this._positions.length / 2);
  
  gl.disableVertexAttribArray(this._pos_loc);
  gl.disableVertexAttribArray(this._uv_loc);
};
