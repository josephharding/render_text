
Thing.prototype._vao;
Thing.prototype._element_count;

function Thing(gl, data, image, program) {
 	this._element_count = data['indices'].length;

  this.offset = vec3.create();

  this._pos_loc = gl.getAttribLocation(program, "a_position");
  this._norm_loc = gl.getAttribLocation(program, "a_normal");
  this._uv_loc = gl.getAttribLocation(program, "a_uv");

  this._texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  this._vao = gl.createVertexArray();
  gl.bindVertexArray(this._vao);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data['indices']), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data['verts']), gl.STATIC_DRAW);
  
  gl.enableVertexAttribArray(this._pos_loc);
  gl.vertexAttribPointer(this._pos_loc, 3, gl.FLOAT, false, 0, 0); 
	
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data['uvs']), gl.STATIC_DRAW); 
  
	gl.enableVertexAttribArray(this._uv_loc);
  gl.vertexAttribPointer(this._uv_loc, 2, gl.FLOAT, false, 0, 0); 
  
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data['normals']), gl.STATIC_DRAW); 
  
	gl.enableVertexAttribArray(this._norm_loc);
  gl.vertexAttribPointer(this._norm_loc, 3, gl.FLOAT, false, 0, 0);   
}

Thing.prototype.setOffset = function(offsetUL, x, y, z) { 
  vec3.set(this.offset, x, y, z);
};
  
Thing.prototype.draw = function(offsetUL, gl) { 
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  gl.bindVertexArray(this._vao);

  gl.enableVertexAttribArray(this._pos_loc);
  gl.enableVertexAttribArray(this._uv_loc);
  gl.enableVertexAttribArray(this._norm_loc);
 
  gl.uniform3fv(offsetUL, this.offset);
  gl.drawElements(gl.TRIANGLES, this._element_count, gl.UNSIGNED_SHORT, 0);
  
  gl.disableVertexAttribArray(this._pos_loc);
  gl.disableVertexAttribArray(this._uv_loc);
  gl.disableVertexAttribArray(this._norm_loc);
};
