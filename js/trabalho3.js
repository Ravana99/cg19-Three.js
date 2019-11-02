// Group 46 - Joao Fonseca 89476, Tiago Pires 89544, Tomas Lopes 89552

"use strict";

const PHI = (1 + Math.sqrt(5)) / 2;

var camera = new Array(3).fill(null);
var current_camera = 0;

var wall, floor, painting, sculpture, support;
var spotlight = new Array(4).fill(null);
var scene, renderer, geometry, material, mesh;

var globalLight, light = new Array(4).fill(null);

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
            this.depth
        );
        this.mesh = new Mesh(this.geometry, this.material);
        this.add(this.mesh)
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
            this.depth
        );
        this.mesh = new Mesh(this.geometry, this.material);
        this.add(this.mesh)
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
            this.depth
        );
        this.frameGeometry = new THREE.BoxGeometry(
            this.width + 10,
            this.height + 10,
            this.depth
        );

        this.frameMesh = new Mesh(this.frameGeometry, this.frameMaterial);
        this.backgroundMesh = new Mesh(this.backgroundGeometry, this.backgroundMaterial);
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
        this.geometry.vertices.push( // With deformations (remove to see true icosahedron)
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
        this.geometry.computeFaceNormals();
        this.geometry.computeVertexNormals();
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

        this.middleMesh = new Mesh(this.middleGeometry, this.material);
        this.middleMesh.position.y = 15

        this.topMesh = new Mesh(this.topGeometry, this.material);
        this.topMesh.position.y = 30

        this.add(this.bottomMesh)
        this.add(this.middleMesh)
        this.add(this.topMesh)
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
            color: 0xffffff
        }

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.supportGeo = new THREE.CylinderGeometry(1, 1, 4, 30);
        this.coneGeo = new THREE.CylinderGeometry(1.5, 2, 5, 30);
        this.lightbulbGeo = new THREE.SphereGeometry(2.2, 30, 30);

        this.supportMesh = new Mesh(this.supportGeo, this.material);
        this.coneMesh = new Mesh(this.coneGeo, this.material);
        this.lightbulbMesh = new Mesh(this.lightbulbGeo, this.lightmat);

        this.supportMesh.rotateX(Math.PI/2);
        this.coneMesh.position.z = 1.5;
        this.lightbulbMesh.position.z = 1.5;
        this.lightbulbMesh.position.y = -2.5;


        this.add(this.supportMesh);
        this.add(this.coneMesh);
        this.add(this.lightbulbMesh);
    }
}

class Mesh extends THREE.Mesh {
    constructor(geometry, materialArguments) {
        var materials = [new THREE.MeshBasicMaterial(materialArguments), 
                         new THREE.MeshLambertMaterial(materialArguments), 
                         new THREE.MeshPhongMaterial(materialArguments)]
        super(geometry, materials[2])

        this.phongMaterial = materials[2]
        this.lambertMaterial = materials[1]
        this.basicMaterial = materials[0]
    }
}


// ------ CAMERAS ------ //


function createCamera1() {
    camera[0] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[0].position.x = 0;
    camera[0].position.y = 0;
    camera[0].position.z = 150;
    camera[0].lookAt(scene.position);
}


/* FOR TESTING
function createCamera1() {
    camera[0] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[0].position.x = -150;
    camera[0].position.y = 25;
    camera[0].position.z = -38;
    camera[0].lookAt(painting.position);
}
*/


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
    camera[1].lookAt(scene.position);
}


// ------ FUNCTIONS ------ //

//generates the lines of the paiting
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
        geometry = new THREE.BoxGeometry(Width, lineHeight, 1);
        mesh = new Mesh(geometry, lineMaterial);
        mesh.position.y = horizontalPos
        obj.add(mesh);
        horizontalPos -= horizontalOffset
    }
    for (let j = 0; j < 11; j++) {
        geometry = new THREE.BoxGeometry(lineHeight, Height, 1);
        mesh = new Mesh(geometry, lineMaterial);
        mesh.position.x = verticalPos
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
            mesh.position.x = verticalPos
            mesh.position.y = horizontalPos
            mesh.rotateX(Math.PI / 2);
            obj.add(mesh);
            verticalPos -= verticalOffset
        }
        horizontalPos -= horizontalOffset
        verticalPos = (Width - 11) / 2
    }

}

function createGlobalLight() {
    globalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    globalLight.position.set(0, 10, 10);
    scene.add(globalLight);
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerHeight / window.innerWidth;

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        renderer.getSize(widthHeight);
        camera[0].aspect = widthHeight.x / widthHeight.y;
        camera[0].updateProjectionMatrix();

        camera[1].left = frustumSize / -2;
        camera[1].right = frustumSize / 2;
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
    sculpture = new Sculpture(70, -36 + 10 * PHI, 20);
    painting = new Painting(-80, 0, -37.5);

    spotlight[0] = new Spotlight(-110, 50, -36.5);
    spotlight[1] = new Spotlight(-50, 50, -36.5);
    spotlight[2] = new Spotlight(50, 50, -36.5);
    spotlight[3] = new Spotlight(120, 50, -36.5);
    
    spotlight[2].rotateZ(0.3);
    spotlight[3].rotateZ(-0.3);

    scene.add(wall);
    scene.add(floor);
    scene.add(support);
    scene.add(sculpture);
    scene.add(painting);
    scene.add(spotlight[0]);
    scene.add(spotlight[1]);
    scene.add(spotlight[2]);
    scene.add(spotlight[3]);
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

//handles keypresses
function handleInput() {
    if (KeyboardState[49]) {
        //1
    }
    if (KeyboardState[50]) {
        //2
    }
    if (KeyboardState[51]) {
        //3
    }
    if (KeyboardState[52]) {
        //4
    }
    if (KeyboardState[53]) {
        //5
        current_camera = 0;
    }
    if (KeyboardState[54]) {
        //6
        current_camera = 1;
    }


    if (KeyboardState[69] && !wasPressed[69]) {
        //E
        scene.traverse(function (node) {
            if (node instanceof Mesh && node.material != node.basicMaterial) {
                if (node.material == node.phongMaterial)
                    node.material = node.lambertMaterial
                else
                    node.material = node.phongMaterial

            }
        });
        wasPressed[69] = true;
    } else if (!KeyboardState[69]) {
        wasPressed[69] = false;
    }

    if (KeyboardState[81] && !wasPressed[81]) {
        //Q
        globalLight.visible = !globalLight.visible
        wasPressed[81] = true;
    } else if (!KeyboardState[81]) {
        wasPressed[81] = false;
    }

    if (KeyboardState[87] && !wasPressed[87]) {
        //W
        wasPressed[87] = true;
        scene.traverse(function (node) {
            if (node instanceof Mesh) {
                if (node.material == node.basicMaterial)
                    node.material = node.phongMaterial
                else
                    node.material = node.basicMaterial
            }
        });
    } else if (!KeyboardState[87]) {
        wasPressed[87] = false;
    }
}