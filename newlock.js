import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight*0.8);
document.body.appendChild(renderer.domElement);


const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("https://bruno-simon.com/prismic/matcaps/3.png");
const matcapGoldTexture = textureLoader.load("./MetalGoldPaint002/MetalGoldPaint002_Sphere.png")
//set background
const blue = new THREE.Color( 'skyblue' );
scene.background = blue;

//image of lock for modeling reference
const lockmap = new THREE.TextureLoader().load( './lockimage.png' );
const lockpicmaterial = new THREE.SpriteMaterial( { map: lockmap } );

const lockpicture = new THREE.Sprite( lockpicmaterial );
lockpicture.position.set(-0.7, 0, 0);
lockpicture.scale.set(21,14,1);
lockpicture.visible = false;
scene.add(lockpicture);

//move around
// const controls = new OrbitControls( camera, renderer.domElement );
// 			controls.target.set( 0, 0.5, 0 );
// 			controls.update();
// 			controls.enablePan = false;
// 			controls.enableDamping = true;
//             controls.enableKeys = false
// //audio
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();

audioLoader.load( './audio/complete.wav', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( false );
    sound.setVolume( 0.5 );
});

//set light
const light = new THREE.PointLight( 0xffffff, 5, 100 ); // soft white light
light.position.set(0, 3, 1);
scene.add( light );
const loader = new GLTFLoader();

//load cat 3D model
let cat;
loader.load( './lock.glb', function ( gltf ) {
    cat = gltf.scene;
    gltf.scene.position.set(0, 0, -1);
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

//padlock body
const geopadlock = new THREE.BoxGeometry(3, 3, 0.4);
const matpadlock = new THREE.MeshBasicMaterial({ color: 0xffffff });
matpadlock.transparent = true;
matpadlock.opacity = 0.3;
const padlock = new THREE.Mesh(geopadlock, matpadlock);
scene.add(padlock);
//green lock pick
const geometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
//const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
const material = new THREE.MeshBasicMaterial({  color: 0x00ff00 });
const lockpick = new THREE.Mesh( geometry, material);

lockpick.position.set(2,-1,0);
scene.add(lockpick);

//handle of lock pick
const geohandle = new THREE.BoxGeometry(1, 0.2, 0.2);
const handle = new THREE.Mesh(geohandle, material);
handle.position.set(2+.4,-1-.2,0);
scene.add(handle);
//lock pick bounding box
let lockpick1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
lockpick1BB.setFromObject(lockpick);

//first grey cylinder thingy
const geocylinder = new THREE.CylinderGeometry( 0.2, 0.2, 1, 32 ); 
const matcylinder = new THREE.MeshMatcapMaterial( {matcap: matcapTexture} ); 
const cylinder = new THREE.Mesh( geocylinder, matcylinder); scene.add( cylinder );

//first grey cylinder bounding box
let cylinder1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cylinder1BB.setFromObject(cylinder);
camera.position.z = 10;

//first gold cylinder thingy
const topgeocylinder = new THREE.CylinderGeometry( 0.2, 0.2, 0.4, 32 ); 
const topmatcylinder = new THREE.MeshMatcapMaterial( {matcap: matcapGoldTexture} ); 
const topcylinder = new THREE.Mesh( topgeocylinder, topmatcylinder); 
topcylinder.position.set(0, 0.7, 0);
scene.add( topcylinder );

//second grey cylinder 
const cylinder2 = new THREE.Mesh( geocylinder, matcylinder); 
cylinder2.position.set(1,0,0);
scene.add(cylinder2);
//second grey cylinder bounding box
let cylinder2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cylinder2BB.setFromObject(cylinder2);

//second gold cylinder 
const topcylinder2 = new THREE.Mesh( topgeocylinder, topmatcylinder); 
topcylinder2.position.set(1, 0.7, 0);
scene.add( topcylinder2 );

//third grey cylinder
const cylinder3 = new THREE.Mesh( geocylinder, matcylinder); 
cylinder3.position.set(-1,0,0);
scene.add(cylinder3);
//third grey cylinder bounding box
let cylinder3BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cylinder3BB.setFromObject(cylinder3);

//third gold cylinder 
const topcylinder3 = new THREE.Mesh( topgeocylinder, topmatcylinder); 
topcylinder3.position.set(-1, 0.7, 0);
scene.add( topcylinder3 );

//bool to see if cylinders pass height requirement
var cylinder_clicked = false;
var cylinder2_clicked = false;
var cylinder3_clicked = false;

//counter to see how many pins you have clicked
let counterDisplayElem = document.querySelector('.counter-display');
let count = 0;

function animate(){
    requestAnimationFrame( animate );
    //cat.rotateY(0.01);
    //update bounding box
    if(cylinder.position.y > 0 && !cylinder_clicked){
        cylinder.position.y -=0.01;
    }
    if(cylinder2.position.y > 0 && !cylinder2_clicked){
        cylinder2.position.y -=0.01;
    }
    if(cylinder3.position.y > 0 && !cylinder3_clicked){
        cylinder3.position.y -=0.01;
    }
    if(topcylinder.position.y > 0.7 && !cylinder_clicked){
        topcylinder.position.y -=0.01;
    }
    if(topcylinder2.position.y > 0.7 && !cylinder2_clicked){
        topcylinder2.position.y -=0.01;
    }
    if(topcylinder3.position.y > 0.7  && !cylinder3_clicked){
        topcylinder3.position.y -=0.01;
    }
    if(lockpick1BB.intersectsBox(cylinder1BB) && !cylinder_clicked){
        cylinder.position.y +=0.1;
        topcylinder.position.y +=0.1;
    }
    if(lockpick1BB.intersectsBox(cylinder2BB) && !cylinder2_clicked){
        cylinder2.position.y +=0.1;
        topcylinder2.position.y +=0.1;
    }
    if(lockpick1BB.intersectsBox(cylinder3BB)  && !cylinder3_clicked){
        cylinder3.position.y +=0.1;
        topcylinder3.position.y +=0.1;
    }
    //make cylinders fixed if they reach a certain height
    if(cylinder.position.y >=2 && !cylinder_clicked){
        cylinder_clicked = true;
        sound.play();
        count++;
        counterDisplayElem.innerHTML = count;
    }
    if(cylinder2.position.y >=2 && !cylinder2_clicked){
        cylinder2_clicked = true;
        sound.play();
        count++;
        counterDisplayElem.innerHTML = count;
    }
    if(cylinder3.position.y >=2 && !cylinder3_clicked){
        cylinder3_clicked = true;
        sound.play();
        count++;
        counterDisplayElem.innerHTML = count;
    }
    lockpick1BB.copy( lockpick.geometry.boundingBox).applyMatrix4(lockpick.matrixWorld);
    cylinder1BB.copy( cylinder.geometry.boundingBox).applyMatrix4(cylinder.matrixWorld);
    cylinder2BB.copy( cylinder2.geometry.boundingBox).applyMatrix4(cylinder2.matrixWorld);
    cylinder3BB.copy( cylinder3.geometry.boundingBox).applyMatrix4(cylinder3.matrixWorld);
    console.log(lockpick1BB);
    console.log(lockpick.position);
    //controls.update();
    renderer.render( scene, camera );
}
animate();
document.onkeydown = function(e){
    if(e.keyCode === 37){
        lockpick.position.x -=0.1;
        handle.position.x -=0.1;
    }
    if(e.keyCode === 39){
        lockpick.position.x +=0.1;
        handle.position.x +=0.1;
    }
    if(e.keyCode === 38){
        lockpick.position.y +=0.1;
        handle.position.y +=0.1;
    }
    if(e.keyCode === 40){
        lockpick.position.y -=0.1;
        handle.position.y -=0.1;
    }
    
}

//button stuff

const button = document.querySelector('button');
var ref_hidden = true;
button.addEventListener('click', onButtonClick);
function onButtonClick() {
    if(ref_hidden){
        lockpicture.visible = true;
        button.textContent = "Hide Reference Image!";
        ref_hidden = false;
    }else{
        lockpicture.visible = false;
        button.textContent = "Show Reference Image!";
        ref_hidden = true;
    }
    
}