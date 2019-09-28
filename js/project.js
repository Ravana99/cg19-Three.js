//Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

// GLOBAL VARIABLES
// The first entry of the camera array (index 0) is ignored to make the code more intuitive
// (for example, camera[1] is the first camera that you switch to by pressing 1, etc.)

var camera = new Array(4).fill(null);
var current_camera = 1;

var scene, renderer, robot, target, support;
var geometry, material, mesh;

var WidthHeight= new THREE.Vector2(window.innerWidth,window.innerHeight);

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


//INPUT
onkeydown = onkeyup = function(e) {
  	e = e || event; // to deal with IE
	KeyboardState[e.keyCode] = e.type == 'keydown';
	  
  	if (KeyboardState[37]) { //left
		robot.position.x-=Speed;
  	}
  	if (KeyboardState[38]) { //up
		robot.position.z-=Speed;
  	}
  	if (KeyboardState[39]) { //right
		robot.position.x+=Speed;
  	}
  	if (KeyboardState[40]) { //down
		robot.position.z+=Speed;
  	}
  	if (KeyboardState[49]) { //1
		current_camera=1;
  	}
  	if (KeyboardState[50]) { //2
		current_camera=2;
  	}
  	if (KeyboardState[51]) { //3
		current_camera=3;
  	}
  	if (KeyboardState[52]) { //4
		scene.traverse(function (node) {
	  	if (node instanceof THREE.Mesh){
			node.material.wireframe= !node.material.wireframe;
	  	}
		});
  	}
  	if (KeyboardState[65]) { //A
		robot.rotateArmY(0.04);
  	}
  	if (KeyboardState[83]) { //S
		robot.rotateArmY(-0.04);
  	}
  	if (KeyboardState[81]) { //Q
		if (robot.getArmRotationZ() < 1) robot.rotateArmZ(0.04);
  	}
  	if (KeyboardState[87]) { //W
		if (robot.getArmRotationZ() > -0.75) robot.rotateArmZ(-0.04);
  	}
	render();
}


// ------ OBJECT CLASSES ------ //

class Arm extends THREE.Object3D {
  	constructor() {
		super();
		this.armLength = 2;
		this.armHeight = 20;
		this.articulationRadius = 2;
		this.handHeight = 1;
		this.handLength = 5;
		this.fingerHeight = 4;
		this.fingerLength = 0.5;

		//Arm
		addRectangularPrism(this,0,17,0,0xffffff,this.armLength,this.armHeight,this.armLength);

		//Forearm
		addSphere(this,0,27,0,0xffff00,this.articulationRadius);
		addRectangularPrism(this,10,27,0,0xffffff,this.armHeight,this.armLength,this.armLength);

		//Hand
		addSphere(this,20,27,0,0xffff00,this.articulationRadius);
		addRectangularPrism(this,22.5,27,0,0x0000ff,this.handHeight,this.handLength,this.handLength);
		addRectangularPrism(this,25,29,0,0xff0000,this.fingerHeight,this.fingerLength,this.fingerLength);
		addRectangularPrism(this,25,25,0,0xff0000,this.fingerHeight,this.fingerLength,this.fingerLength);
  	}
  	getRotationZ() {
		return this.rotation.z;
  	}
  	rotateY(angle) {
		this.rotation.y += angle;
  	}
  	rotateZ(angle) {
		this.rotation.z += angle;
  	}
 }

class Platform extends THREE.Object3D {
	constructor() {
		super();
		this.boardLength = 30;
		this.boardHeight = 3;
		this.wheelRadius = 2;
		this.semisphereRadius = 4;

		//Base
		addRectangularPrism(this,0,5.5,0,0x00ff00,this.boardLength,this.boardHeight,this.boardLength);
		addSemiSphere(this,0,7,0,0xffff00,this.semisphereRadius);

		//Wheels
		addSphere(this,12,2,12,0xff0000,this.wheelRadius);
		addSphere(this,12,2,-12,0xff0000,this.wheelRadius);
		addSphere(this,-12,2,12,0xff0000,this.wheelRadius);
		addSphere(this,-12,2,-12,0xff0000,this.wheelRadius);
	}
}

class Robot extends THREE.Object3D {
  	constructor(x,y,z) {
		super();

		this.platform = new Platform();
		this.arm = new Arm();
		this.add(this.platform);
		this.attach(this.arm);

		this.position.x = x;
		this.position.y = y;
		this.position.z = z;

		scene.add(this);
  	}
  	getArmRotationZ() {
		return this.arm.getRotationZ();
  	}
  	rotateArmY(angle) {
		this.arm.rotateY(angle);
  	}
  	rotateArmZ(angle) {
		this.arm.rotateZ(angle);
  	}
}

class Target extends THREE.Object3D {
  	constructor(x,y,z) {
		super();
		this.innerRadius = 2;
		this.tubeRadius = 1;

		addTorus(this,0,5.5,0,0xff00ff,this.innerRadius,this.tubeRadius);

		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		scene.add(this);
  	}
}

class Support extends THREE.Object3D {
  	constructor(x,y,z) {
		super();
		this.supportRadius = 4;
		this.supportHeight = 20;

		addCylinder(this,0,5.5,0,0x0000ff,this.supportRadius,this.supportHeight);

		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		scene.add(this);
  	}
}


// ------ GEOMETRIES ------ //

function addCylinder(obj,x,y,z,color,radius,height) {
	geometry = new THREE.CylinderGeometry(radius,radius,height,15);
	material = new THREE.MeshBasicMaterial({
	  color: color, wireframe: true
	});

	mesh = new THREE.Mesh(geometry,material);
	mesh.position.set(x,y,z);
	obj.add(mesh);
}

function addTorus(obj,x,y,z,color,radius,tube) {
  	geometry = new THREE.TorusGeometry(radius+tube,tube,20,20);
  	material = new THREE.MeshBasicMaterial({
		color: color, wireframe: true
  	});
  	mesh = new THREE.Mesh(geometry,material);
  	mesh.position.set(x,y,z);
  	mesh.rotateY(Math.PI / 2);
  	obj.add(mesh);
}

function addSemiSphere(obj,x,y,z,color,radius) {
	geometry = new THREE.SphereGeometry(radius,20,20,0,Math.PI*2,0,Math.PI/2);
	material = new THREE.MeshBasicMaterial({
	  color: color, wireframe: true
	});
	mesh = new THREE.Mesh(geometry,material);
	mesh.position.set(x,y,z);
	obj.add(mesh);
}

function addSphere(obj,x,y,z,color,radius) {
  	geometry = new THREE.SphereGeometry(radius,20,20);
  	material = new THREE.MeshBasicMaterial({
		color: color, wireframe: true
  	});
  	mesh = new THREE.Mesh(geometry,material);
  	mesh.position.set(x,y,z);
  	obj.add(mesh);
}

function addRectangularPrism(obj,x,y,z,color,dimX,dimY,dimZ) {
	geometry = new THREE.BoxGeometry(dimX,dimY,dimZ);
	material = new THREE.MeshBasicMaterial({
		color: color, wireframe: true
  	});
  	mesh = new THREE.Mesh(geometry,material);
  	mesh.position.set(x,y,z);
  	obj.add(mesh);
}


// ------ CAMERAS ------ //

function createCamera1() {
	camera[1] = new THREE.PerspectiveCamera(70,window.innerWidth/
	window.innerHeight,1,1000);

	camera[1].position.x = 0;
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
  	camera[3] = new THREE.PerspectiveCamera(70,window.innerWidth/
	window.innerHeight,1,1000);

  	camera[3].position.x = -100;
  	camera[3].position.y = 0;
  	camera[3].position.z = 0;
  	camera[3].lookAt(scene.position);
}


// ------ FUNCTIONS ------ //

function onResize() {
	renderer.setSize(window.innerWidth,window.innerHeight);
	if (window.innerHeight > 0 && window.innerWidth > 0) {
	  renderer.getSize(WidthHeight);
	  camera[1].aspect = WidthHeight.x / WidthHeight.y;
	  camera[2].aspect = WidthHeight.x / WidthHeight.y;
	  camera[3].aspect = WidthHeight.x / WidthHeight.y;
	  camera[1].updateProjectionMatrix();
	  camera[2].updateProjectionMatrix();
	  camera[3].updateProjectionMatrix();
	}
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(10)); // DELETE LATER

	robot = new Robot(0,0,0);
	support = new Support (60,4.5,0);
	target = new Target(60,18.5,0);
}

function render() {
	renderer.render(scene,camera[current_camera]);
}

function init() {
	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setSize(window.innerWidth,window.innerHeight);
	document.body.appendChild(renderer.domElement);

	createScene();
	createCamera1();
	createCamera2();
	createCamera3();

	render();

	window.addEventListener("resize",onResize);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}
