// Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

const PHI = (1 + Math.sqrt(5)) / 2;

var camera = new Array(3).fill(null);
var current_camera = 0;

var wall, floor, painting, sculpture, support;
var spotlight = new Array(4).fill(null);
var scene, renderer, geometry, material, mesh;

var globalLight;
var light = new Array(4).fill(null);
var lightTarget = new Array(4).fill(null);

var aspectRatio = window.innerHeight / window.innerWidth;
var widthHeight = new THREE.Vector2(window.innerWidth, window.innerHeight);
var frustumSize = 250;

var currentTime, previousTime, timeInterval;

var KeyboardState = {
    49: false, //1
    50: false, //2
    51: false, //3
    52: false, //4
    53: false, //5
    54: false, //6
    69: false, //E
    81: false, //Q
    87: false //W
};

var wasPressed = {
    49: false, //1
    50: false, //2
    51: false, //3
    52: false, //4
    53: false, //5
    54: false, //6
    69: false, //E
    81: false, //Q
    87: false //W
};


// ------ INPUT DETECTION ------ //

onkeydown = onkeyup = function (e) {
    KeyboardState[e.keyCode] = e.type == "keydown";
};

// ------ OBJECTS ------ //

class Floor extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Floor";
        this.material = {
            wireframe: false,
            color: 0x0f0096
        };
        this.height = 5;
        this.width = 400;
        this.depth = 80;

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.geometry = new THREE.BoxGeometry(
            this.width,
            this.height,
            this.depth,
            100,
            10,
            100
        );
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.phongMaterial.shininess = 200;
        this.mesh.phongMaterial.specular.setHex(0xaaaaaa);
        this.add(this.mesh);
    }
}

class Wall extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Wall";
        this.material = {
            wireframe: false,
            color: 0xf0e895
        };
        this.height = 150;
        this.width = 400;
        this.depth = 3;

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;


        this.geometry = new THREE.BoxGeometry(
            this.width,
            this.height,
            this.depth,
            150,
            60,
            2
        );
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.phongMaterial.shininess = 50;
        this.mesh.phongMaterial.specular.setHex(0x333333);
        this.add(this.mesh);
    }
}

class Painting extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Painting";

        this.frameMaterial = {
            wireframe: false,
            color: 0x4f421e
        };
        this.backgroundMaterial = {
            wireframe: false,
            color: 0x000000
        };
        this.dotMaterial = {
            wireframe: false,
            color: 0xfffff
        };


        this.lineHeight = 2;
        this.height = 70;
        this.width = 120;
        this.depth = 1;

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;


        this.backgroundGeometry = new THREE.BoxGeometry(
            this.width,
            this.height,
            this.depth,
            40,
            40,
            2
        );
        this.frameGeometry = new THREE.BoxGeometry(
            this.width + 10,
            this.height + 10,
            this.depth - 0.01, // "zindex"
            45,
            45,
            2
        );

        this.frameMesh = new Mesh(this.frameGeometry, this.frameMaterial);
        this.frameMesh.phongMaterial.shininess = 0;
        this.frameMesh.phongMaterial.specular.setHex(0x000000);
        this.backgroundMesh = new Mesh(this.backgroundGeometry, this.backgroundMaterial);
        this.backgroundMesh.phongMaterial.shininess = 100;
        this.backgroundMesh.phongMaterial.specular.setHex(0x666666);
        this.add(this.backgroundMesh)
        this.add(this.frameMesh)

        addLines(this, this.lineHeight, this.width, this.height);
        addDots(this, this.width, this.height);
    }
}

class Sculpture extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Sculpture";

        this.material = {
            wireframe: false,
            color: 0xffc0cb
        };

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        //sculpture scale
        this.sculpSize = 10;

        this.geometry = new THREE.Geometry();
        this.geometry.vertices.push( // With deformations (remove +1, +2, -1, etc. to see true icosahedron)
            new THREE.Vector3(0, this.sculpSize + 1, this.sculpSize * PHI),
            new THREE.Vector3(0, -this.sculpSize - 1, this.sculpSize * PHI - 2),
            new THREE.Vector3(0, -this.sculpSize, -this.sculpSize * PHI + 1),
            new THREE.Vector3(0, this.sculpSize, -this.sculpSize * PHI - 2),

            new THREE.Vector3(this.sculpSize + 2, this.sculpSize * PHI + 2, 0),
            new THREE.Vector3(-this.sculpSize + 2, this.sculpSize * PHI - 1, 0),
            new THREE.Vector3(-this.sculpSize - 2, -this.sculpSize * PHI, 0),
            new THREE.Vector3(this.sculpSize + 1, -this.sculpSize * PHI, 0),

            new THREE.Vector3(this.sculpSize * PHI + 1, 0, this.sculpSize + 2),
            new THREE.Vector3(-this.sculpSize * PHI + 2, 0, this.sculpSize),
            new THREE.Vector3(-this.sculpSize * PHI, 0, -this.sculpSize + 3),
            new THREE.Vector3(this.sculpSize * PHI, 0, -this.sculpSize - 2),
        );

        this.geometry.faces.push( // Order of vertices matters!! (counter-clockwise)
            new THREE.Face3(1,8,0),
            new THREE.Face3(1,0,9),
            new THREE.Face3(1,9,6),
            new THREE.Face3(1,6,7),
            new THREE.Face3(1,7,8),

            new THREE.Face3(11,4,8),
            new THREE.Face3(8,4,0),
            new THREE.Face3(4,5,0),
            new THREE.Face3(0,5,9),
            new THREE.Face3(5,10,9),

            new THREE.Face3(9,10,6),
            new THREE.Face3(10,2,6),
            new THREE.Face3(6,2,7),
            new THREE.Face3(7,2,11),
            new THREE.Face3(7,11,8),

            new THREE.Face3(3,10,5),
            new THREE.Face3(3,5,4),
            new THREE.Face3(3,4,11),
            new THREE.Face3(3,11,2),
            new THREE.Face3(3,2,10),
        );

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.phongMaterial.shininess = 5;
        this.mesh.phongMaterial.specular.setHex(0xffffff);
        this.geometry.computeFaceNormals();
        this.add(this.mesh);
    }
}
class Support extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Support";
        this.material = {
            wireframe: false,
            color: 0xc2c2c2
        };

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.bottomGeometry = new THREE.CylinderGeometry(
            20,
            20,
            4,
            30
        );
        this.middleGeometry = new THREE.CylinderGeometry(
            15, 15, 30, 30
        );
        this.topGeometry = new THREE.CylinderGeometry(
            30, 20, 8, 30
        );

        this.bottomMesh = new Mesh(this.bottomGeometry, this.material);
        this.bottomMesh.phongMaterial.shininess = 400;
        this.bottomMesh.phongMaterial.specular.setHex(0xeeeeee);

        this.middleMesh = new Mesh(this.middleGeometry, this.material);
        this.middleMesh.position.y = 15
        this.middleMesh.phongMaterial.shininess = 400;
        this.bottomMesh.phongMaterial.specular.setHex(0xeeeeee);

        this.topMesh = new Mesh(this.topGeometry, this.material);
        this.topMesh.position.y = 30
        this.topMesh.phongMaterial.shininess = 400;
        this.topMesh.phongMaterial.specular.setHex(0xeeeeee);

        this.add(this.bottomMesh);
        this.add(this.middleMesh);
        this.add(this.topMesh);
    }
}

class Spotlight extends THREE.Object3D {
    constructor(x,y,z) {
        super();
        this.name = "Spotlight";
        this.material = {
            wireframe: false,
            color: 0xc2c2c2
        };
        this.lightmat = {
            wireframe: false,
            color: 0xffffff,
        }

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.supportGeo = new THREE.CylinderGeometry(1, 1, 4, 30);
        this.coneGeo = new THREE.CylinderGeometry(1.5, 2, 5, 30);
        this.lightbulbGeo = new THREE.SphereGeometry(2.2, 30, 30);

        this.supportMesh = new Mesh(this.supportGeo, this.material);
        this.supportMesh.phongMaterial.shininess = 500;
        this.supportMesh.phongMaterial.specular.setHex(0xffffff);
        this.coneMesh = new Mesh(this.coneGeo, this.material);
        this.coneMesh.phongMaterial.shininess = 500;
        this.coneMesh.phongMaterial.specular.setHex(0xffffff);
        this.lightbulbMesh = new Mesh(this.lightbulbGeo, this.lightmat);
        this.lightbulbMesh.phongMaterial.shininess = 500;
        this.lightbulbMesh.phongMaterial.specular.setHex(0xffffff);
        this.lightbulbMesh.basicMaterial.transparent = true;
        this.lightbulbMesh.lambertMaterial.transparent = true;
        this.lightbulbMesh.phongMaterial.transparent = true;

        this.supportMesh.rotateX(Math.PI/2);
        this.coneMesh.position.z = 1.5;
        this.lightbulbMesh.position.z = 1.5;
        this.lightbulbMesh.position.y = -2.5;


        this.add(this.supportMesh);
        this.add(this.coneMesh);
        this.add(this.lightbulbMesh);
    }
}

//auxiliary object to be targeted the spotlights
class LightTarget extends THREE.Object3D {
    constructor(x,y,z) {
        super();
        this.name = "LightTarget";
        this.material = {
            visible: false,
            wireframe: false,
            color: 0xffffff
        };

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.geo = new THREE.BoxGeometry(1,1,1);
        this.mesh = new Mesh(this.geo, this.material);

        this.add(this.mesh);
    }
}

class Mesh extends THREE.Mesh {
    constructor(geometry, materialArguments) {
        var materials = [new THREE.MeshBasicMaterial(materialArguments), 
                         new THREE.MeshLambertMaterial(materialArguments), 
                         new THREE.MeshPhongMaterial(materialArguments)]
        super(geometry, materials[2]);

        this.phongMaterial = materials[2];
        this.lambertMaterial = materials[1];
        this.basicMaterial = materials[0];
    }
}


// ------ CAMERAS ------ //

//scene camera (5)
function createCamera1() {
    camera[0] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[0].position.x = 0;
    camera[0].position.y = 100;
    camera[0].position.z = 150;
    camera[0].lookAt(scene.position);
}

//painting camera (6)
function createCamera2() {
    camera[1] = new THREE.OrthographicCamera(
        frustumSize / -2 - 75,
        frustumSize / 2 - 75,
        (frustumSize * aspectRatio) / 2,
        (frustumSize * aspectRatio) / -2,
        -100,
        100
    );
    camera[1].position.x = 0;
    camera[1].position.y = 0;
    camera[1].position.z = 0;
}


// ------ FUNCTIONS ------ //

//generates the lines of the painting
function addLines(obj, lineHeight, Width, Height) {
    //Horizontal Lines
    let horizontalPos = (Height - 9) / 2,
        horizontalOffset = Height / 8;
    //Vertical Lines
    let verticalPos = (Width - 11) / 2,
        verticalOffset = Width / 11;

    const lineMaterial = {
        wireframe: false,
        color: 0xadadad
    };

    for (let i = 0; i < 8; i++) {
        geometry = new THREE.BoxGeometry(Width, lineHeight, 1, 10, 10, 1);
        mesh = new Mesh(geometry, lineMaterial);
        mesh.phongMaterial.shininess = 100;
        mesh.phongMaterial.specular.setHex(0x666666);
        mesh.position.y = horizontalPos
        mesh.position.z += 0.01 // "zindex"
        obj.add(mesh);
        horizontalPos -= horizontalOffset
    }
    for (let j = 0; j < 11; j++) {
        geometry = new THREE.BoxGeometry(lineHeight, Height, 1, 10, 10, 1);
        mesh = new Mesh(geometry, lineMaterial);
        mesh.phongMaterial.shininess = 100;
        mesh.phongMaterial.specular.setHex(0x666666);
        mesh.position.x = verticalPos
        mesh.position.z += 0.01 // "zindex"
        obj.add(mesh);
        verticalPos -= verticalOffset
    }
}

//generates the dots of the painting
function addDots(obj, Width, Height) {
    //Horizontal Position
    let horizontalPos = (Height - 9) / 2,
        horizontalOffset = Height / 8;
    //Vertical Position
    let verticalPos = (Width - 11) / 2,
        verticalOffset = Width / 11;

    const dotMaterial = {
        wireframe: false,
        color: 0xffffff
    };

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 11; j++) {
            geometry = new THREE.CylinderGeometry(1.5, 1.5, 1, 15);
            mesh = new Mesh(geometry, dotMaterial);
            mesh.phongMaterial.shininess = 100;
            mesh.phongMaterial.specular.setHex(0x666666);
            mesh.position.x = verticalPos
            mesh.position.y = horizontalPos
            mesh.position.z += 0.02 // "zindex"
            mesh.rotateX(Math.PI / 2);
            obj.add(mesh);
            verticalPos -= verticalOffset
        }
        horizontalPos -= horizontalOffset
        verticalPos = (Width - 11) / 2
    }

}

//ambient light
function createGlobalLight() {
    globalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    globalLight.position.set(0, 10, 10);
    scene.add(globalLight);
}

function createLightTargets() {
    lightTarget[0] = new LightTarget(-110, -74, -33);
    lightTarget[1] = new LightTarget(-50, -74, -33);
    lightTarget[2] = new LightTarget(75,-70,0);
    lightTarget[3] = new LightTarget(100,-70,0);

    scene.add(lightTarget[0]);
    scene.add(lightTarget[1]);
    scene.add(lightTarget[2]);
    scene.add(lightTarget[3]);
}

//spotlights
function createLight(x,y,z,i) {
    light[i] = new THREE.SpotLight( 0xffffff, 5, 100, Math.PI/4, 0, 1);
    light[i].position.set(x,y,z);
    light[i].target = lightTarget[i];
    scene.add(light[i]);
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

function createScene() {
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(50));

    wall = new Wall(0, 0, -40);
    floor = new Floor(0, -75, 0);
    support = new Support(75, -70, 0);
    sculpture = new Sculpture(70, -36 + 10 * PHI, 12);
    painting = new Painting(-80, 0, -37.5);

    scene.add(wall);
    scene.add(floor);
    scene.add(support);
    scene.add(sculpture);
    scene.add(painting);

    createLightTargets();

    spotlight[0] = new Spotlight(-110, 50, -36.5);
    spotlight[1] = new Spotlight(-50, 50, -36.5);
    spotlight[2] = new Spotlight(50, 50, -36.5);
    spotlight[3] = new Spotlight(130, 50, -36.5);

    scene.add(spotlight[0]);
    scene.add(spotlight[1]);
    scene.add(spotlight[2]);
    scene.add(spotlight[3]);
    
    spotlight[2].rotateZ(0.3);
    spotlight[3].rotateZ(-0.3);

    createLight(-110,52,-30,0);
    createLight(-50,52,-30,1);
    createLight(50,55,-30,2);
    createLight(130,55,-30,3);
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
    createGlobalLight();

    window.addEventListener("resize", onResize);
}

function render() {
    renderer.render(scene, camera[current_camera]);
}

function update() {
    currentTime = new Date().getTime();
    timeInterval = currentTime - previousTime;
    previousTime = currentTime;
    handleInput();
}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

function toggleLight(i, e) {
    light[i].visible = !light[i].visible;
    wasPressed[e] = true;
}

function selectCamera(i, e) {
    current_camera = i;
    wasPressed[e] = true;
}

function switchMaterial() {
    scene.traverse(function (node) {
        if (node instanceof Mesh && node.material != node.basicMaterial) {
            if (node.material == node.phongMaterial)
                node.material = node.lambertMaterial
            else
                node.material = node.phongMaterial
        }
    });
    wasPressed[69] = true;
}

function disableGlobalLight() {
    globalLight.visible = !globalLight.visible
    wasPressed[81] = true;
}

function disableLighting() {
    scene.traverse(function (node) {
        if (node instanceof Mesh) {
            if (node.material == node.basicMaterial)
                node.material = node.phongMaterial
            else
                node.material = node.basicMaterial
        }
    });
    wasPressed[87] = true;
}

//handles keypresses
function handleInput() {
    if (KeyboardState[49] && !wasPressed[49]) //1
        toggleLight(0, 49);
    else if (!KeyboardState[49] && wasPressed[49])
        wasPressed[49] = false;

    if (KeyboardState[50] && !wasPressed[50]) //2
        toggleLight(1, 50);
    else if (!KeyboardState[50] && wasPressed[50])
        wasPressed[50] = false;

    if (KeyboardState[51] && !wasPressed[51]) //3
        toggleLight(2, 51);
    else if (!KeyboardState[51] && wasPressed[51])
        wasPressed[51] = false;

    if (KeyboardState[52] && !wasPressed[52]) //4
        toggleLight(3, 52);
    else if (!KeyboardState[52] && wasPressed[52])
        wasPressed[52] = false;

    if (KeyboardState[53] && !wasPressed[53]) //5
        selectCamera(0, 53);
    else if (!KeyboardState[53] && wasPressed[53])
        wasPressed[53] = false;

    if (KeyboardState[54] && !wasPressed[54]) //6
        selectCamera(1, 54);
    else if (!KeyboardState[54] && wasPressed[54])
        wasPressed[54] = false;

    if (KeyboardState[69] && !wasPressed[69]) //E
        switchMaterial();
    else if (!KeyboardState[69] && wasPressed[69])
        wasPressed[69] = false;

    if (KeyboardState[81] && !wasPressed[81]) //Q
        disableGlobalLight();
    else if (!KeyboardState[81] && wasPressed[81])
        wasPressed[81] = false;

    if (KeyboardState[87] && !wasPressed[87]) //W
        disableLighting();
    else if (!KeyboardState[87] && wasPressed[87])
        wasPressed[87] = false;
}