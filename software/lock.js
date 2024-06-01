import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.163.0/examples/jsm/loaders/GLTFLoader.js';
import { addProgress, triggerAnimation } from "./functions.js";

// Variables for scene and Three.js objects
let scene, camera, renderer;
let lockPad, lockPickCollider, lockPickModel, lockPickBoundingBox, lockPickGroup, springModel;
let sound;
let cArray = [], cBBoxs = [], sArray = [], cClicked = Array(7).fill(false);
const xLockOffset = 1.9;
const startHeight = 0.2;
const r = 0.12;
let geometry, material;

// Initialize the scene
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;

    renderer = new THREE.WebGLRenderer();
    const container = document.getElementById('lock-simulator');
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

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

// load Models
function loadModels() {
    const promises = [];
    const loader = new GLTFLoader();
    promises.push(new Promise((resolve, reject) => {
        loader.load('./media/models/locknopadlock.glb', function(gltf) {
            lockPad = gltf.scene;
            gltf.scene.position.set(0, 0, -1);
            scene.add(gltf.scene);
            resolve(gltf);
        }, undefined, reject);
    }));
    promises.push(new Promise((resolve, reject) => {
        loader.load('./media/models/pickv1.glb', function(gltf) {
            lockPickModel = gltf.scene;
            gltf.scene.position.set(7 + xLockOffset, 0, 0.5);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotateZ(Math.PI);
            scene.add(gltf.scene);
            resolve(gltf);
        }, undefined, reject);
    }));
    promises.push(new Promise((resolve, reject) => {
        loader.load('./media/models/spring.glb', function(gltf){
            springModel = gltf.scene;
            for(let i = 0; i < 7; i++){
                sArray.push(springModel.clone());
                scene.add(sArray[i]);
            }
            resolve(gltf);
        }, undefined, reject);
    }));
    return Promise.all(promises);
}

// Create lock and pick
function createLockAndPick() {
    const padlockgeo = new THREE.BoxGeometry(6, 6, 0.2);
    const padlockmat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    const padlock = new THREE.Mesh(padlockgeo, padlockmat);
    scene.add(padlock);

    // Create an Object3D to hold the lock pick collider and handle its transformations
    lockPickGroup = new THREE.Object3D();
    scene.add(lockPickGroup);

    geometry = new THREE.BoxGeometry(3.25, 0.4, 0.2);
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: false });
    lockPickCollider = new THREE.Mesh(geometry, material);
    lockPickCollider.position.set(2.5 + xLockOffset, -0.15, 0.5);
    lockPickGroup.add(lockPickCollider);

    lockPickBoundingBox = new THREE.Box3().setFromObject(lockPickCollider);

    // Update function to synchronize the bounding box with the collider
    function updateBoundingBox() {
        lockPickBoundingBox.setFromObject(lockPickCollider);
    }

    updateBoundingBox();
}

// Create lock pick collider
function createLockPickCollider() {
    geometry = new THREE.BoxGeometry(4, 0.1, 0.2);
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible:false });
    lockPickCollider = new THREE.Mesh(geometry, material);
    lockPickCollider.position.copy(lockPickModel.position);
    lockPickCollider.scale.copy(lockPickModel.scale);
    lockPickCollider.rotation.copy(lockPickModel.rotation);
    scene.add(lockPickCollider);
    lockPickGroup.add(lockPickCollider);
    lockPickGroup.add(lockPickModel);
    lockPickBoundingBox = new THREE.Box3().setFromObject(lockPickCollider);

    // Update function to synchronize the bounding box with the collider
    function updateBoundingBox() {
        lockPickBoundingBox.setFromObject(lockPickCollider);
    }

    updateBoundingBox();
}

// Change angle value in the UI
function changeAngleValue(change) {
    let angleElement = document.querySelector('#angle-value');
    let currVal = Number(angleElement.innerText);
    angleElement.innerText = currVal + change;
}

// Create cylinders
function createCylinders(matcapGoldTexture) {
    const geocylinder = new THREE.CylinderGeometry(r, r, 1, 32);
    const matcylinder = new THREE.MeshMatcapMaterial({ matcap: matcapGoldTexture });
    const cylinder = new THREE.Mesh(geocylinder, matcylinder);

    for (let i = 0; i < 7; i++) {
        cArray.push(cylinder.clone());
        cArray[i].position.set(i / 2.2 - 0.75, startHeight, 0.5);
        cBBoxs.push(new THREE.Box3().setFromObject(cArray[i]));
        scene.add(cArray[i]);
        sArray[i].children[0].scale.set(.25, 0.2, 0.25);
        sArray[i].children[0].position.set(i / 2.2 - 0.75, startHeight + 2, 0.5);
    }
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('lock-simulator');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
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

    // Handle button presses to change the current angle
    // If "[" then decrease angle
    if (e.keyCode === 219) {
        // Decrease angle
        rotateLockPick(-Math.PI / 180);
        changeAngleValue(1);
    } else if (e.keyCode === 221) {
        // Increase angle
        rotateLockPick(Math.PI / 180);
        changeAngleValue(-1);
    }
}

// Rotate the lock pick and update the bounding box
function rotateLockPick(angle) {
    console.log(lockPickGroup.position.x, lockPickGroup.position.y, lockPickGroup.position.z);

    const vec = new THREE.Vector3(0, 0, 1);
    lockPickGroup.applyMatrix4(new THREE.Matrix4().makeRotationAxis(vec, 2*angle));

    //lockPickCollider.rotation.z += angle;
    //lockPickModel.rotation.z += angle;
    lockPickBoundingBox.setFromObject(lockPickCollider);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < 7; i++) {
        if (cArray[i].position.y > startHeight && !cClicked[i]) {
            cArray[i].position.y -= 0.01;
            let numerator = (sArray[i].children[0].position.y - (cArray[i].position.y+0.8));
            sArray[i].children[0].scale.y = numerator/(sArray[i].children[0].position.y-1.2)*0.2;

        }
        if (lockPickBoundingBox.intersectsBox(cBBoxs[i]) && !cClicked[i]) {
            cArray[i].position.y += 0.05;
        }
        cBBoxs[i].copy(cArray[i].geometry.boundingBox).applyMatrix4(cArray[i].matrixWorld);
        //modify the number below to set the height of the pins
        if (cArray[i].position.y >= 1 && !cClicked[i]) {
            cClicked[i] = true;
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
    
    loadModels().then(function(gltfs){
        createLockAndPick();
        createLockPickCollider();
        createCylinders(textures.matcapGoldTexture);
        animate();
    })

    window.addEventListener('resize', onWindowResize, false);
    document.onkeydown = onKeyPress;
}

init();
