import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl'),
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff0077, 1.5, 50);
pointLight.position.set(2, 5, 5);
scene.add(pointLight);

const backLight = new THREE.PointLight(0x00ffff, 1, 50);
backLight.position.set(-3, -3, -3);
scene.add(backLight);

// Load Radio model
const loader = new GLTFLoader();
let radioModel;

loader.load(
  '/radio.glb',
  (gltf) => {
    radioModel = gltf.scene;
    radioModel.scale.set(0.2, 0.2, 0.2);
    radioModel.position.set(0, 0.8, 0);
    scene.add(radioModel);

    document.getElementById('loading-screen').style.display = 'none';
  },
  undefined,
  (error) => {
    console.error('Error loading radio:', error);
    document.getElementById('loading-screen').style.display = 'none';
  }
);

// Particles
const particleCount = 400;
const particlesGeometry = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < particleCount; i++) {
  positions.push((Math.random() - 0.5) * 10);
  positions.push((Math.random() - 0.5) * 8);
  positions.push((Math.random() - 0.5) * 10);
}

particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.03,
  transparent: true,
  opacity: 0.5,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Bubbles
const bubbleCount = 20;
const bubbles = [];

const bubbleGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const bubbleMaterial = new THREE.MeshPhongMaterial({
  color: 0x99ccff,
  transparent: true,
  opacity: 0.4,
  shininess: 100,
  emissive: 0x111111,
});

for (let i = 0; i < bubbleCount; i++) {
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial.clone());
  resetBubble(bubble, true);
  scene.add(bubble);
  bubbles.push(bubble);
}

function resetBubble(bubble, initial = false) {
  bubble.position.set(
    (Math.random() - 0.5) * 6,
    initial ? Math.random() * 5 : -1,
    (Math.random() - 0.5) * 6
  );
  bubble.userData.velocity = 0.01 + Math.random() * 0.02;
  bubble.userData.rotationSpeed = (Math.random() - 0.5) * 0.01;
}

function animateBubbles() {
  bubbles.forEach((bubble) => {
    bubble.position.y += bubble.userData.velocity;
    bubble.rotation.y += bubble.userData.rotationSpeed;
    bubble.rotation.x += bubble.userData.rotationSpeed * 0.5;

    if (bubble.position.y > 5) {
      resetBubble(bubble);
    }
  });
}

// Scroll interaction
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  scrollVelocity = currentY - lastScrollY;
  lastScrollY = currentY;
});

function animateParticles() {
  const pos = particlesGeometry.attributes.position.array;
  const time = performance.now() * 0.001;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i + 1] += Math.sin(time + i) * 0.0003;
  }
  particlesGeometry.attributes.position.needsUpdate = true;
}

function getScrollProgress() {
  const scrollTop = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  return Math.min(scrollTop / maxScroll, 1);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  animateParticles();
  animateBubbles();

  if (radioModel) {
    const progress = getScrollProgress();
    const fullRotation = Math.PI * 2;

    // Updated rotation - only Y axis
    radioModel.rotation.set(0, progress * fullRotation, 0);

    // Floating effect
    radioModel.position.y = 0.8 + Math.sin(performance.now() * 0.001) * 0.05;
  }

  scrollVelocity *= 0.9;
  camera.position.z += (5 - scrollVelocity * 0.05 - camera.position.z) * 0.05;

  renderer.render(scene, camera);
}
animate();

// Parallax scroll
document.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  document.querySelectorAll(".parallax").forEach((el, index) => {
    el.style.transform = `translateY(${scrolled * 0.15 * (index + 1)}px)`;
  });
});
