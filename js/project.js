"use strict";

// GLOBAL VARIABLES
// The first entry of the camera array (index 0) is ignored to make the code more intuitive
// (for example, camera[1] is the first camera that you switch to by pressing 1, etc.)
var camera = new Array(4).fill(null)
var scene, renderer, robot, target, support,arm;
var geometry, material,mesh;
var current_camera = 1;

var Speed = 0.5;

var KeyboardState = {
  37: false, //left
  38: false, //up
  39: false, //right
  40: false, //down
  49: false, //1
  50: false, //2
  51: false, //3
  52: false, //4
  65: false, //A
  81: false, //Q
  83: false, //S
  87: false //W
};

onkeydown = onkeyup = function(e){
  e = e || event; // to deal with IE
  KeyboardState[e.keyCode] = e.type == 'keydown';
  if (KeyboardState[37]){
    console.log('left')
    robot.position.x-=Speed;
  }
  if (KeyboardState[38]){
    console.log('up')
    robot.position.z-=Speed;
  }
  if (KeyboardState[39]){
    console.log('right')
    robot.position.x+=Speed;
  }
  if (KeyboardState[40]){
    console.log('down')
    robot.position.z+=Speed;
  }
  if (KeyboardState[49]){
    current_camera=1;
  }
  if (KeyboardState[50]){
    current_camera=2;
  }
  if (KeyboardState[51]){
    current_camera=3;
  }
  if (KeyboardState[52]){
    scene.traverse(function (node) {
      if (node instanceof THREE.Mesh){
        node.material.wireframe= !node.material.wireframe;
      }
    });
  }
  if (KeyboardState[65]){ //A
    arm.rotation.y+=0.04;
  }
  if (KeyboardState[83]){//S
  arm.rotation.y-=0.04;
  }

  if (KeyboardState[81]){//Q
    if (arm.rotation.z<1)
      arm.rotation.z+=0.04;
  }
  if (KeyboardState[87]){//W
    if (arm.rotation.z>-1)
      arm.rotation.z-=0.04;
  }
  render()
}

// CLASSES

class Arm extends THREE.Object3D{
  constructor(){
    super();
    //Arm
    addRectangularPrism(this,0,11.5,0,0xffffff,2,20,2);
    //Forearm
    addSphere(this,0,21.5,0,0xffff00,2);
    addRectangularPrism(this,10,21.5,0,0xffffff,20,2,2);
    //Hand
    addSphere(this,20,21.5,0,0xffff00,2);
    addRectangularPrism(this,22.5,21.5,0,0x0000ff,1,5,5);
    addRectangularPrism(this,25,23.5,0,0xff0000,4,0.5,0.5);
    addRectangularPrism(this,25,19.5,0,0xff0000,4,0.5,0.5);
    robot.add(this);
  }
 }

class Robot extends THREE.Object3D{
  constructor(x,y,z){
    super();
    this.WheelRadius=2;
    this.boardHeight=3
    addRectangularPrism(this,0,0,0,0x00ff00,30,this.boardHeight,30);
    addSphere(this,12,-3.5,12,0xff0000,this.WheelRadius);
    addSphere(this,12,-3.5,-12,0xff0000,this.WheelRadius);
    addSphere(this,-12,-3.5,12,0xff0000,this.WheelRadius);
    addSphere(this,-12,-3.5,-12,0xff0000,this.WheelRadius);
    addSemiSphere(this,0,1.5,0,0xffff00,4);
    this.position.x=x;
    this.position.y=y;
    this.position.z=z;
    scene.add(this);
  }
}

class Target extends THREE.Object3D{
  constructor(x,y,z){
    super();
    addTorus(this,0,0,0,0xff00ff,2,1);
    this.position.x=x;
    this.position.y=y;
    this.position.z=z;
    scene.add(this);
  }
}
class Support extends THREE.Object3D{
  constructor(x,y,z){
    super();
    addCylinder(this,0,0,0,0x0000ff,4,20);
    this.position.x=x;
    this.position.y=y;
    this.position.z=z;
    scene.add(this);
  }
}
// FUNCTIONS

function render() {
  renderer.render(scene, camera[current_camera]);
}

function onResize() {

}


// IMPORTANT: THESE ARE PLACEHOLDER VALUES/PARAMETERS
function createCamera1() {
    camera[1] = new THREE.PerspectiveCamera(70, window.innerWidth/
    window.innerHeight, 1, 1000);
    camera[1].position.x =0;
    camera[1].position.y = 170;
    camera[1].position.z = 0;
    camera[1].lookAt(scene.position);
}

function createCamera2() {
  camera[2] = new THREE.PerspectiveCamera(70, window.innerWidth/
    window.innerHeight, 1, 1000);
  camera[2].position.x = 0;
  camera[2].position.y = 0;
  camera[2].position.z = 205;
  camera[2].lookAt(scene.position);
}

function createCamera3() {
  camera[3] = new THREE.PerspectiveCamera(70, window.innerWidth/
    window.innerHeight, 1, 1000);
  camera[3].position.x =-100;
  camera[3].position.y = 0;
  camera[3].position.z = 0;
  camera[3].lookAt(scene.position);
}


function addCylinder(obj,x,y,z,color,radius,height){
    geometry = new THREE.CylinderGeometry(radius,radius,height, 15);
    material = new THREE.MeshBasicMaterial({
      color:color, wireframe:true
    });

    mesh = new THREE.Mesh(geometry,material);
    mesh.position.set(x,y,z);
    obj.add(mesh);
}

function addTorus(obj,x,y,z,color,radius,tube) {
  geometry = new THREE.TorusGeometry(radius+tube,tube,20,20);
  material = new THREE.MeshBasicMaterial({
    color:color, wireframe:true
  });
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  mesh.rotateY(Math.PI / 2);
  obj.add(mesh);
}

function addSemiSphere(obj,x,y,z,color,radius){
    geometry = new THREE.SphereGeometry(radius,20,20,0, Math.PI*2, 0, Math.PI/2);
    material = new THREE.MeshBasicMaterial({
      color:color, wireframe:true
    });
    mesh = new THREE.Mesh(geometry,material);
    mesh.position.set(x,y,z);
    obj.add(mesh);
}

function addSphere(obj,x,y,z,color,radius){
      geometry = new THREE.SphereGeometry(radius,20,20);
  material = new THREE.MeshBasicMaterial({
    color:color, wireframe:true
  });
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  obj.add(mesh);
}
function addRectangularPrism(obj,x,y,z,color,dimX,dimY,dimZ){
  geometry = new THREE.BoxGeometry(dimX,dimY,dimZ);
  material = new THREE.MeshBasicMaterial({
    color:color, wireframe:true
  });
  mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  obj.add(mesh);
}

function createScene() {
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10)); // DELETE LATER
    robot=new Robot(0,0,0);
    arm = new Arm(robot);
    support=new Support (60,10-robot.WheelRadius*2-robot.boardHeight/2,0);
    target=new Target(60,24-robot.WheelRadius*2-robot.boardHeight/2,0);
}

function init() {
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
    requestAnimationFrame(animate);
    render();
}
