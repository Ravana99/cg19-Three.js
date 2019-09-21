"use strict";

// GLOBAL VARIABLES
// The first entry of the camera array (index 0) is ignored to make the code more intuitive
// (for example, camera[1] is the first camera that you switch to by pressing 1, etc.)
var camera = new Array(4).fill(null)
var scene, renderer;
var current_camera = 1;

// CLASSES


// FUNCTIONS

function render() {
    renderer.render(scene, camera[current_camera]);
}

function onResize() {

}

function onKeyDown(e) {
	switch (e.keyCode) {

	}
}

// IMPORTANT: THESE ARE PLACEHOLDER VALUES/PARAMETERS
function createCamera1() {
    camera[1] = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 1, 1000);
    camera[1].position.x = 50;
    camera[1].position.y = 50;
    camera[1].position.z = 50;
    camera[1].lookAt(scene.position);
}

function createCamera2() {
    
}

function createCamera3() {

}

function createScene() {
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10)); // DELETE LATER
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
    window.addEventListener("keydown", onKeyDown);
}

function animate() {
    render();
    requestAnimationFrame(animate);
}