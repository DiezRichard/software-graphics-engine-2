function clipMeshByPlane(mesh) {
 let planes = viewFrustum
 
 for (let i = 0; i < mesh.length; i++) {
let tri = mesh[i];
if (!tri.visible) continue;

let visible = true;
for (let plane of planes) {
 // Usar plano pre-normalizado
 let outsideCount = 0;
 
 for (let vertex of tri) {
// Distancia signada sin normalización
let dist = plane.nx * vertex.x +
 plane.ny * vertex.y +
 plane.nz * vertex.z + plane.d;

if (dist < 0) outsideCount++;
 }
 
 // Triángulo completamente fuera de un plano
 if (outsideCount === 3) {
visible = false;
break;
 }
}

tri.visible = visible;
 }
}

//-----------------------//

function clipBehindCamera(tempIndex) {
 let visibleIndices = [];
 
 for (let triBase of tempIndex) {
  // triBase es el offset directo en indexBuffer al primer índice del triángulo
  let i0 = indexBuffer[triBase + 0] * 3;
  let i1 = indexBuffer[triBase + 1] * 3;
  let i2 = indexBuffer[triBase + 2] * 3;
  
  let v0 = { x: vertexBuffer[i0], y: vertexBuffer[i0 + 1], z: vertexBuffer[i0 + 2] };
  let v1 = { x: vertexBuffer[i1], y: vertexBuffer[i1 + 1], z: vertexBuffer[i1 + 2] };
  let v2 = { x: vertexBuffer[i2], y: vertexBuffer[i2 + 1], z: vertexBuffer[i2 + 2] };
  
  let d0 = vectorSub(v0, camera.position);
  let d1 = vectorSub(v1, camera.position);
  let d2 = vectorSub(v2, camera.position);
  
  let p0 = dotP(d0, camera.forward);
  let p1 = dotP(d1, camera.forward);
  let p2 = dotP(d2, camera.forward);
  
  // Si al menos un vértice está delante de la cámara (p > 1)
  if (p0 > 1 && p1 > 1 && p2 > 1) {
   visibleIndices.push(triBase);
  }
 }
 
 return visibleIndices;
}
//-----------------------//
function vectorDistance(a, b) {
let dx = a.x - b.x;
let dy = a.y - b.y;
let dz = a.z - b.z;
return Math.sqrt(dx * dx + dy * dy + dz * dz);
}


function clipByDistance(tempIndex, near = 10, far = 1000) {
 let result = [];
 
 for (let triBase of tempIndex) {
  // triBase es offset directo en indexBuffer al primer índice del triángulo
  let i0 = indexBuffer[triBase + 0] * 3;
  let i1 = indexBuffer[triBase + 1] * 3;
  let i2 = indexBuffer[triBase + 2] * 3;
  
  let v0 = { x: vertexBuffer[i0], y: vertexBuffer[i0 + 1], z: vertexBuffer[i0 + 2] };
  let v1 = { x: vertexBuffer[i1], y: vertexBuffer[i1 + 1], z: vertexBuffer[i1 + 2] };
  let v2 = { x: vertexBuffer[i2], y: vertexBuffer[i2 + 1], z: vertexBuffer[i2 + 2] };
  
  // Calcular centroide
  let cx = (v0.x + v1.x + v2.x) / 3;
  let cy = (v0.y + v1.y + v2.y) / 3;
  let cz = (v0.z + v1.z + v2.z) / 3;
  
  let dist = vectorDistance({ x: cx, y: cy, z: cz }, camera.position);
  
  if (dist > near && dist < far) {
   result.push(triBase);
  }
 }
 
 return result;
}
//-----------------------//

function clipMetaByAngle(tempIndex) {
 let result = [];
 
 let cosThreshold = 0.0; // Aproximadamente cos(84°)
 
 for (let triIndex of tempIndex) {
  let i0 = indexBuffer[triIndex + 0] * 3;
  let i1 = indexBuffer[triIndex + 1] * 3;
  let i2 = indexBuffer[triIndex + 2] * 3;
  
  let v0 = { x: vertexBuffer[i0], y: vertexBuffer[i0 + 1], z: vertexBuffer[i0 + 2] };
  let v1 = { x: vertexBuffer[i1], y: vertexBuffer[i1 + 1], z: vertexBuffer[i1 + 2] };
  let v2 = { x: vertexBuffer[i2], y: vertexBuffer[i2 + 1], z: vertexBuffer[i2 + 2] };
  
  let u = vectorSub(v1, v0);
  let v = vectorSub(v2, v0);
  let normal = normV(cross(u, v));
  
  let cosAngle = dotP(normal, camera.forward);
  
  if (cosAngle <= -cosThreshold) {
   result.push(triIndex);
  }
 }
 
 return result;
}
//-----------------------//

function clipMetaByTriSize(tempIndex, minArea = 0.1, maxArea=5050) {
 let result = [];
 
 for (let triBase of tempIndex) {
  // triBase es el offset directo en indexBuffer al primer índice del triángulo
  let i0 = indexBuffer[triBase + 0] * 3;
  let i1 = indexBuffer[triBase + 1] * 3;
  let i2 = indexBuffer[triBase + 2] * 3;
  
  let v0 = { x: vertexBuffer[i0], y: vertexBuffer[i0 + 1], z: vertexBuffer[i0 + 2] };
  let v1 = { x: vertexBuffer[i1], y: vertexBuffer[i1 + 1], z: vertexBuffer[i1 + 2] };
  let v2 = { x: vertexBuffer[i2], y: vertexBuffer[i2 + 1], z: vertexBuffer[i2 + 2] };
  
  let u = vectorSub(v1, v0);
  let v = vectorSub(v2, v0);
  let crossProduct = cross(u, v);
  
  let area = 0.5 * Math.sqrt(
   crossProduct.x * crossProduct.x +
   crossProduct.y * crossProduct.y +
   crossProduct.z * crossProduct.z
  );
  
  if (area >= minArea && area <maxArea) {
   result.push(triBase);
  }
 }
 
 return result;
}

//-----------------------//

function clipMetaByFrustum(tempIndex) {
 let result = [];
 
 for (let triBase of tempIndex) {
  let visible = true;
  
  for (let p = 0; p < viewFrustum.length; p++) {
   let plane = viewFrustum[p];
   let outside = 0;
   
   for (let j = 0; j < 3; j++) {
    let idx = indexBuffer[triBase + j] * 3;
    let x = vertexBuffer[idx];
    let y = vertexBuffer[idx + 1];
    let z = vertexBuffer[idx + 2];
    
    let dist = plane.nx * x + plane.ny * y + plane.nz * z + plane.d;
    
    if (dist < 0) outside++;
   }
   
   if (outside >0) {
    visible = false;
    break;
   }
  }
  
  if (visible) {
   result.push(triBase);
  }
 }
 
 return result;
}
//-----------------------//
//single meta
function sortMetaByDistance(tempIndex) {
 let indexed = [];
 
 for (let i = 0; i < tempIndex.length; i++) {
  let baseIndex = tempIndex[i];
  
  let i0 = indexBuffer[baseIndex + 0] * 3;
  let i1 = indexBuffer[baseIndex + 1] * 3;
  let i2 = indexBuffer[baseIndex + 2] * 3;
  
  let v0 = { x: vertexBuffer[i0], y: vertexBuffer[i0 + 1], z: vertexBuffer[i0 + 2] };
  let v1 = { x: vertexBuffer[i1], y: vertexBuffer[i1 + 1], z: vertexBuffer[i1 + 2] };
  let v2 = { x: vertexBuffer[i2], y: vertexBuffer[i2 + 1], z: vertexBuffer[i2 + 2] };
  
  let cx = (v0.x + v1.x + v2.x) / 3;
  let cy = (v0.y + v1.y + v2.y) / 3;
  let cz = (v0.z + v1.z + v2.z) / 3;
  
  let dist = vectorDistance({ x: cx, y: cy, z: cz }, camera.position);
  
  indexed.push({ baseIndex, dist });
 }
 
 indexed.sort((a, b) => b.dist - a.dist);
 
 return indexed.map(e => e.baseIndex);
}

//-----------------------//
//allmetas
function sortMetasByDist(metas) {
 metas.sort((a, b) => {
  let dxA = a.position.x - camera.position.x;
  let dyA = a.position.y - camera.position.y;
  let dzA = a.position.z - camera.position.z;
  let distA = dxA * dxA + dyA * dyA + dzA * dzA;
  
  let dxB = b.position.x - camera.position.x;
  let dyB = b.position.y - camera.position.y;
  let dzB = b.position.z - camera.position.z;
  let distB = dxB * dxB + dyB * dyB + dzB * dzB;
  
  return distB - distA; // más lejos primero
 });
}

//-----------------------//

function multiplyMatrices(...matrices) {
return matrices.reduce((acc, m) => matrixMultiply(acc, m));
}

//-----------------------//

function toWorldView(meta,tempIndex) {

let xMatrix = createRotationMatrix({ x: 1, y: 0, z: 0 }, meta.rotation.x);
let yMatrix = createRotationMatrix({ x: 0, y: 1, z: 0 }, meta.rotation.y);
let zMatrix = createRotationMatrix({ x: 0, y: 0, z: 1 }, meta.rotation.z);

let tMatrix = [
[meta.scale, 0, 0, meta.position.x],
[0, meta.scale, 0, meta.position.y],
[0, 0, meta.scale, meta.position.z],
[0, 0, 0, 1],
];

let transformationMatrix = multiplyMatrices(tMatrix, xMatrix, yMatrix, zMatrix);

meshByMatrix(meta, transformationMatrix,tempIndex)

}

//-----------------------//



function toCameraView(meta, tempIndex) {
  let pitch = -camera.rotation.x;
  let yaw = -camera.rotation.y;

  let cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
  let cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);

  // Ejes de la cámara en espacio mundo
  let xAxis = { x: cosYaw, y: 0, z: -sinYaw };
  let yAxis = {
    x: sinYaw * sinPitch,
    y: cosPitch,
    z: cosYaw * sinPitch
  };
  let zAxis = {
    x: sinYaw * cosPitch,
    y: -sinPitch,
    z: cosPitch * cosYaw
  };

  camera.right = xAxis;
  camera.up = yAxis;
  camera.forward = zAxis;

  // Matriz de vista manual
  let px = camera.position.x;
  let py = camera.position.y;
  let pz = camera.position.z;

  let viewMatrix = [
    [xAxis.x, xAxis.y, xAxis.z, -dotP(xAxis, camera.position)],
    [yAxis.x, yAxis.y, yAxis.z, -dotP(yAxis, camera.position)],
    [zAxis.x, zAxis.y, zAxis.z, -dotP(zAxis, camera.position)],
    [0,       0,       0,       1]
  ];

  meshByMatrix(meta, viewMatrix, tempIndex);
}


//-----------------------//

function updateThirdPersonCamera(target) {
let distance = 80; 
let height = 40;

camera.position.x = target.x - distance * Math.sin(camera.rotation.y);
camera.position.z = target.z - distance * Math.cos(camera.rotation.y);
camera.position.y = target.y + height;


let dx = target.x - camera.position.x;
let dy = target.y - camera.position.y;
let dz = target.z - camera.position.z;

camera.rotation.y = Math.atan2(dx, dz); 
camera.rotation.x = Math.atan2(dy, Math.hypot(dx, dz)); 
}

//-----------------------//

function toScreenSpace(meta, tempIndex) {
meshByMatrix(meta, [
[canvas.width, 0, canvas.width / 3, 0],
[0, canvas.height, canvas.height / 3, 0],
[0, 0, 1, 1],
[0, 0, 0, 0]
], tempIndex);
}
//-----------------------//

let lightDir1 = normV({ x: -1, y: 1, z: 0 }); // luz desde la izquierda y un poco desde arriba
let lightDir2 = normV({ x: 0, y: 1, z: -1 }); // luz desde el fondo y un poco desde arriba
//-----------------------//

function flatShading(triIndexList) {
 const ambient = 0.6; // Luz mínima ambiental
 
 
 for (let i = 0; i < triIndexList.length; i++) {
  let triBase = triIndexList[i];
  
  let vi0 = indexBuffer[triBase + 0];
  let vi1 = indexBuffer[triBase + 1];
  let vi2 = indexBuffer[triBase + 2];
  
  let v0 = {
   x: vertexBuffer[vi0 * 3 + 0],
   y: vertexBuffer[vi0 * 3 + 1],
   z: vertexBuffer[vi0 * 3 + 2],
  };
  let v1 = {
   x: vertexBuffer[vi1 * 3 + 0],
   y: vertexBuffer[vi1 * 3 + 1],
   z: vertexBuffer[vi1 * 3 + 2],
  };
  let v2 = {
   x: vertexBuffer[vi2 * 3 + 0],
   y: vertexBuffer[vi2 * 3 + 1],
   z: vertexBuffer[vi2 * 3 + 2],
  };
  
  // Normal del triángulo
  let ux = v1.x - v0.x;
  let uy = v1.y - v0.y;
  let uz = v1.z - v0.z;
  
  let vx = v2.x - v0.x;
  let vy = v2.y - v0.y;
  let vz = v2.z - v0.z;
  
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
  
  let len = Math.hypot(nx, ny, nz);
  if (len === 0) continue;
  nx /= len;
  ny /= len;
  nz /= len;
  
  // Dot con cada fuente de luz
  let d1 = Math.max(0, nx * lightDir1.x + ny * lightDir1.y + nz * lightDir1.z);
  let d2 = Math.max(0, nx * lightDir2.x + ny * lightDir2.y + nz * lightDir2.z);
  
  // Peso de cada luz (puedes ajustar)
  let w1 = 0.8;
  let w2 = 0.7;
  
  let light = ambient + (1 - ambient) * (d1 * w1 + d2 * w2);
  light = Math.min(1, light); // Evitar sobreiluminación
  
  let cBase = triBase;
  let r = colorBuffer[cBase + 0];
  let g = colorBuffer[cBase + 1];
  let b = colorBuffer[cBase + 2];
  
  colorBuffer[cBase + 0] = (r * light)|0;
  colorBuffer[cBase + 1] = (g * light)|0;
  colorBuffer[cBase + 2] = (b * light)|0;
 }
}

//-----------------------//

function stepShading(triIndexList) {
  // Optimized: reduce allocations and per-triangle object creation
  const ambient = 0.5;
  const invAmbient = 1 - ambient;
  const weighted1 = invAmbient * 0.5;
  const weighted2 = invAmbient * 0.8;

  const vBuf = vertexBuffer;
  const iBuf = indexBuffer;
  const cBuf = colorBuffer;
  const sSteps = (shadingSteps | 0) || 1;

  const lx1 = lightDir1.x, ly1 = lightDir1.y, lz1 = lightDir1.z;
  const lx2 = lightDir2.x, ly2 = lightDir2.y, lz2 = lightDir2.z;

  for (let i = 0; i < triIndexList.length; i++) {
    const triBase = triIndexList[i];

    const vi0 = iBuf[triBase + 0];
    const vi1 = iBuf[triBase + 1];
    const vi2 = iBuf[triBase + 2];

    const x0 = vBuf[vi0 * 3],     y0 = vBuf[vi0 * 3 + 1], z0 = vBuf[vi0 * 3 + 2];
    const x1 = vBuf[vi1 * 3],     y1 = vBuf[vi1 * 3 + 1], z1 = vBuf[vi1 * 3 + 2];
    const x2 = vBuf[vi2 * 3],     y2 = vBuf[vi2 * 3 + 1], z2 = vBuf[vi2 * 3 + 2];

    const ux = x1 - x0, uy = y1 - y0, uz = z1 - z0;
    const vx = x2 - x0, vy = y2 - y0, vz = z2 - z0;

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;

    const lenSq = nx * nx + ny * ny + nz * nz;
    if (lenSq === 0) continue;
    const invLen = 1 / Math.sqrt(lenSq);
    nx *= invLen; ny *= invLen; nz *= invLen;

    const d1 = Math.max(0, nx * lx1 + ny * ly1 + nz * lz1);
    const d2 = Math.max(0, nx * lx2 + ny * ly2 + nz * lz2);

    let dot = ambient + d1 * weighted1 + d2 * weighted2;
    if (dot > 1) dot = 1;

    const level = (dot * sSteps) | 0;
    const stepped = level / sSteps;
    if (stepped === 0) continue;

    const base = triBase;
    cBuf[base]     = (cBuf[base]     * stepped) | 0;
    cBuf[base + 1] = (cBuf[base + 1] * stepped) | 0;
    cBuf[base + 2] = (cBuf[base + 2] * stepped) | 0;
  }
}
//-----------------------//

function bakeShadows() {
 for (let meta of metaObj)
 {
  // let saveW = false;
  //a tris ej:100,103,106...
  let tempIndex = computeTempIndex(meta)
  
  //~~~~~~~~~~~~~~~~~~~~~~~~~
  
  // wArray.length = 0;
  toWorldView(meta, tempIndex)
  
  //~~~~~~~~~~~~~~~~~~~~~~~~~
  
  // flatShading(tempIndex)
  stepShading(tempIndex)
  
  vertexBuffer.set(rawVertexBuffer);
  //colorBuffer.set(rawColorBuffer);
  indexBuffer.set(rawIndexBuffer);
  rawColorBuffer.set(colorBuffer);
 }
}

//-----------------------//

function drawMesh(tempIndex,ctx,meta) {

// Optimized drawMesh: fewer allocations, cached buffer access, squared-distance test for stroke
const triangleCount = tempIndex.length;
const vBuf = vertexBuffer;
const iBuf = indexBuffer;
const cBuf = colorBuffer;
const cam = camera;

const dx = meta.position.x - cam.position.x;
const dy = meta.position.y - cam.position.y;
const dz = meta.position.z - cam.position.z;
const distSq = dx*dx + dy*dy + dz*dz;
const maxStrokeDistSq = (maxStrokeDist || 900) * (maxStrokeDist || 900);
const doStroke = (distSq < maxStrokeDistSq) || (meta.name === "cell");

let lastR = -1, lastG = -1, lastB = -1;
for (let t = 0; t < triangleCount; t++) {
 const triIndex = tempIndex[t];
 
 const vi0 = iBuf[triIndex];
 const vi1 = iBuf[triIndex + 1];
 const vi2 = iBuf[triIndex + 2];
 
 const p0x = vBuf[vi0 * 3], p0y = vBuf[vi0 * 3 + 1];
 const p1x = vBuf[vi1 * 3], p1y = vBuf[vi1 * 3 + 1];
 const p2x = vBuf[vi2 * 3], p2y = vBuf[vi2 * 3 + 1];
 
 const r = cBuf[triIndex];
 const g = cBuf[triIndex + 1];
 const b = cBuf[triIndex + 2];
 
 // Set styles only when color changed
 if (r !== lastR || g !== lastG || b !== lastB) {
   const rgb = `rgb(${r},${g},${b})`;
   ctx.fillStyle = rgb;
   ctx.strokeStyle = rgb;
   lastR = r; lastG = g; lastB = b;
 }
 
 ctx.beginPath();
 ctx.moveTo(p0x, p0y);
 ctx.lineTo(p1x, p1y);
 ctx.lineTo(p2x, p2y);
 ctx.closePath();
 
 ctx.fill();
 if (doStroke && meta.name !== "cell") ctx.stroke();
}

}

const maxStrokeDist = 900;

/*
function drawMesh(tempIndex, ctx, meta) {
  const triangleCount = tempIndex.length;
  

  const dx = meta.position.x - camera.position.x;
  const dy = meta.position.y - camera.position.y;
  const dz = meta.position.z - camera.position.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const doStroke = dist < maxStrokeDist || meta.name === "cell";

  for (let i = 0; i < triangleCount; i++) {
    const triIndex = tempIndex[i];

    const i0 = indexBuffer[triIndex];
    const i1 = indexBuffer[triIndex + 1];
    const i2 = indexBuffer[triIndex + 2];

    const p0x = vertexBuffer[i0 * 3], p0y = vertexBuffer[i0 * 3 + 1];
    const p1x = vertexBuffer[i1 * 3], p1y = vertexBuffer[i1 * 3 + 1];
    const p2x = vertexBuffer[i2 * 3], p2y = vertexBuffer[i2 * 3 + 1];

    const r = colorBuffer[triIndex];
    const g = colorBuffer[triIndex + 1];
    const b = colorBuffer[triIndex + 2];
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.strokeStyle = `rgb(${r},${g},${b})`;

    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.closePath();

if(meta.name!=="cell")
{
    ctx.fill();
    if (doStroke) ctx.stroke();
}
else{
 ctx.fill();
}
  
  }
}
*/
//-----------------------//

function drawCanvas() {

ctx.drawImage(offscreenBg, 0, 0);
ctx.drawImage(offscreenGrid, 0, 0);
ctx.drawImage(offscreen, 0, 0);

}


function clearCanvases() {
 
 ctx.clearRect(0, 0, canvas.width, canvas.height);

 offctx.clearRect(0, 0, offctx.canvas.width, offctx.canvas.height);
 
 offctxGrid.clearRect(0, 0, offctxGrid.canvas.width, offctxGrid.canvas.height);
 
 //offctxBg.clearRect(0, 0, offctxBg.canvas.width, offctxBg.canvas.height);
 
}

