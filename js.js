
let profiler = createProfiler(ctx);

function createMesh({ path, name = null, scale = 1, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 } }) {
 let raw = loadMiniMesh(path);
 normalizeMesh(raw);
 centerMeshOnGround(raw);
 let mesh = loadMeshToMainBuffers(raw);
 
 // Extraer nombre desde path si no se dio explícitamente
 if (!name) {
  let match = path.match(/\/([^\/]+)\.txt$/);
  name = match ? match[1] : "unnamed";
 }
 
 mesh.name = name;
 mesh.scale = scale;
 mesh.position = position;
 mesh.rotation = rotation;
 
 metaObj.push(mesh);
 
 return mesh;
}



let tree25 = createMesh({
 path: "obj/tree25.txt",
 scale: globalScale,
 position: { x: -50, y: 0, z: 0 },
 rotation: { x: 0, y: 1, z: 0 }
});

let sword25 = createMesh({
 path: "obj/sword25.txt",
 scale: globalScale,
 position: { x: 50, y: 0, z: 0 }
});

let pig = createMesh({
 path: "obj/pig1.txt",
 scale: globalScale,
 position: { x: 0, y: 0, z: 50}
});

let pig2 = createMesh({
 path: "obj/pig2.txt",
 scale: pig.scale,
 position: pig.position,
 rotation: pig.rotation
});




let gridVOffset = vertexOffset;
let gridIOffset = indexOffset;


let pigAnimation = ["pig1", "pig2"];
let animationSpeed = 350;

let currentFrameIndex = 0;
let activeMeta = pigAnimation[currentFrameIndex];


function animate(animationList) {
 if (!animate.running) {
  setInterval(() => {
   currentFrameIndex = (currentFrameIndex + 1) % animationList.length;
   activeMeta = animationList[currentFrameIndex];
  }, animationSpeed);
  animate.running = true;
 }
 
 // Devolver todos menos el activo
 return animationList.filter(name => name !== activeMeta);
}

//normalizeVertexBuffemetaObj.push(pig);r(vertexBuffer)
//centerXZ_AlignY(vertexBuffer)

sortMetasByDist(metaObj)


let rawVertexBuffer = new Float32Array(vertexBuffer); // copia inmutable
let rawIndexBuffer = new Uint16Array(indexBuffer); // copia inmutable
let rawColorBuffer = new Uint8Array(colorBuffer); // copia inmutable
//-----------------------//

camera.position.z=-520;
camera.position.x=0;

camera.position.y=10;

let lastCamCellX = null;
let lastCamCellZ = null;
//let rawGrid=[];
let tick=0;

drawHorizonStripe(offctxBg, "#a8d8ff", "#4caa4f");
//-----------------------//

let saveW = false;



//bakeShadows();

//MAIN//
function main() {

//~~~~~~~~~~~~~~~~~~~~~~~~~

 profiler.beginFrame();
 
 // FPS
 let now = performance.now();
 frameCount++;
 if (now - fpsTimer >= 500) {
fps = Math.round((frameCount * 1000) / (now - fpsTimer));
fpsTimer = now;
frameCount = 0;
 }

//~~~~~~~~~~~~~~~~~~~~~~~~~

let camPosX = (camera.position.x / (cellSize * tileScale)) | 0;
let camPosZ = (camera.position.z / (cellSize * tileScale)) | 0;

let cellChanged = camPosX !== lastCamCellX || camPosZ !== lastCamCellZ; 
 
//~~~~~~~~~~~~~~~~~~~~~~~~~
 
vertexBuffer.set(rawVertexBuffer);
colorBuffer.set(rawColorBuffer);
indexBuffer.set(rawIndexBuffer);

//~~~~~~~~~~~~~~~~~~~~~~~~~

if (camPosX !== lastCamCellX || camPosZ !== lastCamCellZ) {
 // === CAMBIO DE CELDA: REGENERAR GRID ===
 vertexOffset = gridVOffset;
 indexOffset = gridIOffset;
 
 metaGrid.length = 0;
 
 rawGrid = createGrid(camPosX, camPosZ);
 
 for (let cell of rawGrid) {
  let meta = loadMeshToMainBuffers(cell);
  meta.name = "cell";
  metaGrid.push(meta);
 }
 
 lastCamCellX = camPosX;
 lastCamCellZ = camPosZ;
 
 rawVertexBuffer.set(vertexBuffer);
 rawIndexBuffer.set(indexBuffer);
 rawColorBuffer.set(colorBuffer);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~

//demo


//tree25.rotation.x+=0.01
//metaDino.rotation.y+=0.01

//~~~~~~~~~~~~~~~~~~~~~~~~~


//demo
sword25.rotation.y += radian;
tree25.rotation.y += radian
pig.rotation.y += radian


//~~~~~~~~~~~~~~~~~~~~~~~~~

clearCanvases()

//~~~~~~~~~~~~~~~~~~~~~~~~~

sortMetasByDist(metaObj)

//~~~~~~~~~~~~~~~~~~~~~~~~~
//console.log(metaGrid[0])
  camera.forward.x = Math.sin(camera.rotation);
camera.forward.z = Math.cos(camera.rotation);


for (let meta of metaGrid)
{


 //a tris ej:100,103,106...
 let tempIndex = computeTempIndex(meta)
 
 //~~~~~~~~~~~~~~~~~~~~~~~~~
 
 wArray.length = 0;
 toWorldView(meta, tempIndex)
 
 //~~~~~~~~~~~~~~~~~~~~~~~~~
 

 //~~~~~~~~~~~~~~~~~~~~~~~~~
 
 tempIndex = clipBehindCamera(tempIndex)
 
 tempIndex = clipByDistance(tempIndex);
 tempIndex = clipMetaByAngle(tempIndex);
 tempIndex = clipMetaByTriSize(tempIndex);
 tempIndex = clipMetaByFrustum(tempIndex);
 
  //flatShading(tempIndex)
 //stepShading(tempIndex)
 
 
 tempIndex = sortMetaByDistance(tempIndex)
 
 
 toCameraView(meta, tempIndex)
 
 saveW = true
 meshByMatrix(meta, pMatrix, tempIndex)
 
 
 perspectiveDivide(meta, tempIndex)
 
 toScreenSpace(meta, tempIndex)
 
 saveW = false
 
 // moveCameraForward()
 
 
 let ctx;
 if (meta.name === "cell")
 {
  ctx = offctxGrid;
 }
 else {
  
  ctx = offctx;
 }
 drawMesh(tempIndex, ctx,meta)
 
 
}



for (let meta of metaObj) {

let skipNames =animate(pigAnimation);

if (skipNames.includes(meta.name)) continue;
 


//a tris ej:100,103,106...
let tempIndex=computeTempIndex(meta)

//~~~~~~~~~~~~~~~~~~~~~~~~~

wArray.length=0;
toWorldView(meta, tempIndex)

//~~~~~~~~~~~~~~~~~~~~~~~~~

//flatShading(tempIndex)
stepShading(tempIndex)

//~~~~~~~~~~~~~~~~~~~~~~~~~

tempIndex=clipBehindCamera(tempIndex)

tempIndex=clipByDistance(tempIndex);
tempIndex=clipMetaByAngle(tempIndex);
tempIndex=clipMetaByTriSize(tempIndex);
tempIndex=clipMetaByFrustum(tempIndex);

tempIndex=sortMetaByDistance(tempIndex)


toCameraView(meta,tempIndex)

saveW = true
meshByMatrix(meta, pMatrix,tempIndex)


perspectiveDivide(meta,tempIndex)

toScreenSpace(meta, tempIndex)

saveW = false

// moveCameraForward()
 

let ctx;
 if(meta.name==="cell")
 {
  ctx=offctxGrid;
 }
 else{
  
  ctx=offctx;
 }
 
 
 drawMesh(tempIndex,ctx,meta)

 
}




//~~~~~~~~~~~~~~~~~~~~~~~~~

updateCamera()
updateCameraVectors()


drawCanvas()


tick++;
 
 if(tick>=1000000)
 {
  tick=0;
 }
 profiler.draw();
profiler.reset();
 
 requestAnimationFrame(main);
}


window.onload=requestAnimationFrame(main);



