"use strict";

// GLOBAL VARIABLES
// The first entry of the camera array (index 0) is ignored to make the code more intuitive
// (for example, camera[1] is the first camera that you switch to by pressing 1, etc.)
var camera = new Array(4).fill(null)
var scene, renderer,body;
var geometry, material,mesh;
var current_camera = 1;

var Speed = 0.5;

//document.addEventListener("keydown", onKeyDown);
//document.addEventListener("keyup",   onKeyUp);

var KeyboardState = {
  37: false, //left
  38: false, //up
  39: false, //right
  40: false, //down
  49: false, //1
  50: false, //2
  51: false, //3
  65: false, //A
  68: false, //D
  70: false, //F
  83: false, //S
  87: false //W
};

onkeydown = onkeyup = function(e){
  e = e || event; // to deal with IE
  KeyboardState[e.keyCode] = e.type == 'keydown';
  if (KeyboardState[37]){
    console.log('left')
    body.position.z+=Speed;2
  }
  if (KeyboardState[38]){
    console.log('up')
    body.position.x-=Speed;
  }
  if (KeyboardState[39]){
    console.log('right')
    body.position.z-=Speed;
  }
  if (KeyboardState[40]){
    console.log('down')
    body.position.x+=Speed;
  }
  if (KeyboardState[49]){
    current_camera=1;
  }
  if (KeyboardState[50]){
    current_camera=2;
  }
  if (KeyboardState[70]){
    scene.traverse(function (node) {
      if (node instanceof THREE.Mesh){
        node.material.wireframe= !node.material.wireframe;
      }
    });
  }
  render()
}


// CLASSES


// FUNCTIONS

function render() {
  'use strict';
  renderer.render(scene, camera[current_camera]);
}

function onResize() {

}


// IMPORTANT: THESE ARE PLACEHOLDER VALUES/PARAMETERS
function createCamera1() {
    camera[1] = new THREE.PerspectiveCamera(70, window.innerWidth/
      window.innerHeight, 1, 1000);
    camera[1].position.x = 50;
    camera[1].position.y = 50;
    camera[1].position.z = 50;
    camera[1].lookAt(scene.position);
}

function createCamera2() {
  camera[2] = new THREE.PerspectiveCamera(100, window.innerWidth/
    window.innerHeight, 1, 1000);
  camera[2].position.x = 50;
  camera[2].position.y = 0;
  camera[2].position.z = 0;
  camera[2].lookAt(scene.position);
}

function createCamera3() {

}

function addSphere(obj,x,y,z,color,radius){
  'use strict';
  geometry = new THREE.SphereGeometry(radius,10,10);
  material = new THREE.MeshBasicMaterial({
    color:color, wireframe:true
  });
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  obj.add(mesh);
}
function addRectangularPrism(obj,x,y,z,color,dimX,dimY,dimZ){
  'use strict';
  geometry = new THREE.CubeGeometry(dimX,dimY,dimZ);
  material = new THREE.MeshBasicMaterial({
    color:color, wireframe:true
  });
  mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  obj.add(mesh);
}

function createBody(x,y,z){
  'use strict';
  body = new THREE.Object3D();
  material = new THREE.MeshBasicMaterial({ color:0x00ff00, wireframe:true});

  //Structure
  addRectangularPrism(body,0,0,0,0x00ff00,30,3,30);
  addSphere(body,12,-3,12,0xff0000,2);
  addSphere(body,12,-3,-12,0xff0000,2);
  addSphere(body,-12,-3,12,0xff0000,2);
  addSphere(body,-12,-3,-12,0xff0000,2);
  //Arm
  addSphere(body,0,1.5,0,0xffff00,3);
  addSphere(body,0,23,0,0xffff00,2);
  addRectangularPrism(body,0,12,0,0xffffff,2,20,2);

  scene.add(body);
  body.position.x=x;
  body.position.y=y;
  body.position.z=z;
}

function createScene() {
  'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10)); // DELETE LATER
    createBody(0,0,0);
}

function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera1();
    createCamera2();
    createCamera3();

    render();

    window.addEventListener("resize", onResize);
}

function animate() {
    render();
    requestAnimationFrame(animate);
}
