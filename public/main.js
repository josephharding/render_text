
var _renderer;
var _text;
var _thing;

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 40);
	_renderer.draw(_text, _thing);
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

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
        str += k.textContent;
    }
    k = k.nextSibling;
  }
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
};

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}


window.onload = function() {  
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
  _renderer = new Renderer();

  var image = new Image();
  image.src = "alphabet.png";
  image.addEventListener('load', function (e) {
    
    _renderer.init(gl, image);
   
		_text = new RenderText(gl, image, 32);
    _text.updateText('abc');

		loadResource('test.json')
    .then(data => {
    	_thing = new Thing(gl, JSON.parse(data));
 			renderTick(); 
		});
	});
  
  document.getElementById("str").addEventListener("input", function(e) {
    _text.updateText(e.currentTarget.value);
  });
};
