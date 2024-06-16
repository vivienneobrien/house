import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import { Sky } from "three/addons/objects/Sky.js";

/**
 * Base
 */

const houseMeasurements = {
  floorWidth: 20,
  floorHeight: 20,
  floorWidthSegments: 100,
  floorHeightSegments: 100,
  wallsWidth: 4,
  wallsHeight: 2.5,
  wallsDepth: 4,
  roofRadius: 3.5,
  roofHeight: 1.5,
  roofSegments: 4,
  doorWidth: 2.2,
  doorHeight: 2.2,
  doorWidthSegments: 100,
  doorHeightSegments: 100,
  bushRadius: 1,
  bushwWidthSegments: 16,
  bushHeightSegments: 16,
  graveWidth: 0.6,
  graveHeight: 0.8,
  graveDepth: 0.2,
};
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
// Floor
const floorAlphaTexture = textureLoader.load("./floor/alpha.webp");
const floorColorTexture = textureLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp"
);
const floorARMTexture = textureLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp"
);
const floorNormalTexture = textureLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp"
);
const floorDisplacementTexture = textureLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp"
);

floorColorTexture.repeat.set(8, 8);
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;
floorColorTexture.colorSpace = THREE.SRGBColorSpace; // Only for colour textures - optimises way its been stores and will look at the end

floorARMTexture.repeat.set(8, 8);
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;

floorNormalTexture.repeat.set(8, 8);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

floorDisplacementTexture.repeat.set(8, 8); // lovethis one!
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

// Wall
const wallColorTexture = textureLoader.load(
  "./wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp"
);
const wallARMTexture = textureLoader.load(
  "./wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp"
);
const wallNormalTexture = textureLoader.load(
  "./wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp"
);

// Roof

const roofColorTexture = textureLoader.load(
  "./roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp"
);
const roofARMTexture = textureLoader.load(
  "./roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp"
);
const roofNormalTexture = textureLoader.load(
  "./roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp"
);

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);

roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

//Bushes
const bushColorTexture = textureLoader.load(
  "./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp"
);
const bushARMTexture = textureLoader.load(
  "./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp"
);
const bushNormalTexture = textureLoader.load(
  "./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp"
);

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

//Graves
const graveColorTexture = textureLoader.load(
  "./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp"
);
const graveARMTexture = textureLoader.load(
  "./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp"
);
const graveNormalTexture = textureLoader.load(
  "./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp"
);

graveColorTexture.colorSpace = THREE.SRGBColorSpace;

graveColorTexture.repeat.set(0.3, 0.4);
graveARMTexture.repeat.set(0.3, 0.4);
graveNormalTexture.repeat.set(0.3, 0.4);

// Door
const doorColorTexture = textureLoader.load("./door/color.webp");
const doorAlphaTexture = textureLoader.load("./door/alpha.webp");
const doorAmbientOcclusionTexture = textureLoader.load(
  "./door/ambientOcclusion.webp"
);
const doorHeightTexture = textureLoader.load("./door/height.webp");
const doorNormalTexture = textureLoader.load("./door/normal.webp");
const doorMetalnessTexture = textureLoader.load("./door/metalness.webp");
const doorRoughnessTexture = textureLoader.load("./door/roughness.webp");

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * House
 */
const houseGroup = new THREE.Group();
scene.add(houseGroup);
// Axis Helper
const axisHelper = new THREE.AxesHelper();
scene.add(axisHelper);

// Floor
const floorGeomtery = new THREE.PlaneGeometry(
  houseMeasurements.floorWidth,
  houseMeasurements.floorHeight,
  houseMeasurements.floorWidthSegments,
  houseMeasurements.floorHeightSegments
);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  alphaMap: floorAlphaTexture,
  transparent: true,
  aoMap: floorARMTexture,
  roughnessMap: floorARMTexture,
  metalnessMap: floorARMTexture,
  normalMap: floorNormalTexture,
  displacementMap: floorDisplacementTexture,
  displacementScale: 0.3,
  displacementBias: -0.2,
});
const floorMesh = new THREE.Mesh(floorGeomtery, floorMaterial);
floorMesh.rotation.x = -Math.PI * 0.5;
// Math.PI * 0.5; // this is quarter of a circle
gui
  .add(floorMaterial, "displacementScale")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Floor Displacement Scale");
gui
  .add(floorMaterial, "displacementBias")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Floor Displacement Bias");

scene.add(floorMesh);

// Walls
const wallsGeometry = new THREE.BoxGeometry(
  houseMeasurements.wallsWidth,
  houseMeasurements.wallsHeight,
  houseMeasurements.wallsDepth
);
const wallsMaterial = new THREE.MeshStandardMaterial({
  map: wallARMTexture,
  aoMap: wallColorTexture,
  roughnessMap: wallARMTexture,
  metalnessMap: wallARMTexture,
  normalMap: wallNormalTexture,
});
const wallsMesh = new THREE.Mesh(wallsGeometry, wallsMaterial);
wallsMesh.position.y = houseMeasurements.wallsHeight / 2;
houseGroup.add(wallsMesh); // Add to the group not to the house

// Roof
const roofGeometry = new THREE.ConeGeometry(
  houseMeasurements.roofRadius,
  houseMeasurements.roofHeight,
  houseMeasurements.roofSegments
);
const roofMaterial = new THREE.MeshStandardMaterial({
  map: roofColorTexture,
  aoMap: roofARMTexture,
  roughnessMap: roofARMTexture,
  metalnessMap: roofARMTexture,
  normalMap: roofNormalTexture,
});
const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
const halfHeightOfRoof = houseMeasurements.roofHeight / 2;
roofMesh.position.y = houseMeasurements.wallsHeight + halfHeightOfRoof; // 0.75 because which is half of the roofs height because the cones origin is at its center
roofMesh.rotation.y = Math.PI * 0.25;
houseGroup.add(roofMesh);
// Door
const doorGeometry = new THREE.PlaneGeometry(
  houseMeasurements.doorWidth,
  houseMeasurements.doorHeight,
  houseMeasurements.doorWidthSegments,
  houseMeasurements.doorHeightSegments
);
const doorMaterial = new THREE.MeshStandardMaterial({
  map: doorColorTexture,
  transparent: true,
  alphaMap: doorAlphaTexture,
  aoMap: doorAmbientOcclusionTexture,
  displacementMap: doorHeightTexture,
  displacementScale: 0.15,
  displacementBias: -0.04,
  normalMap: doorNormalTexture,
  metalnessMap: doorMetalnessTexture,
  roughnessMap: doorRoughnessTexture,
});
const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
doorMesh.position.y = 1;
doorMesh.position.z = 2 + 0.01; // 0.01 moves the door slightly infront
houseGroup.add(doorMesh);

// 4 different bushes
const bushGeometry = new THREE.SphereGeometry(
  1,
  houseMeasurements.bushwWidthSegments,
  houseMeasurements.bushHeightSegments
);
const bushMaterial = new THREE.MeshStandardMaterial({
  color: "ccffcc", // if you wanted to make the bush look more green
  map: bushColorTexture,
  aoMap: bushARMTexture,
  roughnessMap: bushARMTexture,
  metalnessMap: bushARMTexture,
  normalMap: bushNormalTexture,
});

const bushOneMesh = new THREE.Mesh(bushGeometry, bushMaterial);
bushOneMesh.scale.set(0.5, 0.5, 0.5);
bushOneMesh.position.set(0.8, 0.2, 2.2);
bushOneMesh.rotation.x = -0.75; // rotating texture so you do not see top skewing

const bushTwoMesh = new THREE.Mesh(bushGeometry, bushMaterial);
bushTwoMesh.scale.set(0.25, 0.25, 0.25);
bushTwoMesh.position.set(1.4, 0.1, 2.1);
bushTwoMesh.rotation.x = -0.75; // rotating texture so you do not see top skewing

const bushThreeMesh = new THREE.Mesh(bushGeometry, bushMaterial);
bushThreeMesh.scale.set(0.4, 0.4, 0.4);
bushThreeMesh.position.set(-0.8, 0.1, 2.2);
bushThreeMesh.rotation.x = -0.75; // rotating texture so you do not see top skewing

const bushFourMesh = new THREE.Mesh(bushGeometry, bushMaterial);
bushFourMesh.scale.set(0.15, 0.15, 0.15);
bushFourMesh.position.set(-1, 0.05, 2.6);
bushFourMesh.rotation.x = -0.75; // rotating texture so you do not see top skewing

houseGroup.add(bushOneMesh, bushTwoMesh, bushThreeMesh, bushFourMesh);

// Grave group

const gravesGroup = new THREE.Group();
scene.add(gravesGroup);

// grave
const graveGeometry = new THREE.BoxGeometry(
  houseMeasurements.graveWidth,
  houseMeasurements.graveHeight,
  houseMeasurements.graveDepth
);
const graveMaterial = new THREE.MeshStandardMaterial({
  map: graveColorTexture,
  aoMap: graveARMTexture,
  roughnessMap: graveARMTexture,
  metalnessMap: graveARMTexture,
  normalMap: graveNormalTexture,
});
gravesGroup.add(graveGeometry);

for (let i = 0; i <= 30; i++) {
  const angel = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 4; // so that they are not in the house
  const x = Math.sin(angel) * radius;
  const z = Math.cos(angel) * radius;

  const graveMesh = new THREE.Mesh(graveGeometry, graveMaterial);
  graveMesh.position.x = x;
  graveMesh.position.z = z;
  graveMesh.rotation.x = (Math.random() - 0.5) * 0.4;
  graveMesh.rotation.y = (Math.random() - 0.5) * 0.4;
  graveMesh.rotation.z = (Math.random() - 0.5) * 0.4;
  gravesGroup.add(graveMesh);
}
/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#86cdff", 0.275);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#86cdff", 1);
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);

// Door Light
const doorLight = new THREE.PointLight("#ff7d46", 5);
doorLight.position.set(0, 2.2, 2.5);
houseGroup.add(doorLight);

/**
 * Ghost section
 */

const ghostOne = new THREE.PointLight("#8800ff", 6);
const ghostTwo = new THREE.PointLight("#ff0088", 6);
const ghostThree = new THREE.PointLight("#ff0000", 6);
scene.add(ghostOne, ghostTwo, ghostThree);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cast and receive
directionalLight.castShadow = true;
ghostOne.castShadow = true;
ghostTwo.castShadow = true;
ghostThree.castShadow = true;
wallsMesh.castShadow = true;
wallsMesh.receiveShadow = true;
roofMesh.castShadow = true;
floorMesh.receiveShadow = true;
for (const grave of gravesGroup.children) {
  grave.castShadow = true; // Incredible
  grave.receiveShadow = true;
}

/**
 * Sky
 */
const sky = new Sky();
// make tweaks for these
// specific to shader materials
sky.scale.set(100, 100, 100); // can also do setScalar
sky.material.uniforms["turbidity"].value = 10;
sky.material.uniforms["rayleigh"].value = 3;
sky.material.uniforms["mieCoefficient"].value = 0.1;
sky.material.uniforms["mieDirectionalG"].value = 0.95;
sky.material.uniforms["sunPosition"].value.set(0.3, -0.038, -0.95);
scene.add(sky);
/**
 * Fog
 */

scene.fog = new THREE.Fog("#ff0000", 1, 13); // (colour, near, far)
scene.fog = new THREE.FogExp2("#02343f", 0.1); // (colour, density)

/**
 * Mapping
 */

directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;

ghostOne.shadow.mapSize.width = 256;
ghostOne.shadow.mapSize.height = 256;
ghostOne.shadow.camera.far = 10;

ghostTwo.shadow.mapSize.width = 256;
ghostTwo.shadow.mapSize.height = 256;
ghostTwo.shadow.camera.far = 10;

ghostThree.shadow.mapSize.width = 256;
ghostThree.shadow.mapSize.height = 256;
ghostThree.shadow.camera.far = 10;

/**
 * Animate
 */
const timer = new Timer();

const tick = () => {
  // Timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Ghost 1
  const ghostOneAngel = elapsedTime * 0.5;
  ghostOne.position.x = Math.cos(ghostOneAngel) * 4;
  ghostOne.position.z = Math.sin(ghostOneAngel) * 4;
  ghostOne.position.y =
    Math.sin(ghostOneAngel) *
    Math.sin(ghostOneAngel * 2.34) *
    Math.sin(ghostOneAngel * 3.45); // guessed values using https://www.desmos.com/calculator too see infrequency

  // Ghost 2
  const ghostTwoAngel = -elapsedTime * 0.38; // Changed to -
  ghostTwo.position.x = Math.cos(ghostTwoAngel) * 5; // Changed to 4
  ghostTwo.position.z = Math.sin(ghostTwoAngel) * 5;
  ghostTwo.position.y =
    Math.sin(ghostTwoAngel) *
    Math.sin(ghostTwoAngel * 2.34) *
    Math.sin(ghostTwoAngel * 3.45); // guessed values using https://www.desmos.com/calculator too see infrequency

  // Ghost 3
  const ghostThreeAngel = elapsedTime * 0.23;
  ghostThree.position.x = Math.cos(ghostThreeAngel) * 6;
  ghostThree.position.z = Math.sin(ghostThreeAngel) * 6;
  ghostThree.position.y =
    Math.sin(ghostThreeAngel) *
    Math.sin(ghostThreeAngel * 2.34) *
    Math.sin(ghostThreeAngel * 3.45); // guessed values using https://www.desmos.com/calculator too see infrequency
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
