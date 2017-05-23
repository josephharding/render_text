
var renderer;
var mygrid;

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 20);
	renderer.draw(mygrid);
};

window.onload = function() {
  
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
  renderer = new Renderer();

  var image = new Image();
  image.src = "abc.png";
  image.addEventListener('load', function (e) {
    
    renderer.init(gl, image);
     
    mygrid = new GlyphGrid(gl, image);
    mygrid.updateText('abc');
    
 		renderTick(); 
	});
  
  document.getElementById("str").addEventListener("input", function(e) {
    mygrid.updateText(e.currentTarget.value);
  });
};
