// C.js
let scene, camera, renderer, cMesh;

// 회전 속도(각 축)
let rx = 0, ry = 0, rz = 0;

function init3D() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(2, 250 / 300, 0.1, 1000);
  camera.position.z = 4;

  const canvas = document.getElementById('canvas3d');
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(400, 400);
  renderer.setClearColor(0xffffff, 1);

  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(0, 5, 10).normalize();
  scene.add(light);

  const loader = new THREE.GLTFLoader();
  loader.load('images/C.gltf', (gltf) => {
    cMesh = gltf.scene;
    scene.add(cMesh);
  });
}

// 주기적으로 회전 속도 변경 (예: 3초마다)
function randomizeRotationSpeed() {
  // -0.01 ~ 0.01 범위 임의 값
  rx = (Math.random() - 0.5) * 0.02;
  ry = (Math.random() - 0.5) * 0.02;
  rz = (Math.random() - 0.5) * 0.02;
}

// 애니메이션 루프
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;
  if (cMesh) {
    cMesh.rotation.x = Math.sin(time) * 0.5;
    cMesh.rotation.y = Math.sin(time * 0.8) * 1.0;
  }
  renderer.render(scene, camera);
}

window.addEventListener('load', () => {
  init3D();
  animate();
  // 3초마다 랜덤 회전 속도 갱신
  setInterval(randomizeRotationSpeed, 3000);
  randomizeRotationSpeed(); // 초기 속도도 설정
});