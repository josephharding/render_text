
var renderer;
var myglyphs;
var myquad;

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 20);
	renderer.draw(myglyphs, myquad);
};

window.onload = function() {  
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
  renderer = new Renderer();

  var image = new Image();
  image.src = "alphabet.png";
  image.addEventListener('load', function (e) {
    
    renderer.init(gl, image);
     
    myglyphs = new GlyphGrid(gl, image, 32); // each glyph is 32 px square
    myglyphs.updateText('abc');
   
    myquad = new Quad(gl);

 		renderTick(); 
	});
  
  document.getElementById("str").addEventListener("input", function(e) {
    myglyphs.updateText(e.currentTarget.value);
  });
};
