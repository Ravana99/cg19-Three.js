// Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

// ------ GLOBAL VARIABLES AND CONSTANTS ------ //

const numberOfBalls = prompt("How many balls do you want");
const MAX_X = 47;
const MAX_Z = 47;
const MIN_X = -44;
const MIN_Z = -47;

var camera = new Array(3).fill(null);
var current_camera = 0;
var ballOnCamera = null;
var cannon = new Array(3).fill(null);
var current_cannon = 1;

var leftWall, middleWall, rightWall, floor;
var balls = [];
var walls = [];

var scene, renderer, geometry, material, mesh;
var displayAxes = false,
    displayWireFrame = false;

var aspectRatio = window.innerHeight / window.innerWidth;
var widthHeight = new THREE.Vector2(window.innerWidth, window.innerHeight);
var frustumSize = 250;

var currentTime, previousTime, timeInterval;
var lastFired = new Date().getTime();

var angularVelocity = 0.002;
var acceleration = 0.0005;

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
    if (KeyboardState[52]) {
        //4
        displayWireFrame = !displayWireFrame;
        balls.map((ball) =>
            ball.toggleWireFrame())
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
            rotateY //flag indicating if wall is rotated
        );
    }
}

class Ball extends THREE.Object3D {
    constructor(x, y, z, angle) {
        super();
        this.name = "Ball";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xffffff
        });
        this.radius = 3;

        this.rotation.y = angle;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.oldPosition = new THREE.Vector3(x, y, z);
        this.collided = false;
        this.initialVelocity = Math.random() * 1 + 1;
        this.currentVelocity = 0;
        this.initialTime = new Date().getTime();

        this.axes = new THREE.AxesHelper(20);
        if (displayAxes)
            this.add(this.axes)
        if (displayWireFrame)
            this.material.wireframe = true
        this.sphere = addSphere(
            this,
            this.radius,
            this.material
        );
    }
    toggleWireFrame() {
        displayWireFrame ? this.material.wireframe = true : this.material.wireframe = false;
    }
    toggleAxes() {
        displayAxes ? this.add(this.axes) : this.remove(this.axes);
    }
    rotateBall() {
        this.sphere.rotation.z -= (this.currentVelocity / this.radius);
    }
    //checks if this ball collides with any of the others
    //(only called on scene creation)
    checkAllBallCollisions() {
        for (var i = 0; i < balls.length; i++)
            if (this.checkBallCollision(balls[i]))
                return true;
        return false;
    }
    //checks if this ball collides with another
    checkBallCollision(other) {
        if (distanceSquared(this, other) <= (this.radius * 2) ** 2) {
            this.collided = true;
            other.collided = true
            console.log("ball collision");
            return true;
        }
        return false;
    }
    //checks if this ball collides with any of the walls
    checkWallCollision(other) {
        if (other === walls[0] && this.position.z > MAX_Z) { //left wall
            console.log("left wall collision");
            this.collided = true;
            return true;
        } else if (other === walls[1] && this.position.x < MIN_X) { //middle wall
            console.log("middle wall collision");
            this.collided = true;
            return true;
        } else if (other === walls[2] && this.position.z < MIN_Z) { //right wall
            console.log("right wall collision");
            this.collided = true;
            return true;
        }
        return false;
    }
    //treats ball-ball collisions
    processBallCollision(other) {
        [this.currentVelocity, other.currentVelocity] = [other.currentVelocity, this.currentVelocity];
        this.initialVelocity = this.currentVelocity;
        other.initialVelocity = other.currentVelocity;
        this.initialTime = new Date().getTime();
        other.initialTime = new Date().getTime();
        [this.rotation.y, other.rotation.y] = [other.rotation.y, this.rotation.y];
    }
    //treats ball-wall collisions 
    processWallCollision(other) {
        if (other === walls[0]) //left wall
            this.rotation.y = -this.rotation.y;
        else if (other === walls[1]) //middle wall
            this.rotation.y = -this.rotation.y + Math.PI;
        else if (other === walls[2]) //right wall
            this.rotation.y = -this.rotation.y;
    }
    //updates this ball's position upon collision
    updatePosition() {
        if (this.collided) {
            this.position.set(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
            this.collided = false;
        } else {
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

        this.rotation.y = angle;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.rotateZ(Math.PI / 2)
        this.add(new THREE.AxesHelper(20));
        addCylinder(this, this.radius, this.length, this.material)

    }
    //gets the cannon aiming rotation
    getRotationX() {
        return this.rotation.y;
    }
    //creates a ball and fires it
    fire() {
        var t = new Date().getTime();
        if (t - lastFired > 350) { // 350ms cooldown on fire

            var ball = new Ball(
                this.position.x,
                this.position.y,
                this.position.z,
                this.rotation.y);
            ball.add(camera[2]);
            scene.add(ball);
            balls.push(ball);
            ballOnCamera = ball;

            ball.currentVelocity = ball.initialVelocity;
            lastFired = t;
        }
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

//returns the distance between two balls (squared)
function distanceSquared(obj1, obj2) {
    return (obj2.position.x - obj1.position.x) ** 2 +
        (obj2.position.y - obj1.position.y) ** 2 +
        (obj2.position.z - obj1.position.z) ** 2;
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerHeight / window.innerWidth;

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera[0].left = frustumSize / -2;
        camera[0].right = frustumSize / 2;
        camera[0].top = (frustumSize * aspectRatio) / 2;
        camera[0].bottom = (-frustumSize * aspectRatio) / 2;
        camera[0].updateProjectionMatrix();

        renderer.getSize(widthHeight);
        camera[1].aspect = widthHeight.x / widthHeight.y;
        camera[1].updateProjectionMatrix();

        renderer.getSize(widthHeight);
        camera[2].aspect = widthHeight.x / widthHeight.y;
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

    cannon[0] = new Cannon(60, 0, 35, -0.3);
    cannon[1] = new Cannon(60, 0, 0, 0);
    cannon[1].material.color.setHex(0xff6c00); //1 is selected by default
    cannon[2] = new Cannon(60, 0, -35, 0.3);

    for (let i = 0; i < numberOfBalls; i++) {
        var ball;
        // if a ball is immediately colliding upon creation, it doesn't get added to the scene
        do {
            ball = new Ball(Math.random() < 0.5 ?
                35 * Math.random() : MIN_X * Math.random(), 0, Math.random() < 0.5 ?
                MAX_Z * Math.random() : MIN_Z * Math.random(), 0);
        } while (ball.checkAllBallCollisions());

        balls.push(ball);
        scene.add(ball);
    }
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
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    createScene();
    createCamera1();
    createCamera2();
    createCamera3();
    window.addEventListener("resize", onResize);
}

//checks and treats collisions
function handleCollisions() {
    for (var i = 0; i < balls.length; i++) {
        //removes ball from scene if it leaves the floor
        if (balls[i].position.x > MAX_X && (balls[i].rotation.y < -Math.PI / 2 || balls[i].rotation.y > Math.PI / 2 || balls[i].currentVelocity == 0)) {
            if (balls[i] == ballOnCamera)
                ballOnCamera = null;
            scene.remove(balls[i]);
            balls.splice(i, 1);
            i--;
            continue;
        }

        //handles all ball-ball collisions
        for (var j = i + 1; j < balls.length; j++)
            if (balls[i].checkBallCollision(balls[j]))
                balls[i].processBallCollision(balls[j]);

        //handles all ball-wall collisions
        for (var j = 0; j < walls.length; j++)
            if (balls[i].checkWallCollision(walls[j]))
                balls[i].processWallCollision(walls[j]);
    }
}

//updates mobile camera when needed
function cameraUpdate(ball) {
    if (ball != null) {
        var offset = new THREE.Vector3(ball.position.x + 20, ball.position.y + 10, ball.position.z);
        camera[2].rotation.y = ball.rotation.y
        camera[2].position.lerp(offset, 1);
        camera[2].lookAt(ball.position.x, ball.position.y, ball.position.z);
    }
}

function update() {
    createCamera3();
    cameraUpdate(ballOnCamera);
    currentTime = new Date().getTime();
    timeInterval = currentTime - previousTime;
    previousTime = currentTime;

    //updates the velocity values for all balls, if needed
    balls.forEach(ball => {
        if (ball.currentVelocity > 0) {
            ball.currentVelocity = ball.initialVelocity - acceleration * (currentTime - ball.initialTime);
            if (ball.currentVelocity <= 0)
                ball.currentVelocity = 0;
        }
    });

    handleCollisions();

    //updates positions after collision handling for all balls
    balls.forEach(ball => {
        ball.updatePosition();
    });

    if (KeyboardState[37]) {
        //rotates cannon to the right
        if (cannon[current_cannon].getRotationX() < 0.6)
            cannon[current_cannon].rotateX(timeInterval * angularVelocity)
    }
    if (KeyboardState[39]) {
        //rotates cannon to the left
        if (cannon[current_cannon].getRotationX() > -0.6)
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
        cannon[current_cannon].material.color.setHex(0x8e8e8c);
        current_cannon = 2;
        cannon[current_cannon].material.color.setHex(0xff6c00);
    }
    if (KeyboardState[81]) {
        //Q
        cannon[current_cannon].material.color.setHex(0x8e8e8c);
        current_cannon = 0;
        cannon[current_cannon].material.color.setHex(0xff6c00);
    }
    if (KeyboardState[87]) {
        //W
        cannon[current_cannon].material.color.setHex(0x8e8e8c);
        current_cannon = 1;
        cannon[current_cannon].material.color.setHex(0xff6c00);
    }

    //moves the balls after collision handling
    balls.forEach(ball => {
        if (ball.currentVelocity > 0)
            ball.translateX(-ball.currentVelocity);
        ball.rotateBall();
    });
}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}