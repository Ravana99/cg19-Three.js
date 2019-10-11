//Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

// GLOBAL VARIABLES
// The first entry of the camera array (index 0) is ignored to make the code more intuitive
// (for example, camera[1] is the first camera that you switch to by pressing 1, etc.)

var camera = new Array(4).fill(null);
var current_camera = 1;
var scene, renderer, robot, target, support;
var geometry, material, mesh;

var aspectRatio = window.innerHeight / window.innerWidth;
var frustumSize = 250;

var currentTime, previousTime, timeInterval;
var linearVelocity = 0.05;
var angularVelocity = 0.0025;

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
  KeyboardState[e.keyCode] = e.type == "keydown";
  if (KeyboardState[52]) {
    //4
    scene.traverse(function(node) {
      if (node instanceof THREE.Mesh) {
        if (node.parent.name === "Platform")
          node.material.wireframe = !node.material.wireframe;
        else if (node.parent.name === "Arm")
          node.material.wireframe = !node.material.wireframe;
        else if (node.parent.name === "Support")
          node.material.wireframe = !node.material.wireframe;
        else if (node.parent.name === "Target")
          node.material.wireframe = !node.material.wireframe;
      }
    });
  }
};

// ------ OBJECT CLASSES ------ //

class Arm extends THREE.Object3D {
  constructor() {
    super();
    this.name = "Arm";
    this.armLength = 2;
    this.armHeight = 20;
    this.articulationRadius = 2;
    this.handHeight = 1;
    this.handLength = 5;
    this.fingerHeight = 4;
    this.fingerLength = 0.5;
    //Arm
    addRectangularPrism(
      this,
      0,
      this.armHeight / 2,
      0,
      0x8e8e8c,
      this.armLength,
      this.armHeight,
      this.armLength
    );

    //Forearm
    addSphere(
      this,
      0,
      this.armHeight + 1,
      0,
      0xe7f416,
      this.articulationRadius
    );
    addRectangularPrism(
      this,
      this.armHeight / 2,
      this.armHeight + 1,
      0,
      0x8e8e8c,
      this.armHeight,
      this.armLength,
      this.armLength
    );

    //Hand
    addSphere(
      this,
      this.armHeight,
      this.armHeight + 1,
      0,
      0xe7f416,
      this.articulationRadius
    );
    addRectangularPrism(
      this,
      this.armHeight + 2.5,
      this.armHeight + 1,
      0,
      0x8e8e8c,
      this.handHeight,
      this.handLength,
      this.handLength
    );
    addRectangularPrism(
      this,
      this.armHeight + 5,
      this.armHeight + 3,
      0,
      0xe7f416,
      this.fingerHeight,
      this.fingerLength,
      this.fingerLength
    );
    addRectangularPrism(
      this,
      this.armHeight + 5,
      this.armHeight - 1,
      0,
      0xe7f416,
      this.fingerHeight,
      this.fingerLength,
      this.fingerLength
    );
    this.position.x = 0;
    this.position.y = 8;
    this.position.z = 0;
  }
  getRotationZ() {
    return this.rotation.z;
  }
  rotateeY(angle) {
    this.rotation.y += angle;
  }
  rotateeZ(angle) {
    this.rotation.z += angle;
  }
}

class Platform extends THREE.Object3D {
  constructor() {
    super();
    this.name = "Platform";
    this.boardLength = 30;
    this.boardHeight = 3;
    this.wheelRadius = 2;
    this.semisphereRadius = 4;

    //Base
    addRectangularPrism(
      this,
      0,
      this.boardHeight + this.wheelRadius + 0.5,
      0,
      0x626262,
      this.boardLength,
      this.boardHeight,
      this.boardLength
    );
    addSemiSphere(this, 0, 7, 0, 0xefdb16, this.semisphereRadius);

    //Wheels
    addSphere(this, 12, this.wheelRadius, 12, 0xffffff, this.wheelRadius);
    addSphere(this, 12, this.wheelRadius, -12, 0xffffff, this.wheelRadius);
    addSphere(this, -12, this.wheelRadius, 12, 0xffffff, this.wheelRadius);
    addSphere(this, -12, this.wheelRadius, -12, 0xffffff, this.wheelRadius);
  }
}

class Robot extends THREE.Object3D {
  constructor(x, y, z) {
    super();
    this.name = "Robot";
    this.platform = new Platform();
    this.arm = new Arm();
    this.attach(this.platform);
    this.attach(this.arm);
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }
  getArmRotationZ() {
    return this.arm.getRotationZ();
  }
  rotateArmY(angle) {
    this.arm.rotateeY(angle);
  }
  rotateArmZ(angle) {
    this.arm.rotateeZ(angle);
  }
}

class Target extends THREE.Object3D {
  constructor(x, y, z) {
    super();
    this.name = "Target";
    this.innerRadius = 2;
    this.tubeRadius = 1;

    addTorus(this, 0, 0, 0, 0x26e700, this.innerRadius, this.tubeRadius);

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }
}

class Support extends THREE.Object3D {
  constructor(x, y, z) {
    super();
    this.name = "Support";
    this.supportRadius = 4;
    this.supportHeight = 22;
    addCylinder(
      this,
      0,
      11,
      0,
      0xf0f067,
      this.supportRadius,
      this.supportHeight
    );
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }
}

// ------ GEOMETRIES ------ //

function addCylinder(obj, x, y, z, color, radius, height) {
  geometry = new THREE.CylinderGeometry(radius, radius, height, 15);
  material = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addTorus(obj, x, y, z, color, radius, tube) {
  geometry = new THREE.TorusGeometry(radius + tube, tube, 20, 20);
  material = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotateY(Math.PI / 2);
  obj.add(mesh);
}

function addSemiSphere(obj, x, y, z, color, radius) {
  geometry = new THREE.SphereGeometry(
    radius,
    20,
    20,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  material = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addSphere(obj, x, y, z, color, radius) {
  geometry = new THREE.SphereGeometry(radius, 20, 20);
  material = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addRectangularPrism(obj, x, y, z, color, dimX, dimY, dimZ) {
  geometry = new THREE.BoxGeometry(dimX, dimY, dimZ);
  material = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

// ------ CAMERAS ------ //

function createCamera1() {
  camera[1] = new THREE.OrthographicCamera(
    frustumSize / -2,
    frustumSize / 2,
    (frustumSize * aspectRatio) / 2,
    (frustumSize * aspectRatio) / -2,
    -100,
    100
  );
  camera[1].position.x = 0;
  camera[1].position.y = 1;
  camera[1].position.z = 0;
  camera[1].lookAt(scene.position);
}

function createCamera2() {
  camera[2] = new THREE.OrthographicCamera(
    frustumSize / -2,
    frustumSize / 2,
    (frustumSize * aspectRatio) / 2,
    (frustumSize * aspectRatio) / -2,
    -100,
    100
  );
  camera[2].position.x = 0;
  camera[2].position.y = 0;
  camera[2].position.z = 0;
  camera[2].lookAt(scene.position);
}

function createCamera3() {
  camera[3] = new THREE.OrthographicCamera(
    frustumSize / -2,
    frustumSize / 2,
    (frustumSize * aspectRatio) / 2,
    (frustumSize * aspectRatio) / -2,
    -100,
    100
  );
  camera[3].position.x = 1;
  camera[3].position.y = 0;
  camera[3].position.z = 0;
  camera[3].lookAt(scene.position);
}

// ------ FUNCTIONS ------ //

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  aspectRatio = window.innerHeight / window.innerWidth;

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    camera[1].left = frustumSize / -2;
    camera[1].right = frustumSize / 2;
    camera[1].top = (frustumSize * aspectRatio) / 2;
    camera[1].bottom = (-frustumSize * aspectRatio) / 2;
    camera[1].updateProjectionMatrix();

    camera[2].left = frustumSize / -2;
    camera[2].right = frustumSize / 2;
    camera[2].top = (frustumSize * aspectRatio) / 2;
    camera[2].bottom = (-frustumSize * aspectRatio) / 2;
    camera[2].updateProjectionMatrix();

    camera[3].left = frustumSize / -2;
    camera[3].right = frustumSize / 2;
    camera[3].top = (frustumSize * aspectRatio) / 2;
    camera[3].bottom = (-frustumSize * aspectRatio) / 2;
    camera[3].updateProjectionMatrix();
  }
  render();
}

function createScene() {
  scene = new THREE.Scene();
  robot = new Robot(-60, 0, 0);
  support = new Support(60, 0, 0);
  target = new Target(60, 26, 0);
  scene.add(robot);
  scene.add(support);
  scene.add(target);
}

function render() {
  renderer.render(scene, camera[current_camera]);
}

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  createScene();
  createCamera1();
  createCamera2();
  createCamera3();
  window.addEventListener("resize", onResize);
}

function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}

function update() {
  currentTime = new Date().getTime();
  timeInterval = currentTime - previousTime;
  previousTime = currentTime;
  if (KeyboardState[37]) {
    //left
    robot.translateZ(-timeInterval * linearVelocity);
  }
  if (KeyboardState[38]) {
    //up
    robot.translateX(timeInterval * linearVelocity);
  }
  if (KeyboardState[39]) {
    //right
    robot.translateZ(timeInterval * linearVelocity);
  }
  if (KeyboardState[40]) {
    //down
    robot.translateX(-timeInterval * linearVelocity);
  }
  if (KeyboardState[49]) {
    //1
    current_camera = 1;
  }
  if (KeyboardState[50]) {
    //2
    current_camera = 2;
  }
  if (KeyboardState[51]) {
    //3
    current_camera = 3;
  }
  if (KeyboardState[65]) {
    //A
    robot.rotateArmY(timeInterval * angularVelocity);
  }
  if (KeyboardState[83]) {
    //S
    robot.rotateArmY(-timeInterval * angularVelocity);
  }
  if (KeyboardState[81]) {
    //Q
    if (robot.getArmRotationZ() < 1)
      robot.rotateArmZ(timeInterval * angularVelocity);
  }
  if (KeyboardState[87]) {
    //W
    if (robot.getArmRotationZ() > -0.8)
      robot.rotateArmZ(-timeInterval * angularVelocity);
  }
}
