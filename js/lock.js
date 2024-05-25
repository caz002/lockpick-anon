import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { addProgress, triggerAnimation } from "./functions.js";

// Global variables
let scene, camera, renderer, lockpad, lockPickCollider, lockPickModel, lockPickBoundingBox, sound, cArray = [], cBBoxs = [], cclicked = Array(7).fill(false);
const x_lock_offset = 1.9;
const start_height = 0.5;
const r = 0.12;
let geometry, material; // Declare global geometry and material variables

// Initialize the scene
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('lock-simulator').appendChild(renderer.domElement);

    scene.background = new THREE.Color(0xEBE4E6);
}

// Load textures
function loadTextures() {
    const textureLoader = new THREE.TextureLoader();
    const matcapGoldTexture = textureLoader.load("./media/textures/MetalGoldPaint002/MetalGoldPaint002_Sphere.png");

    return { matcapGoldTexture };
}

// Load audio
function loadAudio() {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load('./media/audio/complete.wav', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
    });
}

// Load models
function loadModels() {
    const loader = new GLTFLoader();

    loader.load('./media/models/locknopadlock.glb', function(gltf) {
        lockpad = gltf.scene;
        gltf.scene.position.set(0, 0, -1);
        scene.add(gltf.scene);
    }, undefined, console.error);

    loader.load('./media/models/pickv1.glb', function(gltf) {
        lockPickModel = gltf.scene;
        gltf.scene.position.set(7 + x_lock_offset, 0, 0.5);
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.rotateZ(Math.PI);
        scene.add(gltf.scene);
    }, undefined, console.error);
}

// Create lock and pick
function createLockAndPick() {
    const padlockgeo = new THREE.BoxGeometry(6, 6, 0.2);
    const padlockmat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    const padlock = new THREE.Mesh(padlockgeo, padlockmat);
    scene.add(padlock);

    geometry = new THREE.BoxGeometry(3.25, 0.4, 0.2); // Initialize global geometry variable
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: false }); // Initialize global material variable
    lockPickCollider = new THREE.Mesh(geometry, material);
    lockPickCollider.position.set(2.5 + x_lock_offset, -0.15, 0.5);
    scene.add(lockPickCollider);

    lockPickBoundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    lockPickBoundingBox.setFromObject(lockPickCollider);
}

// Create cylinders
function createCylinders(matcapGoldTexture) {
    const geocylinder = new THREE.CylinderGeometry(r, r, 1, 32);
    const matcylinder = new THREE.MeshMatcapMaterial({ matcap: matcapGoldTexture });
    const cylinder = new THREE.Mesh(geocylinder, matcylinder);

    for (let i = 0; i < 7; i++) {
        cArray.push(cylinder.clone());
        cArray[i].position.set(i / 2.2 - 0.75, start_height, 0.5);
        cBBoxs.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
        cBBoxs[i].setFromObject(cArray[i]);
        scene.add(cArray[i]);
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle key press
function onKeyPress(e) {
    if (e.keyCode === 37 && lockPickCollider.position.x >= 0.5) {
        lockPickCollider.position.x -= 0.1;
        lockPickModel.position.x -= 0.1;
    } else if (e.keyCode === 39) {
        lockPickCollider.position.x += 0.1;
        lockPickModel.position.x += 0.1;
    } else if (e.keyCode === 38) {
        lockPickCollider.position.y += 0.1;
        lockPickModel.position.y += 0.1;
    } else if (e.keyCode === 40 && lockPickCollider.position.y >= -0.4) {
        lockPickCollider.position.y -= 0.1;
        lockPickModel.position.y -= 0.1;
    }
}

// Handle button clicks for angle adjustment
function setupAngleButtons() {
    document.querySelector('#add-button').addEventListener("click", () => {
        lockPickModel.rotateZ(-Math.PI / 180);
    });
    document.querySelector('#sub-button').addEventListener("click", () => {
        lockPickModel.rotateZ(Math.PI / 180);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < 7; i++) {
        if (cArray[i].position.y > start_height && !cclicked[i]) {
            cArray[i].position.y -= 0.01;
        }
        if (lockPickBoundingBox.intersectsBox(cBBoxs[i]) && !cclicked[i]) {
            cArray[i].position.y += 0.1;
        }
        cBBoxs[i].copy(cArray[i].geometry.boundingBox).applyMatrix4(cArray[i].matrixWorld);
        if (cArray[i].position.y >= 2 && !cclicked[i]) {
            cclicked[i] = true;
            sound.play();
            addProgress();
        }
    }

    lockPickBoundingBox.copy(lockPickCollider.geometry.boundingBox).applyMatrix4(lockPickCollider.matrixWorld);
    renderer.render(scene, camera);
}

// Initialize and setup everything
function init() {
    initScene();
    const textures = loadTextures();
    loadAudio();
    loadModels();
    createLockAndPick();
    createCylinders(textures.matcapGoldTexture);
    setupAngleButtons();

    window.addEventListener('resize', onWindowResize, false);
    document.onkeydown = onKeyPress;

    animate();
}

init();
