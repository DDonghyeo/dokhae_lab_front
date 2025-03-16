// 여러 캔버스/씬을 관리하기 위한 배열
let scenesData = [];

// 전역 시간
let globalTime = 0;

function initCanvas(canvasId, modelPath, timeOffset) {
  // 1) 씬 생성
  const scene = new THREE.Scene();

  // 2) 카메라
  const camera = new THREE.PerspectiveCamera(1, 0.7, 0.1, 1000);
  camera.position.z = 3;

  // 3) renderer
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // 투명 배경
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 톤 매핑 (혹은 끄기)
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;

  // 조명
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(0, 5, 10).normalize();
  scene.add(dirLight);
  /*
  // AmbientLight도 원하면 추가
  const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambLight);
  */

  // 자료 구조
  const dataObj = {
    scene,
    camera,
    renderer,
    mesh: null, // 초기에는 null
    timeOffset
  };

  // 모델 로더
  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;

    // 로딩된 모델의 모든 Mesh에 대해 투명도 설정
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true; // 투명 활성화
        child.material.opacity = 0.8;      
        // 필요하면 child.material.side = THREE.DoubleSide;
      }
    });

    dataObj.mesh = model;
    scene.add(model);
  });

  // scenesData 배열에 푸시
  scenesData.push(dataObj);
}

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  globalTime += 0.01;

  // 모든 씬을 순회하며 업데이트 & 렌더
  for (let data of scenesData) {
    const { scene, camera, renderer, mesh, timeOffset } = data;
    if (mesh) {
      let t = globalTime + timeOffset;
      mesh.rotation.x = Math.sin(t) * 0.7;
      mesh.rotation.y = Math.sin(t * 0.9) * 1.2;
    }
    renderer.render(scene, camera);
  }
}

// 초기화 + animate 시작
window.addEventListener('load', () => {
  initCanvas('canvas3d1', 'images/A1.gltf', 0.0);
  initCanvas('canvas3d2', 'images/B2.gltf', 1.0);
  initCanvas('canvas3d3', 'images/C3.gltf', 2.0);
  animate();
});