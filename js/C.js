// 여러 캔버스/씬을 관리하기 위한 배열
let scenesData = [];

// 전역 시간
let globalTime = 0;

function initCanvas(canvasId, modelPath, timeOffset) {
  // 1) 씬 생성
  const scene = new THREE.Scene();

  // 2) 카메라 (FOV=10, 종횡비=1, 클립=0.1~1000)
  //    필요하면 FOV값을 더 키우거나 줄이세요
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
  // canvas.clientWidth, clientHeight가 300이라면:
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // 흰색 배경
  renderer.setClearColor(0x000000, 0);
  // 색공간 sRGB
  renderer.outputEncoding = THREE.sRGBEncoding;


  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMapping = THREE.toneMappingExposure;
    renderer.toneMappingExposure = 1.0;
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(0, 5, 10).normalize();
    scene.add(dirLight);
    
    // const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    // scene.add(ambLight);

  // 5) 모델 로드
  //    "mesh"는 로더 콜백 이후 할당되므로, 객체에 따로 저장
  const dataObj = {
    scene,
    camera,
    renderer,
    mesh: null,       // 초기에는 null
    timeOffset       // 사인 회전 오프셋
  };

  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    // 혹시 필요하다면 model.scale.set(2, 2, 2); 등
    dataObj.mesh = model;          // 여기서 저장!
    scene.add(model);
  });

  // 이 sceneData를 배열에 등록
  scenesData.push(dataObj);
}

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  globalTime += 0.01; // 회전 속도 조절하고 싶으면 조정

  // 모든 씬을 순회하며 업데이트 & 렌더
  for (let data of scenesData) {
    const { scene, camera, renderer, mesh, timeOffset } = data;
    if (mesh) {
      // 사인 곡선 회전
      let t = globalTime + timeOffset;
      mesh.rotation.x = Math.sin(t) * 0.7;
      mesh.rotation.y = Math.sin(t * 0.9) * 1.2;
    }
    renderer.render(scene, camera);
  }
}

// 초기화 + animate 시작
window.addEventListener('load', () => {
  // canvas3d1 -> A1.gltf
  initCanvas('canvas3d1', 'images/A1.gltf', 0.0);
  // canvas3d2 -> B2.gltf
  initCanvas('canvas3d2', 'images/B2.gltf', 1.0);
  // canvas3d3 -> C3.gltf
  initCanvas('canvas3d3', 'images/C3.gltf', 2.0);

  animate();
});