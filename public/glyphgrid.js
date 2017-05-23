
GlyphGrid.prototype._grid;
GlyphGrid.prototype._uvs;
GlyphGrid.prototype._texture;

function GlyphGrid(gl, image) {
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
}

GlyphGrid.prototype.updateText = function(text, posAttrLoc, uvAttrLoc) {
  var glyphDim = 20;
  var imageDim = 100;

  var scaled_glyph_dim = glyphDim / imageDim;

  var glyph_uv_map = {
    a: {
      x: 0,
      y: 0
    },
    b: {
      x: 1,
      y: 0
    },
    c: {
      x: 2,
      y: 0
    }
  };
  var text_len = text.length;

  this._uvs = [];
	for(var i = 0; i < text_len; i++) {
    var coords = glyph_uv_map[text[i]];
    var origin_x = coords.x * scaled_glyph_dim;
    var origin_y = 1 - (coords.y * scaled_glyph_dim) - scaled_glyph_dim;

    this._uvs = this._uvs.concat([origin_x, origin_y]);
    this._uvs = this._uvs.concat([origin_x + scaled_glyph_dim, origin_y]);
    this._uvs = this._uvs.concat([origin_x + scaled_glyph_dim, origin_y + scaled_glyph_dim]);
    this._uvs = this._uvs.concat([origin_x + scaled_glyph_dim, origin_y + scaled_glyph_dim]);
    this._uvs = this._uvs.concat([origin_x, origin_y + scaled_glyph_dim]);
    this._uvs = this._uvs.concat([origin_x, origin_y]);		
  }
  this._grid = new Grid(0.2, 0.2, text_len, 1, this._uvs, gl, posAttrLoc, uvAttrLoc);
};

GlyphGrid.prototype.draw = function(gl) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  this._grid.draw(gl);
};
