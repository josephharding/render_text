
GlyphGrid.prototype._grid;
GlyphGrid.prototype._uvs;
GlyphGrid.prototype._texture;
GlyphGrid.prototype._program;

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

GlyphGrid.prototype.updateText = function(text) {
  var glyphDim = 32;
  var imageDim = 256;

  var scaled_glyph_dim = glyphDim / imageDim;

  // NOTE: space at end of string
  var alphabet = 'abcdefghijklmnopqrstuvwxyz ';

  var x = 0;
  var y = 0;
  var glyph_uv_map = {};
  for(let c of alphabet) {
    glyph_uv_map[c] = {
      x: x,
      y: y
    };
    x += 1; 
    if(x * glyphDim == imageDim) {
      x = 0;
      y++;
    }
  }

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
  // each grid element is 1/8 of the image
  this._grid = new Grid(scaled_glyph_dim, scaled_glyph_dim, text_len, 1, this._uvs, gl);
};

GlyphGrid.prototype.draw = function(gl) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  this._grid.draw(gl);
};
