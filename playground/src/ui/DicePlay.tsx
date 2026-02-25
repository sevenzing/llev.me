import * as THREE from 'three';
import * as CANNON from 'cannon';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {  useEffect, useRef } from "react";
import * as DICES from '../tools/dice';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
let v = 0;

export const DicePlay = () => {
    const refContainer = useRef(null);
    useEffect(() => {
        initThree(refContainer).catch(console.error);
      }, []);

    return <div ref={refContainer}/>;
}


const initThree = async (refContainer: any) => {
  if (v === 0) {
    v = 1;
    return
  }
  // === THREE.JS CODE START ===
  // Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(3.15, 2.4, 2.4).multiplyScalar(1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  // Render
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const current = refContainer.current;
  current && !current.hasChildNodes() && current.appendChild(renderer.domElement);
  // Controls
  new OrbitControls(camera, renderer.domElement)
  // Physics
  const world = new CANNON.World();
  world.gravity.set(0, -9.82 / 4, 0); // m/s²
  DICES.DiceManager.setWorld(world);
  // Gui
  const gui = new GUI();
  const cameraGuiFolder = gui.addFolder('Camera')
  cameraGuiFolder.add(camera.position, 'x', -10, 10, 0.01);
  cameraGuiFolder.add(camera.position, 'y', -10, 10, 0.01);
  cameraGuiFolder.add(camera.position, 'z', -10, 10, 0.01);
  // Floor
  const floorMaterial = new THREE.MeshPhongMaterial( { color: '#00aa00', side: THREE.DoubleSide } );
	const floorGeometry = new THREE.PlaneGeometry(30, 30, 10, 10);
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -1.5;
	floor.receiveShadow  = true;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
  const floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: DICES.DiceManager.floorBodyMaterial});
  floorBody.position.copy(floor.position as any);
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -floor.rotation.x);
  world.addBody(floorBody);

  // Dices
  const d4 = new DICES.DiceD4({
    size: 0.3,
    fontColor: '#000000',
    backColor: '#ffffff',
  });
  d4.getObject()!.position.set(0, 1, 0);
  d4.updateBodyFromMesh();

  console.log(d4.getCurrentVectors());
  

  scene.add(d4.getObject() as any);
  // DICES.DiceManager.prepareValues([{dice: d4, value: 3}]);

  d4.shiftUpperValue(3);
  

  

  addLights(scene);

  createFloor(scene, world);

  // const diceManager = await loadDices();
  // const d4 = addDiceToScene(diceManager, 'd4', scene);
  // d4.position.x = -2;

let i = 0;
  const animate = () => {
    world.step(1.0 / 60.0);
    d4.updateMeshFromBody();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}


type Dice = THREE.Mesh;
type DiceMap = {
  [key: string]: Dice;
 };
type DiceManager = {
  allDices: DiceMap,
  dicesInScene: {
    [key: string]: Dice[];
  };
}

const loadDices = async () => {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('assets/dices/dnd_dice/scene.gltf');  
  let dices: DiceMap = {}
  gltf.scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if ((mesh.isMesh)) {
          const die = mesh;
          console.log(die.material);
          (die.material as any).color = new THREE.Color(0xFFFED3);
          const name = mesh.name as keyof DiceMap;
          dices[name] = die;
      }
  });

  return {
    allDices: dices,
    dicesInScene: {}
  } as DiceManager;
}


const addDiceToScene = (manager: DiceManager, diceName: string, scene: THREE.Scene) => {
  manager.dicesInScene[diceName] = manager.dicesInScene[diceName] || [];
  const dice = manager.allDices[diceName].clone();
  manager.dicesInScene[diceName].push(dice);
  scene.add(dice);
  return dice as Dice;
}


const animateCurrentDices = (manager: DiceManager) => {
  Object.values(manager.dicesInScene).forEach(dices => {
    dices.forEach(dice => {
      dice.rotation.x += 0.005;
      dice.rotation.y += 0.005;
    });
  });
}

const addLights = (scene: THREE.Scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, .5);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, .5);
    topLight.position.set(10, 15, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 5;
    topLight.shadow.camera.far = 400;
    scene.add(topLight);
}


const createFloor = (scene: THREE.Scene, physicsWorld: CANNON.World) => {
  const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.ShadowMaterial({
          opacity: .1
      })
  )
  floor.receiveShadow = true;
  floor.position.y = -7;
  floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
  scene.add(floor);

  const floorBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
  });
  floorBody.position.copy(floor.position as any);
  floorBody.quaternion.copy(floor.quaternion as any);
  physicsWorld.addBody(floorBody);
}
