
var _renderer;
var _text;
var _thing;
var _thingTwo;
var _colorQuad;

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

function loadImage(path) {
  return new Promise((resolve, reject) => {
    var image = new Image();
    image.src = path;
    image.addEventListener('load', function (e) {
      resolve(e.target);
    });
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

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 100);
	_renderer.draw(_text, _thing, _thingTwo, _colorQuad);
};

window.onload = function() {  
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
  _renderer = new Renderer();

  Promise.all([
    loadResource('data/test.json'),
    loadImage('images/sparrow_texture.png'),
    loadResource('data/alpha.json'),
    loadImage('images/alpha_plex.png'),
    loadResource('data/paint.json')
  ])
  .then(data => {
    _thing = new Thing(gl, JSON.parse(data[0]), data[1]);
    _thingTwo = new Thing(gl, JSON.parse(data[0]), data[1]);
    
    _text = new RenderText(gl, JSON.parse(data[2]), data[3], 32);
    _text.updateText(gl, 'hello world');
   
    _colorQuad = new ColorQuad(gl, JSON.parse(data[4]));

    _renderer.init(gl);
    renderTick(); 
  }); 
  
  document.getElementById("str").addEventListener("input", function(e) {
    _text.updateText(gl, e.currentTarget.value);
  });
};
