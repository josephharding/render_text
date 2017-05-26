
var renderer;
var myglyphs;
var myquad;
var mything;

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 20);
	renderer.draw(myglyphs, myquad, mything);
};

function loadResource(path) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open("GET", path);
    request.onreadystatechange = function (event) {
        if (event.target.readyState == 4) {
            resolve(event.target.responseText);
        }
    };
    request.send();
  });
}

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

		loadResource('test.json')
    .then(data => {
    	mything = new Thing(gl, JSON.parse(data));
 			renderTick(); 
		});
	});
  
  document.getElementById("str").addEventListener("input", function(e) {
    myglyphs.updateText(e.currentTarget.value);
  });
};
