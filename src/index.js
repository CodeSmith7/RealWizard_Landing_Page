import * as THREE from 'three'
import { WaterEffect } from './WaterEffect'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Water } from 'three/examples/jsm/objects/Water.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


// Get the canvas element
const canvas = document.getElementById('scene-canvas');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true })
document.body.append(renderer.domElement)
renderer.setSize(canvas.clientWidth/2, canvas.clientHeight/2);


const camera = new THREE.PerspectiveCamera()
camera.position.set(0,10,5)

const scene = new THREE.Scene()
const width = 14;
const height = 4;

//console.log("width :", width, "height :" , height);
console.log("Canvas is : ", canvas, "height : ", canvas.clientHeight , "width : ", canvas.clientWidth);

const planeColor = [
  '#87CEFA', // Light Sky Blue
  '#FFB6C1', // Super Light Pink
  '#FFA07A', // Light Orange
  '#B0E57C', // Light Green
  '#FFB6C1', // Light Pink
  '#00BFFF'  // Water Blue
];



// let deltaHeight = 10;
// for (let i = 0; i < 6;i++) {
 
//   const geometry = new THREE.PlaneGeometry()
//   geometry.scale(width,height,0.1)
//   const material = new THREE.MeshBasicMaterial({ color: planeColor[i] }); // Pink color
//   const mesh = new THREE.Mesh(geometry, material)
//   mesh.position.set(0, deltaHeight, 0);

//   console.log (" mesh : ", i+1," is ", mesh.position, "plane color : ", planeColor[i]);
//   scene.add(mesh)

//   deltaHeight -= 4;

// }


let deltaHeight = 10;
const planeWidth = 5;
const planeHeight = 2;
const fontSize = 0.5;  // Adjust this based on your plane size


const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {


  for (let i = 0; i < 6; i++) {
    
    // Create plane
    const geometry = new THREE.PlaneGeometry(planeWidth + 6, planeHeight + 2);
    const material = new THREE.MeshBasicMaterial({ color: planeColor[i] });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, deltaHeight, 0);
    scene.add(mesh);

    // Create text
    const textGeometry = new TextGeometry(`Plane ${i+1}`, {
      font: font,
      size: fontSize,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: false
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black text color
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position the text on the plane
    textMesh.position.set(-planeWidth / 2 + 1, deltaHeight, 0.1); // Offset slightly above the plane
    scene.add(textMesh);

    deltaHeight -= 4;
  }

});




// const geometry = new THREE.PlaneGeometry()
// geometry.scale(width,height,0.1)
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

// const geometry1 = new THREE.PlaneGeometry()
// geometry1.scale(width,height,0.1)
// const material1 = new THREE.MeshBasicMaterial({ color: 0xff69b4 }); // Pink color
// const mesh1 = new THREE.Mesh(geometry1, material1)
// scene.add(mesh1)
// mesh1.position.set(0,-4,0)
// console.log ("mesh position is : ", mesh1.position )




//renderer.setClearColor(0x0E87CC,1);

//controls 
//const controls = new OrbitControls(camera, renderer.domElement);
//const controls = new TrackballControls(camera, renderer.domElement);


//axes
const axesHelper = new THREE.AxesHelper(20); // Size of the axes
scene.add(axesHelper);

const effect = new WaterEffect(renderer);

const handleResize = () => {
  effect.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

handleResize()


// Create water bubbles
const bubbles = [];

function createBubble(radius, position) {
    const bubbleGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        alpha : true,
        transmission: 1,
        transparent: true,
        opacity: 0.7,
        envMapIntensity: 0,
        clearcoat: 0,
        clearcoatRoughness: 0.0
    });
   
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.position.copy(position);
    bubble.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0
    );
    bubbles.push(bubble);
    scene.add(bubble);
}

//adding ambition ligth
const ambientLight = new THREE.AmbientLight(0xffffff, 10); // Soft white light
ambientLight.position.set(0,0,6);
scene.add(ambientLight);

//adding direcion light 
const light1 = new THREE.DirectionalLight(0xffffff, 2);
light1.position.set(0,0,6);
scene.add(light1);

// Post-processing for glow
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new BloomPass(
    1.25,    // Strength of the bloom
    25,      // Kernel size
    4.0,     // Sigma (blurring strength)
    256      // Resolution of the bloom effect
);
composer.addPass(bloomPass);

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Add bubbles to the scene
// for (let i = 0; i < 400; i++) {
//     const radius =   0.07;
//     const position = new THREE.Vector3(
//       getRandomFloat(-4,4),
//         -3,
//         3
//     );
//     createBubble(radius, position);
// }




//Adding bucket to the scene


const gltfLoader = new GLTFLoader();

let carModel;

gltfLoader.load('models/taxi.glb', function(gltf) {
    const model = gltf.scene;
    carModel = model;
    
    model.rotation.set(Math.PI, -Math.PI/2 , Math.PI/2 );
    model.scale.set(1, 1, 1);

    scene.add(model); // Add bucket to the group
}, function(xhr) {
    console.log('Loading progress:', (xhr.loaded / xhr.total) * 100 + '%');
}, function(error) {
    console.error('An error occurred while loading the model:', error);
});





// Scroll event handler on the canvas
function onSceneScroll(event) {
  const scrollSpeed = 0.001;

  // Move the car model in the Y direction based on scroll
  if (carModel &&  camera.position.y < 0) {
    carModel.position.y -= event.deltaY * scrollSpeed;

    // Optional: Clamp the car model position to a specific range
    carModel.position.y = Math.max(carModel.position.y, -10);
    carModel.position.y = Math.min(carModel.position.y, 0);
  }

  // Move the camera in the Y direction
  camera.position.y -= event.deltaY * scrollSpeed;

  // Optional: Clamp the camera position to a specific range
  camera.position.y = Math.max(camera.position.y, -10);
  camera.position.y = Math.min(camera.position.y, 10);

  event.preventDefault();
}

// Add the scroll event listener to the canvas
canvas.addEventListener('wheel', onSceneScroll);



window.addEventListener('resize', handleResize)

renderer.setAnimationLoop(() => {

  composer.render();
  
  //controls.update();

  //Update bubble positions
  // bubbles.forEach(bubble => {
  //     bubble.position.add(bubble.userData.velocity);
  //     // If the bubble goes out of bounds, reverse its velocity
  //     //if (Math.abs(bubble.position.x) > 5) bubble.userData.velocity.x *= -1;

  //     bubble.position.y += bubble.userData.velocity.y;

  //     //if (bubble.position.y < 5 || bubble.position.y >= -5) bubble.userData.velocity.y *= 1;
      
  //     if (bubble.position.y > 4) {
  //       bubble.position.y = -3;
  //     }

  //     //if (Math.abs(bubble.position.z) > 1) bubble.userData.velocity.z *= -1;
  // });

 
  effect.render(scene, camera)
})
