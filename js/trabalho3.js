var camera = new Array(3).fill(null);
var current_camera = 0;
var wall, floor, painting, sculpture, support;
var scene, renderer, geometry, material, mesh;

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

var wasPressed = {};

// ------ INPUT DETECTION ------ //

onkeydown = onkeyup = function (e) {
    KeyboardState[e.keyCode] = e.type == "keydown";
};


class Floor extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Floor";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0x0f0096
        });
        this.height = 5;
        this.width = 400;
        this.depth = 80;

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
    constructor(x, y, z) {
        super();
        this.name = "Wall";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xf0e895
        });
        this.height = 150;
        this.width = 400;
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
        );
    }
}

class Painting extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Painting";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0x000000
        });

        this.dotMaterial = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xfffff
        });


        this.lineHeight = 2;
        this.height = 70;
        this.width = 120;
        this.depth = 1;

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        addRectangularPrism(
            this,
            this.width,
            this.height,
            this.depth,
            this.material
        );
        addLines(this, this.lineHeight, this.width, this.height);
        addDots(this, this.width, this.height);
    }
}

class Sculpture extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Sculpture";
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
class Support extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.name = "Support";
        this.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xc2c2c2
        });

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        addCylinder(this, 30, 4, this.material, 0, 0, 0)
        addCylinder(this, 15, 30, this.material, 0, 15, 0)
        addCylinder(this, 30, 4, this.material, 0, 30, 0)
    }
}

// ------ GEOMETRIES ------ //

function addCylinder(obj, radius, height, material, x, y, z) {
    geometry = new THREE.CylinderGeometry(radius, radius, height, 15);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x
    mesh.position.y = y
    mesh.position.z = z
    obj.add(mesh);
}

function addSphere(obj, radius, material) {
    geometry = new THREE.SphereGeometry(radius, 20, 5);
    mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
    return mesh;
}

function addRectangularPrism(obj, dimX, dimY, dimZ, material) {
    geometry = new THREE.BoxGeometry(dimX, dimY, dimZ);
    mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
}

function addLines(obj, lineHeight, Width, Height) {
    //Horizontal Lines
    let horizontalPos = (Height - 9) / 2,
        horizontalOffset = Height / 8;
    //Vertical Lines
    let verticalPos = (Width - 11) / 2,
        verticalOffset = Width / 11;

    const lineMaterial = new THREE.MeshBasicMaterial({
        wireframe: false,
        color: 0xadadad
    });

    for (let i = 0; i < 8; i++) {
        geometry = new THREE.BoxGeometry(Width, lineHeight, 1);
        mesh = new THREE.Mesh(geometry, lineMaterial);
        mesh.position.y = horizontalPos
        obj.add(mesh);
        horizontalPos -= horizontalOffset
    }
    for (let j = 0; j < 11; j++) {
        geometry = new THREE.BoxGeometry(lineHeight, Height, 1);
        mesh = new THREE.Mesh(geometry, lineMaterial);
        mesh.position.x = verticalPos
        obj.add(mesh);
        verticalPos -= verticalOffset
    }
}

function addDots(obj, Width, Height) {
    //Horizontal Position
    let horizontalPos = (Height - 9) / 2,
        horizontalOffset = Height / 8;
    //Vertical Position
    let verticalPos = (Width - 11) / 2,
        verticalOffset = Width / 11;

    const dotMaterial = new THREE.MeshBasicMaterial({
        wireframe: false,
        color: 0xffffff
    });

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 11; j++) {
            geometry = new THREE.CylinderGeometry(1.5, 1.5, 1, 15);
            mesh = new THREE.Mesh(geometry, dotMaterial);
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


function createCamera1() {
    camera[0] = new THREE.PerspectiveCamera(100,
        window.innerWidth / window.innerHeight, 1, 1000);
    camera[0].position.x = 0;
    camera[0].position.y = 0;
    camera[0].position.z = 130;
    camera[0].lookAt(scene.position);

}

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

function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    createScene();
    createCamera1();
    createCamera2();
    window.addEventListener("resize", onResize);
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
    painting = new Painting(-80, 0, 0);
    support = new Support(75, -70, 0);

    scene.add(wall);
    scene.add(floor);
    scene.add(painting)
    scene.add(support)
}

function render() {
    renderer.render(scene, camera[current_camera]);
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
    if (KeyboardState[69]) {
        //E

    }
    if (KeyboardState[81]) {
        //Q

    }
    if (KeyboardState[87]) {
        //W

    }
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