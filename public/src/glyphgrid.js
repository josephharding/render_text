
GlyphGrid.prototype._grid;
GlyphGrid.prototype._uvs;
GlyphGrid.prototype._texture;
GlyphGrid.prototype._program;
GlyphGrid.prototype._image_dim;
GlyphGrid.prototype._glyph_dim;

function GlyphGrid(gl, uv_source, image, glyph_dim) {
  this._uv_source = uv_source;
  this._texture = gl.createTexture();
  this._image_dim = image.height;
  if(image.width != this._image_dim) {
    console.log("error: glyph grid assumes square images!");
  }
  this._glyph_dim = glyph_dim;

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

GlyphGrid.prototype.updateText = function(gl, text) {
  var scaled_glyph_dim = this._glyph_dim / this._image_dim;

  var alphabet = 'abcdefghijklmnopqrstuvwxyz';

  var glyph_uv_map = {};
  for(var c of alphabet) {
    var idx = alphabet.indexOf(c) * 4; 
    glyph_uv_map[c] = {
      left: this._uv_source['uvs'][idx],
      right: this._uv_source['uvs'][idx + 1],
      top: this._uv_source['uvs'][idx + 2],
      bottom: this._uv_source['uvs'][idx + 3]
    };
  }
 
  // TODO - very hacky way to support spaces
  glyph_uv_map[' '] = {
    left: 0,
    right: 0.08,
    top: 0,
    bottom: 0
  };
  var spaces = [];
  var dims = [];
  this._uvs = [];
	for(var i = 0; i < text.length; i++) {
    if(text[i] in glyph_uv_map) {
      var coords = glyph_uv_map[text[i]];

      this._uvs = this._uvs.concat([coords.left, coords.bottom]);
      this._uvs = this._uvs.concat([coords.right, coords.bottom]);
      this._uvs = this._uvs.concat([coords.right, coords.top]);
      this._uvs = this._uvs.concat([coords.right, coords.top]);
      this._uvs = this._uvs.concat([coords.left, coords.top]);
      this._uvs = this._uvs.concat([coords.left, coords.bottom]);		

      dims.push(coords.right - coords.left);
      dims.push(coords.top - coords.bottom);
    } else {
      console.log("error: specified a character not in the glyph texture atlas!");
    }
  }
	this._grid = new Grid(dims, text.length, this._uvs, gl);
};


GlyphGrid.prototype.getWidth = function() {
  if(this._grid) {
    return this._grid.getWidth();
  } else {
    return 0;
  }
};

GlyphGrid.prototype.draw = function(gl) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  this._grid.draw(gl);
};
