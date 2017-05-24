
var renderer;
var mygrid;
var myquad;

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 20);
	renderer.draw(mygrid, myquad);
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
     
    mygrid = new GlyphGrid(gl, image);
    mygrid.updateText('abc');
   
    myquad = new Quad(gl);

 		renderTick(); 
	});
  
  document.getElementById("str").addEventListener("input", function(e) {
    mygrid.updateText(e.currentTarget.value);
  });
};
