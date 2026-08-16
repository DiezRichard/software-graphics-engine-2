let width = 700;
let height = 700;

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let scale = window.devicePixelRatio;

canvas.style.width = width + "px";
canvas.style.height = height + "px";

canvas.width = width * scale;
canvas.height = height * scale;

ctx.scale(scale, scale);
ctx.isSmoothEnable = true;


let offscreen = new OffscreenCanvas(canvas.width, canvas.height);
let offctx = offscreen.getContext("2d");

offctx.isSmoothEnable = true;

let offscreenGrid = new OffscreenCanvas(canvas.width, canvas.height);
let offctxGrid = offscreenGrid.getContext("2d");

offctxGrid.isSmoothEnable = true;

let offscreenBg = new OffscreenCanvas(canvas.width, canvas.height);
let offctxBg = offscreenBg.getContext("2d");

offctxBg.isSmoothEnable = true;


//-----------------------//

let camera = {
  position: { x: 0, y: 0, z: -1 },
  forward: { x: 0, y: 0, z: 1 },
  up: { x: 0, y: 1, z: 0 },
  right: { x: 1, y: 0, z: 0 },
  velocity: { x: 1, y: -0.1, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  speed: 5
};

//-----------------------//

let cameraView="";

//-----------------------//

let rotationSpeed = Math.PI/180*2;
let moveSpeed = camera.speed;

let radian = Math.PI / 180;
let fov=60;
let f= 1 / Math.tan((fov / 2)*(Math.PI / 180));
let a=height/width;
let zNear=1;
let zFar=1000;
let q=zFar/(zNear-zFar);

//-----------------------//

let leftPlane = {
normal: { x: -1, y: 0, z: 0 },
position: { x: 1, y: 0, z: 0 },
};

let rightPlane = {
normal: { x: 1, y: 0, z: 0},
position: { x: -1, y: 0, z: 0 },
};

let topPlane = {
normal: { x: 0, y: -1, z: 0 },
position: { x: 0, y: 1, z: 0 },
};

let bottomPlane = {
normal: { x: 0, y: 1, z: 0 },
position: { x: 0, y: -1, z: 0 },
};

let frontPlane = {
  normal: { x: 0, y: 0, z: -1 },
  position: { x: 0, y: 0, z: 1 },
};

let backPlane = {
  normal: { x: 0, y: 0, z: 1 },
  position: { x: 0, y: 0, z: -1 },
};

let viewFrustum = 
[
leftPlane, 
rightPlane,
topPlane,
bottomPlane,
frontPlane,
backPlane

];
//-----------------------//

let pMatrix = [
 [f / a, 0, 0, 0],
 [0, f, 0, 0],
 [0, 0, (zFar + zNear) / (zNear - zFar), (2 * zFar * zNear) / (zNear - zFar)],
 [0, 0, -1, 0]
];

//-----------------------//

let meshes = [];

//-----------------------//
let globalScale=25;
let gridSize = 15;
let cellSize = 4;
let tileScale =globalScale;

let offset = gridSize * cellSize * tileScale / 2; 

let howTall=10;
//-----------------------//

gridLimit = 1000000000;

let frequency = 0.001;
let beef = 0.001; //tall

let random = Math.random() * 1000;

//-----------------------//


let light = "";
light.scale = 10;
light.position = { x: 0, y: camera.position.y, z: 0};
light.name = "light";
light.baseColor = { r: 255, g: 250, b: 0 };
light.rotation = { x: 0, y: 0, z: 0 };



//-----------------------//

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let fpsTimer = performance.now();

//-----------------------//

let perm = [];
for (let i = 0; i < 256; i++) perm[i] = i;
perm.sort(() => Math.random() - 0.5);
perm = perm.concat(perm);

//-----------------------//


let isSortTriDist = false;
let isClipBehindCam = true;
let isClipByDist = false;
let isClipByAngle = false;
let isClipByTriSize = false;
let isClipByPlane = false;
let isSortMeshesDist = false;

 let shadingSteps = 50;

let cells=[];
//let triangleColors = []; 



offctx.lineWidth = 0.9;
offctx.font = "20px monospace";

let MAX_VERTICES = 1_000_000; // ajustable según escena
let MAX_INDICES = 1_000_000;

let vertexBuffer = new Float32Array(MAX_VERTICES * 3);
let indexBuffer = new Uint16Array(MAX_INDICES);

let colorBuffer = new Uint8Array(width * height * 3);

let vertexOffset = 0;
let indexOffset = 0;
let metaObj = [];
let metaGrid=[];
let totalVertices = 0;
let totalIndices = 0;

let cellMetadata = {}; // key: "col:row" → info
let meshKeys = []; // guarda keys en orden de generación

