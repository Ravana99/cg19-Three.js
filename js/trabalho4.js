// Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

var camera = new Array(3).fill(null);
var current_camera = 1;

var scene, renderer;

var aspectRatio = window.innerHeight / window.innerWidth;
var widthHeight = new THREE.Vector2(window.innerWidth, window.innerHeight);
var frustumSize = 250;

var board, ball, dice;

var stopTime = false,
    resetScene = false,
    displayWireFrame = false;

var currentTime, previousTime, timeInterval;
var angularVelocity = 0.009
var acceleration = 0.00001;


var directionalLight, pointLight, calculateLighting

var KeyboardState = {
    49: false, //1
    50: false, //2
    66: false, //B
    68: false, //D
    76: false, //L
    80: false, //P
    82: false, //R
    83: false, //S
    87: false //W
};

var wasPressed = {
    49: false, //1
    50: false, //2
    66: false, //B
    68: false, //D
    76: false, //L
    80: false, //P
    82: false, //R
    83: false, //S
    87: false //W
};

// ------ INPUT DETECTION ------ //

onkeydown = onkeyup = function (e) {
    KeyboardState[e.keyCode] = e.type == "keydown";
};


// ------ CAMERAS ------ //

//scene camera (5)
function createCamera1() {
    camera[0] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[0].position.x = 0;
    camera[0].position.y = 3;
    camera[0].position.z = 50;
    camera[0].lookAt(0, 0, 0);
}

//painting camera (6)
function createCamera2() {
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

// ------ LIGHT FUNCTIONS ------ //

function createDirectionalLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
}

function createPointLight() {
    var pointLight = new THREE.PointLight(0xff0000, 1, 100);
    pointLight.position.set(0, 50, 0);
    scene.add(pointLight);
}

function switchMaterials() {
    scene.traverse(function (node) {
        if (node instanceof Mesh) {
            if (node.material == node.basicMaterial)
                node.material = node.phongMaterial
            else
                node.material = node.basicMaterial
        }
    });
}

// ------ GENERAL FUNCTIONS ------ //

function createScene() {
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(100));

    board = new Board()
    scene.add(board)

    ball = new Ball()
    scene.add(ball)

    dice = new Dice()
    scene.add(dice)
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
    createDirectionalLight();
    createPointLight();
    window.addEventListener("resize", onResize);
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerHeight / window.innerWidth;

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        renderer.getSize(widthHeight);
        camera[0].aspect = widthHeight.x / widthHeight.y;
        camera[0].updateProjectionMatrix();

        camera[1].left = frustumSize / -2 - 75;
        camera[1].right = frustumSize / 2 - 75;
        camera[1].top = (frustumSize * aspectRatio) / 2;
        camera[1].bottom = (-frustumSize * aspectRatio) / 2;
        camera[1].updateProjectionMatrix();
    }
}

function render() {
    renderer.render(scene, camera[current_camera]);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

function selectCamera(i, e) {
    current_camera = i;
    wasPressed[e] = true;
}


//handles keypresses
function handleInput() {
    if (KeyboardState[49] && !wasPressed[49]) //1
    {
        current_camera = 0;
        wasPressed[49] = true;
    } else if (!KeyboardState[49] && wasPressed[49])
        wasPressed[49] = false;

    if (KeyboardState[50] && !wasPressed[50]) //2
    {
        current_camera = 1;
        wasPressed[50] = true;
    } else if (!KeyboardState[50] && wasPressed[50])
        wasPressed[50] = false;

    if (KeyboardState[66] && !wasPressed[66]) //B
    {
        ball.setStartStop()
        wasPressed[66] = true;
    } else if (!KeyboardState[66] && wasPressed[66])
        wasPressed[66] = false;

    if (KeyboardState[68] && !wasPressed[68]) //D
    {
        directionalLight.visible = !directionalLight.visible
        wasPressed[68] = true;
    } else if (!KeyboardState[68] && wasPressed[68])
        wasPressed[68] = false;

    if (KeyboardState[76] && !wasPressed[76]) //L
    {
        calculateLighting = true
        wasPressed[76] = true;
    } else if (!KeyboardState[76] && wasPressed[76])
        wasPressed[76] = false;

    if (KeyboardState[80] && !wasPressed[80]) //P
    {
        pointLight.visible = !pointLight.visible
        wasPressed[80] = true;
    } else if (!KeyboardState[80] && wasPressed[80])
        wasPressed[80] = false;

    if (KeyboardState[82] && !wasPressed[82] && stopTime) //R
    {
        resetScene = true
        wasPressed[82] = true;
    } else if (!KeyboardState[82] && wasPressed[82])
        wasPressed[82] = false;

    if (KeyboardState[83] && !wasPressed[83]) //S
    {
        stopTime = !stopTime
        wasPressed[83] = true;
    } else if (!KeyboardState[83] && wasPressed[83])
        wasPressed[83] = false;

    if (KeyboardState[87] && !wasPressed[87]) //W
    {
        displayWireFrame = true
        wasPressed[87] = true;
    } else if (!KeyboardState[87] && wasPressed[87])
        wasPressed[87] = false;
}

// ------ OBJECTS ------ //

class Mesh extends THREE.Mesh {
    constructor(geometry, materialArguments) {
        var materials = [new THREE.MeshBasicMaterial(materialArguments),
        new THREE.MeshPhongMaterial(materialArguments)
        ]
        super(geometry, materials[1]);

        this.phongMaterial = materials[1];
        this.basicMaterial = materials[0];
    }
    toggleWireFrame() {
        this.phongMaterial.wireframe = !this.phongMaterial.wireframe
        this.basicMaterial.wireframe = !this.basicMaterial.wireframe
    }
}

class Board extends THREE.Object3D {
    constructor() {
        super();
        this.name = "Board";
        this.blackMaterial = {
            wireframe: false,
            color: 0x54451d
        };
        this.whiteMaterial = {
            wireframe: false,
            color: 0xffffff
        };

        this.position.x = 0;
        this.position.y = -1.5;
        this.position.z = 0;
        this.meshes = []
        //squareside=3
        let x = -52.5,
            z = -52.5,
            mesh,
            currentMaterial;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i % 2 == 0 && j % 2 == 0) || (i % 2 != 0 && j % 2 != 0))
                    currentMaterial = this.whiteMaterial
                else
                    currentMaterial = this.blackMaterial
                //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
                mesh = new Mesh(new THREE.BoxGeometry(15, 3, 15, 5, 1, 5), currentMaterial);
                //mesh.phongMaterial.shininess = 400;
                //mesh.phongMaterial.specular.setHex(0xeeeeee);
                mesh.position.x = x
                mesh.position.y = 0
                mesh.position.z = z
                this.add(mesh);
                this.meshes.push(mesh)
                x += 15;
            }
            z += 15;
            x = -52.5
        }
    }
    toggleWireFrame() {
        for (var mesh of this.meshes) {
            mesh.toggleWireFrame()
        }
    }
}


class Ball extends THREE.Object3D {
    constructor() {
        super();
        this.name = "Ball";
        this.add(new THREE.AxesHelper(50));
        this.material = {
            wireframe: false,
            color: 0xffcb40
        };
        this.startStop = false;

        this.currentVelocity = 0;

        this.position.x = 0;
        this.position.y = 4;
        this.position.z = 0;

        this.mesh = new Mesh(new THREE.SphereGeometry(4, 20, 5), this.material);
        this.mesh.position.y = 0;
        this.mesh.position.z = 45;
        this.add(this.mesh);
    }

    toggleWireFrame() {
        this.mesh.toggleWireFrame()
    }

    moveBall() {
        this.rotateY(this.currentVelocity)
        this.mesh.rotation.z -= this.currentVelocity
    }

    setStartStop() {
        this.startStop = !this.startStop
    }
    setCurrentVelocity(velocity) {
        this.currentVelocity = velocity
    }

    getStartStop() {
        return this.startStop
    }
    getCurrentVelocity() {
        return this.currentVelocity
    }
}

class Dice extends THREE.Object3D {
    constructor() {
        super();
        this.add(new THREE.AxesHelper(50));
        this.name = "Dice";
        this.material = {
            wireframe: false,
            color: 0xe30220
        };

        this.position.x = 0;
        this.position.y = Math.sqrt(75); //sqrt(5**2+5**2)**2+5**2
        this.position.z = 0;

        this.mesh = new Mesh(new THREE.BoxGeometry(10, 10, 10, 5, 1, 5), this.material);
        this.mesh.rotation.z = Math.PI / 4
        this.mesh.rotation.x = 35.26
        this.add(this.mesh);
    }

    toggleWireFrame() {
        this.mesh.toggleWireFrame()
    }

    setRotationY() {
        this.rotateY(angularVelocity)
    }
}

function update() {
    if (stopTime) {
        if (resetScene) {
            resetScene = false
            //This is not needed i think, createScene will override objects(dont know if its enough yet)
            //while (scene.children.length > 0) {
            //    scene.remove(scene.children[0]);
            //}
            createScene()
            createDirectionalLight()
        }
    }
    else {
        currentTime = new Date().getTime();
        timeInterval = currentTime - previousTime;
        previousTime = currentTime;


        if (displayWireFrame) {
            displayWireFrame = false
            board.toggleWireFrame()
            dice.toggleWireFrame()
            ball.toggleWireFrame()
        }

        if (calculateLighting) {
            calculateLighting = false
            switchMaterials()
        }

        if (ball.getStartStop()) {
            if (ball.getCurrentVelocity() < 0.05)
                ball.setCurrentVelocity(ball.getCurrentVelocity() + acceleration * timeInterval);
            else
                ball.setCurrentVelocity(0.05);
        }
        else {
            if (ball.getCurrentVelocity() > 0)
                ball.setCurrentVelocity(ball.getCurrentVelocity() - acceleration * timeInterval);
            else
                ball.setCurrentVelocity(0);
        }
        ball.moveBall()
        dice.setRotationY()
    }

    handleInput();
}