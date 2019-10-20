//Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

//QUESTIONS
//ARRAYS VS VARS (Camera,Cannon,Wall)???

// GLOBAL VARIABLES

var numberOfBalls = 8;

const MAX_X = 40;
const MAX_Z = 47;
const MIN_X = -44;
const MIN_Z = -47;

var camera = new Array(3).fill(null);
var cannon = new Array(3).fill(null);
var current_camera = 0, current_cannon = 1;
var scene, renderer, leftWall, middleWall, rightWall, floor
var geometry, material, mesh;
var aspectRatio = window.innerHeight / window.innerWidth;
var frustumSize = 250;
var currentTime, previousTime, timeInterval;
var angularVelocity = 0.002;
var acceleration = 0.001;

var displayAxes = true;

var balls = [];
var walls = [];

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


// ------ INPUT ------ //

onkeydown = onkeyup = function (e) {
    KeyboardState[e.keyCode] = e.type == "keydown";
    if (KeyboardState[32]) {
        //space
        cannon[current_cannon].fire()
    }
    if (KeyboardState[82]) {
        displayAxes = !displayAxes;
        balls.map((ball) =>
            ball.toggleAxes())
    }
};


// ------ OBJECT CLASSES ------ //

class Floor extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Floor";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0x0f0096
        });
        this.height = 2;
        this.width = 100;
        this.depth = 100;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        addRectangularPrism(
            this,
            this.width,
            this.height,
            this.depth,
            this.material,
            false
        );
    }
}
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
    constructor(x, y, z, angle) {
        super();
        this.name = "Ball";
        this.radius = 3;
        this.material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: 0xffffff
        });
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.oldPosition = new THREE.Vector3(x,y,z);
        this.rotation.y = angle;
        this.collided = false;
        this.initialVelocity = Math.random() * 1.5 + 1.5;
        this.currentVelocity = 0;
        this.initialTime = new Date().getTime();

        this.axes = new THREE.AxesHelper(20);
        if (displayAxes)
            this.add(this.axes)
        this.sphere = addSphere(
            this,
            this.radius,
            this.material
        );
    }
    getTime() {
        return this.time;
    }
    toggleAxes() {
        displayAxes ? this.add(this.axes) : this.remove(this.axes);
    }
    rotateBall() {
        this.sphere.rotation.z -= (this.currentVelocity / this.radius);
    }
    checkBallCollision(other) {
        if (this.position.distanceToSquared(other.position) <= (this.radius * 2) ** 2) {
            this.collided = true;
            console.log("ball collision");
            console.log(this);
            console.log(other);
            return true;
        }
        return false;
    }
    checkAllBallCollisions() {
        for (var i = 0; i < balls.length; i++)
            if (this.checkBallCollision(balls[i]))
                return true;
        return false;
    }
    checkWallCollision(other) {
        if (other === walls[0] && this.position.z > MAX_Z) { //left wall
            console.log("left wall collision");
            this.collided = true;
            return true;
        }
        else if (other === walls[1] && this.position.x < MIN_X) { //middle wall
            console.log("middle wall collision");
            this.collided = true;
            return true;
        }
        else if (other === walls[2] && this.position.z < MIN_Z) { //right wall
            console.log("right wall collision");
            this.collided = true;
            return true;
        }
        return false;
    }
    processBallCollision(other) {  
        [this.currentVelocity, other.currentVelocity] = [other.currentVelocity, this.currentVelocity];
        this.initialVelocity = this.currentVelocity;
        other.initialVelocity = other.currentVelocity;
        this.initialTime = new Date().getTime();
        other.initialTime = new Date().getTime();
        if (this.currentVelocity > 0 && other.currentVelocity > 0) {
            this.rotation.y = -this.rotation.y + Math.PI;
            other.rotation.y = -other.rotation.y + Math.PI;
        }
        else if ((this.currentVelocity == 0 && other.currentVelocity > 0) || (this.currentVelocity > 0 && other.currentVelocity == 0))
            [this.rotation.y, other.rotation.y] = [other.rotation.y, this.rotation.y];
    }

    processWallCollision(other) {
        if (other === walls[0]) //left wall
            this.rotation.y = -this.rotation.y;
        else if (other === walls[1]) //middle wall
            this.rotation.y = -this.rotation.y + Math.PI;
        else if (other === walls[2]) //right wall
            this.rotation.y = -this.rotation.y;
    }
    updatePosition() {
        if(this.collided) {
            this.position.set(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
            this.collided = false;
        }
        else {
            this.oldPosition = this.position.clone();
        }
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
        this.rotateZ(Math.PI / 2)
        this.add(new THREE.AxesHelper(20));
        addCylinder(this, this.radius, this.length, this.material)

    }
    getRotationX() {
        return this.rotation.y;
    }
    fire() {
        var ball = new Ball(
            this.position.x,
            this.position.y,
            this.position.z,
            this.rotation.y)
        ball.add(camera[2])
        scene.add(ball)
        balls.push(ball)
        ball.currentVelocity = ball.initialVelocity;
    }
}


// ------ GEOMETRIES ------ //

function addCylinder(obj, radius, height, material) {
    geometry = new THREE.CylinderGeometry(radius, radius, height, 15);
    mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
}


function addSphere(obj, radius, material) {
    geometry = new THREE.SphereGeometry(radius, 20, 5);
    mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
    return mesh;
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
    camera[2] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[2].position.x = cannon[current_cannon].position.x + 20;
    camera[2].position.y = cannon[current_cannon].position.y + 10;
    camera[2].position.z = cannon[current_cannon].position.z;
    camera[2].lookAt(cannon[current_cannon].position);
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

    leftWall = new Wall(0, 0, 51.5, false);
    walls.push(leftWall);
    middleWall = new Wall(-48.5, 0, 0, true);
    walls.push(middleWall);
    rightWall = new Wall(0, 0, -51.5, false);
    walls.push(rightWall);
    floor = new Floor(0, -4, 0);

    cannon[0] = new Cannon(40, 0, 40, -0.3);
    cannon[1] = new Cannon(40, 0, 0, 0);
    cannon[2] = new Cannon(40, 0, -40, 0.3);

    for (let i = 0; i < numberOfBalls; i++) {
        var ball;
        do {
            ball = new Ball(Math.random() < 0.5 ?
                22 * Math.random() : MIN_X * Math.random(), 0, Math.random() < 0.5 ?
                MAX_Z * Math.random() : MIN_Z * Math.random(), 0);
        } while (ball.checkAllBallCollisions());
        
        balls.push(ball);
        scene.add(ball);
    }
    console.log(balls)
    scene.add(cannon[0]);
    scene.add(cannon[1]);
    scene.add(cannon[2]);

    scene.add(leftWall);
    scene.add(middleWall);
    scene.add(rightWall);
    scene.add(floor);
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

function handleCollisions() {
    for (var i = 0; i < balls.length; i++) {
        if (balls[i].position.x > MAX_X) {
            scene.remove(balls[i]);
            balls.splice(i, 1);
            i--;
            continue;
        }

        for (var j = i + 1; j < balls.length; j++)
            if(balls[i].checkBallCollision(balls[j])) {
                console.log(i);
                balls[i].processBallCollision(balls[j]);
                //break;
            }
                
        
        for (var j = 0; j < walls.length; j++)
            if(balls[i].checkWallCollision(walls[j]))
                balls[i].processWallCollision(walls[j]);
    }
}

function cameraUpdate(ball) {
    var offset = new THREE.Vector3(ball.position.x + 20, ball.position.y + 10, ball.position.z);
    camera[2].rotation.y = ball.rotation.y
    camera[2].position.lerp(offset, 1);
    camera[2].lookAt(ball.position.x, ball.position.y, ball.position.z);
}

function update() {
    createCamera3();
    currentTime = new Date().getTime();
    timeInterval = currentTime - previousTime;
    previousTime = currentTime;

    balls.forEach(ball => {
        
        if (ball.currentVelocity > 0) {
            cameraUpdate(ball);
            ball.currentVelocity = ball.initialVelocity - acceleration * (currentTime - ball.initialTime);
            if (ball.currentVelocity <= 0)
                ball.currentVelocity = 0;
        }
    });

    handleCollisions();

    balls.forEach(ball => {
        ball.updatePosition();
        if (ball.currentVelocity > 0)
            ball.translateX(-ball.currentVelocity);
            ball.rotateBall();
    });

    if (KeyboardState[37]) {
        if (cannon[current_cannon].getRotationX() < 0.8)
            cannon[current_cannon].rotateX(timeInterval * angularVelocity)
    }
    if (KeyboardState[39]) {
        if (cannon[current_cannon].getRotationX() > -0.8)
            cannon[current_cannon].rotateX(timeInterval * -angularVelocity)
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

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}
