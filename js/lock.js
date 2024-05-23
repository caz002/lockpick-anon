// this file renders padlock and pick
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { addProgress,
         triggerAnimation } from "./functions.js";

// set up Scene/Window for rendering
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('lock-simulator').appendChild(renderer.domElement);

// TEXTURES
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("https://bruno-simon.com/prismic/matcaps/3.png");
const matcapGoldTexture = textureLoader.load("./media/textures/MetalGoldPaint002/MetalGoldPaint002_Sphere.png")
// set background color
scene.background = new THREE.Color(0xEBE4E6);

// image of lock for modeling reference, not important
const lockmap = new THREE.TextureLoader().load( './media/images/lockimage.png' );
const lockpicmaterial = new THREE.SpriteMaterial( { map: lockmap } );

const lockpicture = new THREE.Sprite( lockpicmaterial );
lockpicture.position.set(-0.7, 0, 0);
lockpicture.scale.set(21,14,1);
lockpicture.visible = false;
scene.add(lockpicture);

// Audio Elements
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();

audioLoader.load( './media/audio/complete.wav', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( false );
    sound.setVolume( 0.5 );
});

//GLTF Loader loads 3D imported models
const loader = new GLTFLoader();

// load lock model
let lockpad;
loader.load( './media/models/locknopadlock.glb', function ( gltf ) {
    lockpad = gltf.scene;
    gltf.scene.position.set(0, 0, -1);
    //uncomment to add wireframe mode
    // gltf.scene.traverse((node) => {
    //     if (!node.isMesh) return;
    //     node.material.wireframe = true;
    //   });
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// padlock body part, just a giant box
const padlockgeo = new THREE.BoxGeometry(6, 6, 0.2);
const padlockmat = new THREE.MeshBasicMaterial({  color: 0x000000, wireframe: true });
const padlock = new THREE.Mesh( padlockgeo, padlockmat);
scene.add(padlock);

// load lock pick(grey thing)
let x_lock_offset = 1.9;
let lockpick2;
loader.load( './media/models/pickv1.glb', function ( gltf ) {
    lockpick2 = gltf.scene;
    gltf.scene.position.set(7+x_lock_offset, 0, 0.5);
    gltf.scene.scale.set(3, 3, 3);
    gltf.scene.rotateZ(Math.PI);
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

// creates a collision detection box around the lock pick, should try to make more accurate later
const geometry = new THREE.BoxGeometry(3.25, 0.4, 0.2);
const material = new THREE.MeshBasicMaterial({  color: 0x00ff00, visible:false});
const lockpick = new THREE.Mesh( geometry, material);

lockpick.position.set(2.5+x_lock_offset,-0.15,0.5);
scene.add(lockpick);

// lock pick bounding box
let lockpick1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
lockpick1BB.setFromObject(lockpick);

/*
/////////////////////////THE SEVEN CYLINDERS////////////////////////////
/*/
//Materials
const r = 0.12;
const start_height = 0.5;
const geocylinder = new THREE.CylinderGeometry( r, r, 1, 32 ); 
const matcylinder = new THREE.MeshMatcapMaterial( {matcap: matcapGoldTexture} ); 
const cylinder = new THREE.Mesh( geocylinder, matcylinder);

//building cylinders + bounding boxes + array to check if clicked
let cArray = [];
let cBBoxs = [];
let cclicked = Array(7).fill(false);
for(let i = 0; i < 7; i++){
    cArray.push(cylinder.clone());
    cArray[i].position.set(i/2.2-0.75, start_height, 0.5);
    cBBoxs.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
    cBBoxs[i].setFromObject(cArray[i]);
    scene.add(cArray[i]);
}

// repeats over and over to generate "animations"
function animate(){
    requestAnimationFrame( animate );
    //update cylinder locations from collisions betwee pick and cylinder
    for(let i = 0; i < 7; i++){
        if(cArray[i].position.y > start_height && !cclicked[i]){
            cArray[i].position.y -=0.01;
        }
        if(lockpick1BB.intersectsBox(cBBoxs[i]) && !cclicked[i]){
            cArray[i].position.y +=0.1;
        }
        cBBoxs[i].copy(cArray[i].geometry.boundingBox).applyMatrix4(cArray[i].matrixWorld);
        if(cArray[i].position.y >=2 && !cclicked[i]){
            cclicked[i] = true;
            sound.play();
            addProgress();
        }
    }
    lockpick1BB.copy( lockpick.geometry.boundingBox).applyMatrix4(lockpick.matrixWorld);
    renderer.render( scene, camera );
}
animate();
document.onkeydown = function(e){
    //move lockpick left with left arrow
    if(e.keyCode === 37){
        if (lockpick.position.x >= 0.5){
            lockpick.position.x -=0.1;
            lockpick2.position.x -=0.1;
        }
    }
    //move lockpick right with right arrow
    if(e.keyCode === 39){
        lockpick.position.x +=0.1;
        lockpick2.position.x +=0.1;
    }
    //move lockpick up with up arrow
    if(e.keyCode === 38){
        lockpick.position.y +=0.1;
        lockpick2.position.y +=0.1;
    }
    if(e.keyCode === 40){
        if(lockpick.position.y >=-0.4){
            lockpick.position.y -=0.1;
            lockpick2.position.y -=0.1;
        }
    }
    
}

//Buttons controling the angle at which the pick is at
document.querySelector('#add-button').addEventListener("click", function() {
    let currVal = Number(document.querySelector('#angle-value').innerText);
    lockpick2.rotateZ(-Math.PI/180);
  });
  document.querySelector('#sub-button').addEventListener("click", function() {
    let currVal = Number(document.querySelector('#angle-value').innerText);
    lockpick2.rotateZ(Math.PI/180);
  });

// uncomment to see reference image, may or may not work
// const button = document.querySelector('button');
// var ref_hidden = true;
// button.addEventListener('click', onButtonClick);
// function onButtonClick() {
//     if(ref_hidden){
//         lockpicture.visible = true;
//         button.textContent = "Hide Reference Image!";
//         ref_hidden = false;
//     }else{
//         lockpicture.visible = false;
//         button.textContent = "Show Reference Image!";
//         ref_hidden = true;
//     }
    
// }