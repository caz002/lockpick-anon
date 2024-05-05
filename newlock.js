import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// //move around
// const controls = new OrbitControls( camera, renderer.domElement );
// 			controls.target.set( 0, 0.5, 0 );
// 			controls.update();
// 			controls.enablePan = false;
// 			controls.enableDamping = true;
//             controls.enableKeys = false;

// const loader = new GLTFLoader();
// camera.position.z = 5;
// var light = new THREE.AmbientLight(0xffffff);
// scene.add(light);
// let cat;
// loader.load('lockv1.glb', function ( gltf ) {
//     cat = gltf.scene;
// 	scene.add( gltf.scene );

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// function animate() {
//     controls.update();
//     renderer.render( scene, camera );
// }

// animate();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
scene.background = new THREE.Color(0xEBE4E6);
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x453E40, wireframe: true } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
const controls = new OrbitControls( camera, renderer.domElement );
			controls.target.set( 0, 0.5, 0 );
			controls.update();
			controls.enablePan = false;
			controls.enableDamping = true;
            controls.enableKeys = false;


camera.position.z = 5;
const loader = new GLTFLoader();
// Load a glTF resource

function animate() {
	requestAnimationFrame( animate );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
    controls.update();
	renderer.render( scene, camera );
}

animate();