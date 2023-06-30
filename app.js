// ====== Imports ======

import OnirixSDK from "https://unpkg.com/@onirix/ar-engine-sdk@1.3.1/dist/ox-sdk.esm.js";
import * as THREE from "https://cdn.skypack.dev/three@0.127.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

// ====== ThreeJS ======

var renderer, scene, camera, floor, car, ethos,blood,cARM,vital, envMap,clock,animationMixers;
var isCarPlaced = false;
var isEthosPlaced= false;
function setupRenderer(rendererCanvas) {
  
  const width = rendererCanvas.width;
  const height = rendererCanvas.height;

  // Initialize renderer with rendererCanvas provided by Onirix SDK
  renderer = new THREE.WebGLRenderer({ canvas: rendererCanvas, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Ask Onirix SDK for camera parameters to create a 3D camera that fits with the AR projection.
  const cameraParams = OX.getCameraParameters();
  camera = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, 0.1, 1000);
  camera.matrixAutoUpdate = false;

  // Create an empty scene
  scene = new THREE.Scene();

  // Add some lights
  const hemisphereLight = new THREE.HemisphereLight(0xbbbbff, 0x444422);
  scene.add(hemisphereLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 0);
  scene.add(directionalLight);

  // Load env map
  const textureLoader = new THREE.TextureLoader();
  envMap = textureLoader.load("envmap.jpg");
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.encoding = THREE.sRGBEncoding;

  // Add transparent floor to generate shadows
  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    })
  );
  animationMixers=[];
  clock = new THREE.Clock(true);
  // Rotate floor to be horizontal
  floor.rotateX(Math.PI / 2);
}

function updatePose(pose) {
  // When a new pose is detected, update the 3D camera
  let modelViewMatrix = new THREE.Matrix4();
  modelViewMatrix = modelViewMatrix.fromArray(pose);
  camera.matrix = modelViewMatrix;
  camera.matrixWorldNeedsUpdate = true;
}

function onResize() {
  // When device orientation changes, it is required to update camera params.
  const width = renderer.domElement.width;
  const height = renderer.domElement.height;
  const cameraParams = OX.getCameraParameters();
  camera.fov = cameraParams.fov;
  camera.aspect = cameraParams.aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function render() {
  // Just render the scene
  renderer.render(scene, camera);
}

function onHitResult(hitResult) {
  if (car && !isCarPlaced) {
    document.getElementById("transform-controls").style.display = "block";
    car.position.copy(hitResult.position);
  }
  if (ethos && !isCarPlaced) {
    document.getElementById("transform-controls").style.display = "block";
    ethos.position.copy(hitResult.position);
  }
  if (blood && !isCarPlaced) {
    document.getElementById("transform-controls").style.display = "block";
    blood.position.copy(hitResult.position);
  }
  if (cARM && !isCarPlaced) {
    document.getElementById("transform-controls").style.display = "block";
    cARM.position.copy(hitResult.position);
  }
  if (vital && !isCarPlaced) {
    document.getElementById("transform-controls").style.display = "block";
    vital.position.copy(hitResult.position);
  }
  
}

function placeCar() {
  isCarPlaced = true;
  OX.start();
}


function scaleCar(value) {
  const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };
  const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };
  car.scale.set(value, value, value);
}

function scaleEthos(value) {
  ethos.scale.set(value, value, value);
}

function scaleBlood(value) {
  blood.scale.set(value, value, value);
}

function scalecARM(value) {
  cARM.scale.set(value, value, value);
}
function scalevital(value) {
  vital.scale.set(value, value, value);
}


function rotateCar(value) {
  car.rotation.y = value;
}

function rotateEthos(value) {
  ethos.rotation.y = value;
}

function rotateBlood(value) {
  blood.rotation.y = value;
}

function rotatecARM(value) {
  cARM.rotation.y = value;
}
function rotatevital(value) {
  vital.rotation.y = value;
}

function changemodel(value) {
  car.traverse((child) => {
    if (child.material && child.material.name === "CarPaint") {
      child.material.color.setHex(value);
    }
  });
}

function changeEthos(value) {
  ethos.traverse((child) => {
    if (child.material && child.material.name === "CarPaint") {
      child.material.color.setHex(value);
    }
  });
}


// ====== Onirix SDK ======

const OX = new OnirixSDK(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyMDIsInByb2plY3RJZCI6MTQ0MjgsInJvbGUiOjMsImlhdCI6MTYxNjc1ODY5NX0.8F5eAPcBGaHzSSLuQAEgpdja9aEZ6Ca_Ll9wg84Rp5k"
);

const config = {
  mode: OnirixSDK.TrackingMode.Surface,
};

function loadGLB(filename){
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(filename, (gltf) => {
    car = gltf.scene;
    const animations = gltf.animations;
    car.traverse((child) => {
      if (child.material) {
        console.log("updating material");
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
    car.scale.set(0.5, 0.5, 0.5);
    scene.add(car);
    const mixer = new THREE.AnimationMixer(car);
        const action = mixer.clipAction(animations[0]);
        action.play();
        setInterval(() => {
          action.stop()
        }, 60000);
       animationMixers.push(mixer);

    // All loaded, so hide loading screen
    document.getElementById("loading-screen").style.display = "none";

    document.getElementById("initializing").style.display = "block";

    document.getElementById("tap-to-place").addEventListener("click", () => {
      placeCar();
      document.getElementById("transform-controls").style.display = "none";
      document.getElementById("color-controls").style.display = "block";
    });

    const scaleSlider = document.getElementById("scale-slider");
    scaleSlider.addEventListener("input", () => {
      scaleCar(scaleSlider.value / 100);
    });
    const rotationSlider = document.getElementById("rotation-slider");
    rotationSlider.addEventListener("input", () => {
      rotateCar((rotationSlider.value * Math.PI) / 180);
    });
  });
  gltfLoader.load("ETHOSs.glb", (gltf) => {
    ethos = gltf.scene;
    const animations = gltf.animations;
    ethos.traverse((child) => {
      if (child.material) {
        console.log("updating material");
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
    ethos.scale.set(0.5, 0.5, 0.5);
    // scene.add(ethos);
    const mixer = new THREE.AnimationMixer(ethos);
        const action = mixer.clipAction(animations[0]);
        action.play();
        setInterval(() => {
          action.stop()
        }, 60000);
       animationMixers.push(mixer);

    // All loaded, so hide loading screen
    document.getElementById("loading-screen").style.display = "none";

    document.getElementById("initializing").style.display = "block";

    document.getElementById("tap-to-place").addEventListener("click", () => {
      placeCar();
      document.getElementById("transform-controls").style.display = "none";
      document.getElementById("color-controls").style.display = "block";
    });

    const scaleSlider = document.getElementById("scale-slider");
    scaleSlider.addEventListener("input", () => {
      scaleEthos(scaleSlider.value / 100);
    });
    const rotationSlider = document.getElementById("rotation-slider");
    rotationSlider.addEventListener("input", () => {
      rotateEthos((rotationSlider.value * Math.PI) / 180);
    });
  });
  gltfLoader.load("bloodsny.glb", (gltf) => {
    blood = gltf.scene;
    const animations = gltf.animations;
    blood.traverse((child) => {
      if (child.material) {
        console.log("updating material");
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
    blood.scale.set(0.5, 0.5, 0.5);
    // scene.add(blood);
    const mixer = new THREE.AnimationMixer(blood);
        const action = mixer.clipAction(animations[0]);
        action.play();
        setInterval(() => {
          action.stop()
        }, 60000);
       animationMixers.push(mixer);

    // All loaded, so hide loading screen
    document.getElementById("loading-screen").style.display = "none";

    document.getElementById("initializing").style.display = "block";

    document.getElementById("tap-to-place").addEventListener("click", () => {
      placeCar();
      document.getElementById("transform-controls").style.display = "none";
      document.getElementById("color-controls").style.display = "block";
    });

    const scaleSlider = document.getElementById("scale-slider");
    scaleSlider.addEventListener("input", () => {
      scaleBlood(scaleSlider.value / 100);
    });
    const rotationSlider = document.getElementById("rotation-slider");
    rotationSlider.addEventListener("input", () => {
      rotateBlood((rotationSlider.value * Math.PI) / 180);
    });
  });
  gltfLoader.load("C_ARM.glb", (gltf) => {
    cARM = gltf.scene;
    const animations = gltf.animations;
    cARM.traverse((child) => {
      if (child.material) {
        console.log("updating material");
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
    cARM.scale.set(0.5, 0.5, 0.5);
    // scene.add(cARM);
    const mixer = new THREE.AnimationMixer(cARM);
        const action = mixer.clipAction(animations[0]);
        action.play();
        setInterval(() => {
          action.stop()
        }, 60000);
       animationMixers.push(mixer);

    // All loaded, so hide loading screen
    document.getElementById("loading-screen").style.display = "none";

    document.getElementById("initializing").style.display = "block";

    document.getElementById("tap-to-place").addEventListener("click", () => {
      placeCar();
      document.getElementById("transform-controls").style.display = "none";
      document.getElementById("color-controls").style.display = "block";
    });

    const scaleSlider = document.getElementById("scale-slider");
    scaleSlider.addEventListener("input", () => {
      scalecARM(scaleSlider.value / 100);
    });
    const rotationSlider = document.getElementById("rotation-slider");
    rotationSlider.addEventListener("input", () => {
      rotatecARM((rotationSlider.value * Math.PI) / 180);
    });
  });
  gltfLoader.load("VITAL SIGNS MONITOR.glb", (gltf) => {
    vital = gltf.scene;
    const animations = gltf.animations;
    vital.traverse((child) => {
      if (child.material) {
        console.log("updating material");
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
    vital.scale.set(0.5, 0.5, 0.5);
    // scene.add(vital);
    const mixer = new THREE.AnimationMixer(vital);
        const action = mixer.clipAction(animations[0]);
        action.play();
        setInterval(() => {
          action.stop()
        }, 60000);
       animationMixers.push(mixer);

    // All loaded, so hide loading screen
    document.getElementById("loading-screen").style.display = "none";

    document.getElementById("initializing").style.display = "block";

    document.getElementById("tap-to-place").addEventListener("click", () => {
      placeCar();
      document.getElementById("transform-controls").style.display = "none";
      document.getElementById("color-controls").style.display = "block";
    });

    const scaleSlider = document.getElementById("scale-slider");
    scaleSlider.addEventListener("input", () => {
      scalevital(scaleSlider.value / 100);
    });
    const rotationSlider = document.getElementById("rotation-slider");
    rotationSlider.addEventListener("input", () => {
      rotatevital((rotationSlider.value * Math.PI) / 180);
    });
  })
  // Subscribe to events
  OX.subscribe(OnirixSDK.Events.OnPose, function (pose) {
    updatePose(pose);
  });

  OX.subscribe(OnirixSDK.Events.OnResize, function () {
    onResize();
  });

  OX.subscribe(OnirixSDK.Events.OnTouch, function (touchPos) {
    onTouch(touchPos);
  });

  OX.subscribe(OnirixSDK.Events.OnHitTestResult, function (hitResult) {
    document.getElementById("initializing").style.display = "none";
    onHitResult(hitResult);
  });

  OX.subscribe(OnirixSDK.Events.OnFrame, function() {
    const delta = clock.getDelta();
    animationMixers.forEach((mixer) => {
      mixer.update(delta);
    });
    render();
  });
}
OX.init(config)
  .then((rendererCanvas) => {
    // Setup ThreeJS renderer
    setupRenderer(rendererCanvas);
    // Load car model
    loadGLB("range_rover.glb");
    document.getElementById("black1").addEventListener("click", () => {
      //changemodel(range_rover.glb);
     scene.add(blood);
     scene.remove(car);
     scene.remove(ethos);
     scene.remove(vital);
     scene.remove(cARM);
   });
  
   document.getElementById("silver").addEventListener("click", () => {
    scene.add(ethos);
    scene.remove(car);
    scene.remove(blood);
    scene.remove(vital);
    scene.remove(cARM);
   });
  
   document.getElementById("orange").addEventListener("click", () => {
    scene.add(cARM);
    scene.remove(car);
    scene.remove(ethos);
    scene.remove(blood);
    scene.remove(vital);
   });
  
   document.getElementById("blue").addEventListener("click", () => {
    scene.add(vital);
    scene.remove(car);
    scene.remove(cARM);
    scene.remove(ethos);
    scene.remove(blood);
   });
  })
  .catch((error) => {
    // An error ocurred, chech error type and display it
    document.getElementById("loading-screen").style.display = "none";

    switch (error.name) {
      case "INTERNAL_ERROR":
        document.getElementById("error-title").innerText = "Internal Error";
        document.getElementById("error-message").innerText =
          "An unespecified error has occurred. Your device might not be compatible with this experience.";
        break;

      case "CAMERA_ERROR":
        document.getElementById("error-title").innerText = "Camera Error";
        document.getElementById("error-message").innerText =
          "Could not access to your device's camera. Please, ensure you have given required permissions from your browser settings.";
        break;

      case "SENSORS_ERROR":
        document.getElementById("error-title").innerText = "Sensors Error";
        document.getElementById("error-message").innerText =
          "Could not access to your device's motion sensors. Please, ensure you have given required permissions from your browser settings.";
        break;

      case "LICENSE_ERROR":
        document.getElementById("error-title").innerText = "License Error";
        document.getElementById("error-message").innerText = "This experience does not exist or has been unpublished.";
        break;
    }

    document.getElementById("error-screen").style.display = "flex";
  });

  
