//Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

//QUESTIONS
//ARRAYS VS VARS (Camera,Cannon,Wall)???

// GLOBAL VARIABLES
// The first entry of the camera array (index 0) is ignored to make the code more intuitive
// (for example, camera[1] is the first camera that you switch to by pressing 1, etc.)

var numberOfBalls = 8//prompt("How many balls do you want");

var camera = new Array(3).fill(null);
var cannon = new Array(3).fill(null);
var current_camera = 0, current_cannon = 1;
var scene, renderer, leftWall, middleWall, rightWall
var geometry, material, mesh;
var aspectRatio = window.innerHeight / window.innerWidth;
var frustumSize = 250;
var currentTime, previousTime, timeInterval;
var linearVelocity = 0.1;
var angularVelocity = 0.0025;
var aceleration = 0.005;

var balls = [];

var KeyboardState = {
    32: false, //space
    37: false, //left
    39: false, //right
    49: false, //1
    50: false, //2
    51: false, //3
    69: false, //E
    81: false, //Q
    82: false, //R
    87: false //W
};

//INPUT
onkeydown = onkeyup = function (e) {
    KeyboardState[e.keyCode] = e.type == "keydown";
    if (KeyboardState[32]) {
        //space
        cannon[current_cannon].fire()
    }
    if (KeyboardState[82]) {
        balls.map((ball) =>
            ball.toggleAxes())
    }
};

// ------ OBJECT CLASSES ------ //

class Wall extends THREE.Object3D {
    constructor(x, y, z, rotateY) {
        super();
        this.name = "Wall";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xf0e895
        });
        this.height = 20;
        this.width = 100;
        this.depth = 3;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        addRectangularPrism(
            this,
            this.width,
            this.height,
            this.depth,
            this.material,
            rotateY //flag
        );
    }
}

class Ball extends THREE.Object3D {
    constructor(x, y, z, direction, move) {
        super();
        this.name = "Ball";
        this.radius = 3;
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xffffff
        });
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.rotation.y = direction;
        this.move = move
        this.time = 20

        this.axes = new THREE.AxesHelper(20);
        this.displayAxes = false;
        addSphere(
            this,
            this.radius,
            this.material
        );
    }
    getTime() {
        return this.time;
    }
    hasColision() {

    }
    toggleAxes() {
        this.displayAxes = !this.displayAxes;
        this.displayAxes ? this.add(this.axes) : this.remove(this.axes)
    }
}

class Cannon extends THREE.Object3D {
    constructor(x, y, z, angle) {
        super();
        this.name = "Cannon";
        this.selected = false;
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0x8e8e8c
        });
        this.length = 15;
        this.radius = 3.5;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.rotation.y = angle;
        addCylinder(this, this.radius, this.length, this.material)

    }
    getRotationY() {
        return this.rotation.y;
    }
    fire() {
        var ball = new Ball(
            this.position.x,
            this.position.y,
            this.position.z,
            this.rotation.y,
            true)
        scene.add(ball)
        balls.push(ball)
    }
}
// ------ GEOMETRIES ------ //

function addCylinder(obj, radius, height, material) {
    geometry = new THREE.CylinderGeometry(radius, radius, height, 15);
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateZ(Math.PI / 2);

    obj.add(mesh);
}


function addSphere(obj, radius, material) {
    geometry = new THREE.SphereGeometry(radius, 20, 20);
    mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
}

function addRectangularPrism(obj, dimX, dimY, dimZ, material, rotateY) {
    geometry = new THREE.BoxGeometry(dimX, dimY, dimZ);
    mesh = new THREE.Mesh(geometry, material);
    if (rotateY)
        mesh.rotateY(Math.PI / 2);
    obj.add(mesh);
}
// ------ CAMERAS ------ //

function createCamera1() {
    camera[0] = new THREE.OrthographicCamera(
        frustumSize / -2,
        frustumSize / 2,
        (frustumSize * aspectRatio) / 2,
        (frustumSize * aspectRatio) / -2,
        -100,
        100
    );
    camera[0].position.x = 0;
    camera[0].position.y = 1;
    camera[0].position.z = 0;
    camera[0].lookAt(scene.position);
}

function createCamera2() {
    camera[1] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[1].position.x = 50;
    camera[1].position.y = 70;
    camera[1].position.z = 0;
    camera[1].lookAt(scene.position);
}

function createCamera3() {
    //TODO
    camera[2] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[2].position.x = 50;
    camera[2].position.y = 70;
    camera[2].position.z = 25;
    camera[2].lookAt(scene.position);
}

// ------ FUNCTIONS ------ //

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerHeight / window.innerWidth;

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera[0].left = frustumSize / -2;
        camera[0].right = frustumSize / 2;
        camera[0].top = (frustumSize * aspectRatio) / 2;
        camera[0].bottom = (-frustumSize * aspectRatio) / 2;
        camera[0].updateProjectionMatrix();

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
    }
}

function createScene() {
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(50));

    leftWall = new Wall(-51.5, 0, 51.5, false);
    middleWall = new Wall(-100, 0, 0, true);
    rightWall = new Wall(-51.5, 0, -51.5, false);

    cannon[0] = new Cannon(20, 0, 40, -0.3);
    cannon[1] = new Cannon(20, 0, 0, 0);
    cannon[2] = new Cannon(20, 0, -40, 0.3);

    for (let i = 0; i < numberOfBalls; i++) {
        var ball = new Ball(-92.5 * Math.random() - 3, 0, Math.random() < 0.5 ?
            47 * Math.random() : -47 * Math.random(), 0, false)
        balls.push(ball)
        scene.add(ball)
    }
    console.log(balls)
    scene.add(cannon[0]);
    scene.add(cannon[1]);
    scene.add(cannon[2]);

    scene.add(leftWall);
    scene.add(middleWall);
    scene.add(rightWall);
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

    balls.forEach(ball => {
        if (ball.move)
            ball.translateX(-linearVelocity * ball.time +
                (aceleration * Math.pow(ball.time, 2)) / 2);
        if (ball.time > 0)
            ball.time -= 0.1
        else {
            ball.time = 0
        }
    });
    // if (KeyboardState[32]) {
    //SPACE

    //}
    if (KeyboardState[37]) {
        if (cannon[current_cannon].getRotationY() < 0.8)
            cannon[current_cannon].rotateY(timeInterval * angularVelocity)
    }
    if (KeyboardState[39]) {
        if (cannon[current_cannon].getRotationY() > -0.8)
            cannon[current_cannon].rotateY(timeInterval * -angularVelocity)
    }
    if (KeyboardState[49]) {
        //1
        current_camera = 0;
    }
    if (KeyboardState[50]) {
        //2
        current_camera = 1;
    }
    if (KeyboardState[51]) {
        //3
        current_camera = 2;
    }
    if (KeyboardState[69]) {
        //E
        current_cannon = 2;
    }
    if (KeyboardState[81]) {
        //Q
        current_cannon = 0;
    }

    if (KeyboardState[87]) {
        //W
        current_cannon = 1;
    }
}