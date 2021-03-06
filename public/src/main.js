
var _renderer;
var _text;
var _thing;
var _thingTwo;
var _orthoThing;
var _colorQuad;

function parseXMLMesh(raw) { 
	let parser = new DOMParser();
	let xmlDoc = parser.parseFromString(raw, "text/xml");

	var vertices = [];
	for(var vertex of xmlDoc.getElementsByTagName("vertex")) {
		vertices.push(parseFloat(vertex.getAttribute("x")));
		vertices.push(parseFloat(vertex.getAttribute("y")));
		vertices.push(parseFloat(vertex.getAttribute("z")));
	}

	var uvs = [];
	for(var uv of xmlDoc.getElementsByTagName("uv")) {
		uvs.push(parseFloat(uv.getAttribute("u")));
		// undo the flipping we do for some reason in the io_export_petgame_mesh.py script...
		uvs.push(1.0 - parseFloat(uv.getAttribute("v")));
	}

	var indices = Array(vertices.length / 3).fill().map((x,i)=>i);

	return {
		"indices": indices,
		"uvs": uvs,
		"verts": vertices
	};
}

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
	//_renderer.drawProjection(_thing, _thingTwo);
	//_renderer.drawOrtho(_orthoThing);
	_renderer.draw(_text, _colorQuad);
};

window.onload = function() {  
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
  _renderer = new Renderer();

  Promise.all([
    loadResource('data/test.json'),
    loadImage('images/sparrow_texture.png'),
    loadResource('data/alpha.json'),
    loadImage('images/alpha_plex.png'),
    loadResource('data/paint.json'),
    loadResource('data/box.json'),
    loadImage('images/red.png'),
    loadResource('data/mesh_person_harvest.xml'),
    loadImage('images/uv_joe.png')
  ])
  .then(data => {
    /*
    _renderer.initProjection(gl, (program) => {  
      _thing = new Thing(gl, JSON.parse(data[0]), data[1], program);
      _thingTwo = new Thing(gl, JSON.parse(data[0]), data[1], program);
    });
    _renderer.initOrtho(gl, (program) => {
      //_orthoThing = new OrthoThing(gl, JSON.parse(data[5]), data[6]);
      _orthoThing = new OrthoThing(gl, parseXMLMesh(data[7]), data[8], program);
    });
    */
    _renderer.init(gl, () => {
      _text = new RenderText(gl, JSON.parse(data[2]), data[3], 32);
      _text.updateText('hello world');
      _colorQuad = new ColorQuad(gl, JSON.parse(data[4]));
    });
    renderTick(); 
  }); 
  
  document.getElementById("str").addEventListener("input", function(e) {
    _text.updateText(e.currentTarget.value);
  });
};
