let objID = 0; // global o fuera de la función

function loadObject2(file) {
 let request = new XMLHttpRequest();
 let mesh = [];
 request.open("GET", file, false);
 
 request.onreadystatechange = function() {
  if (request.readyState === 4 && (request.status === 200 || request.status === 0)) {
   let lines = request.responseText.split(/\r?\n/);
   let vertices = [];
   
   for (let line of lines) {
    if (line.startsWith("v ")) {
     let parts = line.trim().split(/\s+/);
     // Puede tener solo posición (x,y,z) o posición + color (x,y,z,r,g,b)
     let x = parseFloat(parts[1]);
     let y = parseFloat(parts[2]);
     let z = parseFloat(parts[3]);
     
     // Comprobar si hay colores (r,g,b) normalizados en el rango [0,1]
     if (parts.length >= 7) {
      let r = Math.round(parseFloat(parts[4]) );
      let g = Math.round(parseFloat(parts[5]) );
      let b = Math.round(parseFloat(parts[6]));
      vertices.push({ x, y, z, r, g, b });
     } else {
      // Sin color, solo posición
      vertices.push({ x, y, z });
     }
    }
   }
   
   for (let line of lines) {
    if (line.startsWith("f ")) {
     let parts = line.trim().split(/\s+/).slice(1);
     if (parts.length !== 3) continue;
     
     let tri = [];
     
     for (let part of parts) {
      let indices = part.split('/');
      let vi = parseInt(indices[0], 10);
      if (!isNaN(vi) && vi > 0 && vi <= vertices.length) {
       tri.push(vertices[vi - 1]);
      }
     }
     
     if (tri.length === 3) {
      tri.visible = true;
      mesh.push(tri);
     }
    }
   }
  }
 };
 
 request.send(null);
 return mesh;
}

function loadMiniMesh(file) {
 let request = new XMLHttpRequest();
 let mesh = [];
 
 request.open("GET", file, false);
 
 request.onreadystatechange = function() {
  if (request.readyState === 4 && (request.status === 200 || request.status === 0)) {
   let lines = request.responseText.split(/\r?\n/);
   
   for (let line of lines) {
    if (!line.trim().startsWith("t")) continue;
    
    let parts = line.trim().split(/\s+/);
    if (parts.length !== 13) continue;
    
    let [
     _t,
     x0, y0, z0,
     x1, y1, z1,
     x2, y2, z2,
     r, g, b
    ] = parts;
    
    let tri = [
     { x: parseFloat(x0), y: parseFloat(y0), z: parseFloat(z0), r: parseInt(r), g: parseInt(g), b: parseInt(b) },
     { x: parseFloat(x1), y: parseFloat(y1), z: parseFloat(z1), r: parseInt(r), g: parseInt(g), b: parseInt(b) },
     { x: parseFloat(x2), y: parseFloat(y2), z: parseFloat(z2), r: parseInt(r), g: parseInt(g), b: parseInt(b) }
    ];
    
    tri.visible = true;
    mesh.push(tri);
   }
  }
 };
 
 request.send(null);
 return mesh;
}

//-----------------------//
function pushVertex(x, y, z) {
 let index = vertexOffset / 3;
 vertexBuffer[vertexOffset++] = x;
 vertexBuffer[vertexOffset++] = y;
 vertexBuffer[vertexOffset++] = z;
 return index;
}

//-----------------------//

function loadMeshToMainBuffers(mesh, keyName = `import:${objID++}`) {
 let baseVertex = vertexOffset / 3;
 let baseIndex = indexOffset;
 
 for (let tri of mesh) {
  if (!Array.isArray(tri) || tri.length !== 3) continue;
  
  let v0 = pushVertex(tri[0].x, tri[0].y, tri[0].z);
  let v1 = pushVertex(tri[1].x, tri[1].y, tri[1].z);
  let v2 = pushVertex(tri[2].x, tri[2].y, tri[2].z);
  
  indexBuffer[indexOffset++] = v0;
  indexBuffer[indexOffset++] = v1;
  indexBuffer[indexOffset++] = v2;
 }
 
 // Asignar color por triángulo en colorBuffer
 for (let triIndex = 0; triIndex < mesh.length; triIndex++) {
  let tri = mesh[triIndex];
  
  // Color del primer vértice del triángulo, o color por defecto (gris)
  let r = (typeof tri[0].r === 'number') ? tri[0].r : 200;
  let g = (typeof tri[0].g === 'number') ? tri[0].g : 200;
  let b = (typeof tri[0].b === 'number') ? tri[0].b : 200;
  
  // Índice base en colorBuffer = (baseIndex / 3) + triIndex * 3
  let colorBufferIndex = (baseIndex / 3 + triIndex) * 3;
  
  colorBuffer[colorBufferIndex + 0] = r;
  colorBuffer[colorBufferIndex + 1] = g;
  colorBuffer[colorBufferIndex + 2] = b;
 }
 
 // Guardar baseColor (puede ser color del primer triángulo para referencia)
 let baseColor = { r: 200, g: 200, b: 200 };
 if (mesh.length > 0 && typeof mesh[0][0].r === 'number') {
  baseColor = {
   r: mesh[0][0].r,
   g: mesh[0][0].g,
   b: mesh[0][0].b,
  };
 }
 
 cellMetadata[keyName] = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  baseColor,
  baseVertex,
  vertexCount: (vertexOffset / 3) - baseVertex,
  baseIndex,
  indexCount: indexOffset - baseIndex,
  name: keyName,
  subdivisions: 1,
 };
 
 meshKeys.push(keyName);
 return cellMetadata[keyName];
}

function loadMeshToMainBuffers(mesh, keyName = `import:${objID++}`) {
 let baseVertex = vertexOffset / 3;
 let baseIndex = indexOffset;
 
 // Variables para calcular centro (promedio de x y z)
 let sumX = 0;
 let sumZ = 0;
 let count = 0;
 
 for (let tri of mesh) {
  if (!Array.isArray(tri) || tri.length !== 3) continue;
  
  let v0 = pushVertex(tri[0].x, tri[0].y, tri[0].z);
  let v1 = pushVertex(tri[1].x, tri[1].y, tri[1].z);
  let v2 = pushVertex(tri[2].x, tri[2].y, tri[2].z);
  
  indexBuffer[indexOffset++] = v0;
  indexBuffer[indexOffset++] = v1;
  indexBuffer[indexOffset++] = v2;
  
  sumX += tri[0].x + tri[1].x + tri[2].x;
  sumZ += tri[0].z + tri[1].z + tri[2].z;
  count += 3;
 }
 
 // Asignar color por triángulo en colorBuffer
 for (let triIndex = 0; triIndex < mesh.length; triIndex++) {
  let tri = mesh[triIndex];
  
  let r = (typeof tri[0].r === 'number') ? tri[0].r : 200;
  let g = (typeof tri[0].g === 'number') ? tri[0].g : 200;
  let b = (typeof tri[0].b === 'number') ? tri[0].b : 200;
  
  let colorBufferIndex = (baseIndex / 3 + triIndex) * 3;
  
  colorBuffer[colorBufferIndex + 0] = r;
  colorBuffer[colorBufferIndex + 1] = g;
  colorBuffer[colorBufferIndex + 2] = b;
 }
 
 let baseColor = { r: 200, g: 200, b: 200 };
 if (mesh.length > 0 && typeof mesh[0][0].r === 'number') {
  baseColor = {
   r: mesh[0][0].r,
   g: mesh[0][0].g,
   b: mesh[0][0].b,
  };
 }
 
 // Calcular centro x/z si hay vértices
 let cx = count > 0 ? sumX / count : 0;
 let cz = count > 0 ? sumZ / count : 0;
 
 cellMetadata[keyName] = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  baseColor,
  baseVertex,
  vertexCount: (vertexOffset / 3) - baseVertex,
  baseIndex,
  indexCount: indexOffset - baseIndex,
  name: keyName,
  subdivisions: 1,
  
  // Coordenadas centrales para filtro de cámara
  cx,
  cz,
 };
 
 meshKeys.push(keyName);
 return cellMetadata[keyName];
}
//-----------------------//

//UTILITIES

function matrixTimesVector(v, matrix) {
let x1 = v.x * matrix[0][0] + v.y * matrix[1][0] + v.z * matrix[2][0];
let y1 = v.x * matrix[0][1] + v.y * matrix[1][1] + v.z * matrix[2][1];
let z1 = v.x * matrix[0][2] + v.y * matrix[1][2] + v.z * matrix[2][2];

let vec = { x: x1, y: y1, z: z1 };

return vec;
}

//-----------------------//

function cross(v1, v2) {
return {
x: v1.y * v2.z - v1.z * v2.y,
y: v1.z * v2.x - v1.x * v2.z,
z: v1.x * v2.y - v1.y * v2.x
};
}
//-----------------------//

function vectorSub(v1,v2)
{
return {x:(v1.x-v2.x),y:(v1.y-v2.y),z:(v1.z-v2.z)};
}

//-----------------------//


function normV(v)
{
let len=(Math.sqrt((v.x*v.x+v.y*v.y+v.z*v.z)));

let newV={x:v.x/len,y:v.y/len,z:v.z/len};

return newV;
}


//-----------------------//

function dotP(v1,v2){
return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;

}

//-----------------------//

let wArray = []; // Array para almacenar los valores de w


function meshByMatrix(meta, matrix, tempIndex) {
 const baseIndex = meta.baseIndex;
 const baseVertex = meta.baseVertex;
 
 if (saveW) wArray.length = meta.vertexCount;
 
 if (tempIndex) {
  for (let i = 0; i < tempIndex.length; i++) {
   const triIndex = tempIndex[i];
   const triBase = baseIndex + triIndex * 3;
   
   for (let j = 0; j < 3; j++) {
    const globalIndex = indexBuffer[triBase + j];
    const localIndex = globalIndex - baseVertex;
    
    if (saveW && wArray[localIndex] === 1) continue;
    if (saveW) wArray[localIndex] = 1;
    
    const vx = vertexBuffer[globalIndex * 3];
    const vy = vertexBuffer[globalIndex * 3 + 1];
    const vz = vertexBuffer[globalIndex * 3 + 2];
    
    const wx =
     vx * matrix[0][0] + vy * matrix[0][1] + vz * matrix[0][2] + matrix[0][3];
    const wy =
     vx * matrix[1][0] + vy * matrix[1][1] + vz * matrix[1][2] + matrix[1][3];
    const wz =
     vx * matrix[2][0] + vy * matrix[2][1] + vz * matrix[2][2] + matrix[2][3];
    const ww =
     vx * matrix[3][0] + vy * matrix[3][1] + vz * matrix[3][2] + matrix[3][3];
    
    vertexBuffer[globalIndex * 3] = wx;
    vertexBuffer[globalIndex * 3 + 1] = wy;
    vertexBuffer[globalIndex * 3 + 2] = wz;
    
    if (saveW) wArray[localIndex] = ww;
   }
  }
 } else {
  // Transforma todo el rango completo
  for (let localIndex = 0; localIndex < meta.vertexCount; localIndex++) {
   const globalIndex = baseVertex + localIndex;
   
   const vx = vertexBuffer[globalIndex * 3];
   const vy = vertexBuffer[globalIndex * 3 + 1];
   const vz = vertexBuffer[globalIndex * 3 + 2];
   
   const wx =
    vx * matrix[0][0] + vy * matrix[0][1] + vz * matrix[0][2] + matrix[0][3];
   const wy =
    vx * matrix[1][0] + vy * matrix[1][1] + vz * matrix[1][2] + matrix[1][3];
   const wz =
    vx * matrix[2][0] + vy * matrix[2][1] + vz * matrix[2][2] + matrix[2][3];
   const ww =
    vx * matrix[3][0] + vy * matrix[3][1] + vz * matrix[3][2] + matrix[3][3];
   
   vertexBuffer[globalIndex * 3] = wx;
   vertexBuffer[globalIndex * 3 + 1] = wy;
   vertexBuffer[globalIndex * 3 + 2] = wz;
   
   if (saveW) wArray[localIndex] = ww;
  }
 }
}


//using as 100,103,106...
function meshByMatrix(meta, matrix, tempIndex) {
 const baseVertex = meta.baseVertex;
 
 if (saveW) wArray.length = meta.vertexCount;
 
 if (tempIndex) {
  for (let i = 0; i < tempIndex.length; i++) {
   const triBase = tempIndex[i]; // ya es un offset en indexBuffer (ej: 100, 103...)
   
   for (let j = 0; j < 3; j++) {
    const globalIndex = indexBuffer[triBase + j];
    const localIndex = globalIndex - baseVertex;
    
    if (saveW && wArray[localIndex] === 1) continue;
    if (saveW) wArray[localIndex] = 1;
    
    const vx = vertexBuffer[globalIndex * 3];
    const vy = vertexBuffer[globalIndex * 3 + 1];
    const vz = vertexBuffer[globalIndex * 3 + 2];
    
    const wx =
     vx * matrix[0][0] + vy * matrix[0][1] + vz * matrix[0][2] + matrix[0][3];
    const wy =
     vx * matrix[1][0] + vy * matrix[1][1] + vz * matrix[1][2] + matrix[1][3];
    const wz =
     vx * matrix[2][0] + vy * matrix[2][1] + vz * matrix[2][2] + matrix[2][3];
    const ww =
     vx * matrix[3][0] + vy * matrix[3][1] + vz * matrix[3][2] + matrix[3][3];
    
    vertexBuffer[globalIndex * 3] = wx;
    vertexBuffer[globalIndex * 3 + 1] = wy;
    vertexBuffer[globalIndex * 3 + 2] = wz;
    
    if (saveW) wArray[localIndex] = ww;
   }
  }
 } else {
  // Transforma todo el rango completo
  for (let localIndex = 0; localIndex < meta.vertexCount; localIndex++) {
   const globalIndex = baseVertex + localIndex;
   
   const vx = vertexBuffer[globalIndex * 3];
   const vy = vertexBuffer[globalIndex * 3 + 1];
   const vz = vertexBuffer[globalIndex * 3 + 2];
   
   const wx =
    vx * matrix[0][0] + vy * matrix[0][1] + vz * matrix[0][2] + matrix[0][3];
   const wy =
    vx * matrix[1][0] + vy * matrix[1][1] + vz * matrix[1][2] + matrix[1][3];
   const wz =
    vx * matrix[2][0] + vy * matrix[2][1] + vz * matrix[2][2] + matrix[2][3];
   const ww =
    vx * matrix[3][0] + vy * matrix[3][1] + vz * matrix[3][2] + matrix[3][3];
   
   vertexBuffer[globalIndex * 3] = wx;
   vertexBuffer[globalIndex * 3 + 1] = wy;
   vertexBuffer[globalIndex * 3 + 2] = wz;
   
   if (saveW) wArray[localIndex] = ww;
  }
 }
}

function meshByMatrix(meta, matrix, tempIndex) {
 if (saveW) wArray.length = meta.vertexCount;
 
 if (tempIndex) {
  for (let i = 0; i < tempIndex.length; i++) {
   const triBase = tempIndex[i]; // offset absoluto en indexBuffer
   
   for (let j = 0; j < 3; j++) {
    const globalIndex = indexBuffer[triBase + j]; // índice absoluto
    
    // localIndex para wArray sigue siendo globalIndex - baseVertex
    const localIndex = globalIndex - meta.baseVertex;
    
    if (saveW && wArray[localIndex] === 1) continue;
    if (saveW) wArray[localIndex] = 1;
    
    const vx = vertexBuffer[globalIndex * 3];
    const vy = vertexBuffer[globalIndex * 3 + 1];
    const vz = vertexBuffer[globalIndex * 3 + 2];
    
    const wx =
     vx * matrix[0][0] + vy * matrix[0][1] + vz * matrix[0][2] + matrix[0][3];
    const wy =
     vx * matrix[1][0] + vy * matrix[1][1] + vz * matrix[1][2] + matrix[1][3];
    const wz =
     vx * matrix[2][0] + vy * matrix[2][1] + vz * matrix[2][2] + matrix[2][3];
    const ww =
     vx * matrix[3][0] + vy * matrix[3][1] + vz * matrix[3][2] + matrix[3][3];
    
    vertexBuffer[globalIndex * 3] = wx;
    vertexBuffer[globalIndex * 3 + 1] = wy;
    vertexBuffer[globalIndex * 3 + 2] = wz;
    
    if (saveW) wArray[localIndex] = ww;
   }
  }
 } else {
  // Sin tempIndex: transforma todo el meta
  for (let localIndex = 0; localIndex < meta.vertexCount; localIndex++) {
   const globalIndex = meta.baseVertex + localIndex;
   
   const vx = vertexBuffer[globalIndex * 3];
   const vy = vertexBuffer[globalIndex * 3 + 1];
   const vz = vertexBuffer[globalIndex * 3 + 2];
   
   const wx =
    vx * matrix[0][0] + vy * matrix[0][1] + vz * matrix[0][2] + matrix[0][3];
   const wy =
    vx * matrix[1][0] + vy * matrix[1][1] + vz * matrix[1][2] + matrix[1][3];
   const wz =
    vx * matrix[2][0] + vy * matrix[2][1] + vz * matrix[2][2] + matrix[2][3];
   const ww =
    vx * matrix[3][0] + vy * matrix[3][1] + vz * matrix[3][2] + matrix[3][3];
   
   vertexBuffer[globalIndex * 3] = wx;
   vertexBuffer[globalIndex * 3 + 1] = wy;
   vertexBuffer[globalIndex * 3 + 2] = wz;
   
   if (saveW) wArray[localIndex] = ww;
  }
 }
}
//-----------------------//


//-----------------------//

function normalizeVector(vector) {
let length = vectorLength(vector);
return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

//-----------------------//

function vectorLength(vector) {
return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

//-----------------------//

function calculateTriangleNormal(triangle) {

 let tempVec1 = vectorFromVertices(triangle[0], triangle[1]);
 let tempVec2 = vectorFromVertices(triangle[0], triangle[2]);

let normal = {
x: tempVec1.y * tempVec2.z - tempVec1.z * tempVec2.y,
y: tempVec1.z * tempVec2.x - tempVec1.x * tempVec2.z,
z: tempVec1.x * tempVec2.y - tempVec1.y * tempVec2.x
};

return normal;
}

//-----------------------//

function vectorFromVertices(v1, v2) {
return { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
}

//-----------------------//

function matrixMultiply(matrix1, matrix2){
let result = [];
for (let i = 0; i < matrix1.length; i++) {
result[i] = [];
for (let j = 0; j < matrix2[0].length; j++) {
let sum = 0;
for (let k = 0; k < matrix1[0].length; k++) {
sum += matrix1[i][k] * matrix2[k][j];
}
result[i][j] = sum;
}
}
return result;
}

//-----------------------//
/*
function sortMeshesByDistance(meshes){
return meshes.sort((mesh1, mesh2) => {
 let meshdist1 = vectorDistance(camera.position, mesh1.position);
 let meshdist2 = vectorDistance(camera.position, mesh2.position);

return meshdist2- meshdist1;
});

}
*/
function sortMeshesByDistance(meshes) {

return meshes.sort((a, b) => {
let distA = vectorDistance(camera.position, a.position);
let distB = vectorDistance(camera.position, b.position);
return distB - distA; // descendente: más lejos primero
});
}
//-----------------------//

function mapRange(value, inMin, inMax, outMin, outMax) {
return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

//-----------------------//
let sum = { x: 0, y: 0, z: 0 };
function calculateCentroid(triangle) {


for (let i = 0; i < triangle.length; i++) 
{
sum.x += triangle[i].x;
sum.y += triangle[i].y;
sum.z += triangle[i].z;
}

let numVertices = triangle.length;

let centroid=
{ 
x: sum.x / numVertices, 
y: sum.y / numVertices, 
z: sum.z / numVertices 
}

return centroid;
}

//-----------------------//

/*
function sortTriByDist(mesh){

for (let i = 0; i < mesh.length; i++) 
{
let centroid = calculateCentroid(mesh[i]);

mesh[i].distance = vectorDistance(centroid, camera.position);
}

mesh.sort(function(a, b) 
{
return b.distance - a.distance;
});

}
*/

function sortTriByDist(meta, triIndexList) {
 const baseIndex = meta.baseIndex;
 
 triIndexList.sort((a, b) => {
  const baseA = baseIndex + a * 3;
  const baseB = baseIndex + b * 3;
  
  const v0a = indexBuffer[baseA + 0];
  const v1a = indexBuffer[baseA + 1];
  const v2a = indexBuffer[baseA + 2];
  
  const cxA = (vertexBuffer[v0a * 3] + vertexBuffer[v1a * 3] + vertexBuffer[v2a * 3]) / 3;
  const cyA = (vertexBuffer[v0a * 3 + 1] + vertexBuffer[v1a * 3 + 1] + vertexBuffer[v2a * 3 + 1]) / 3;
  const czA = (vertexBuffer[v0a * 3 + 2] + vertexBuffer[v1a * 3 + 2] + vertexBuffer[v2a * 3 + 2]) / 3;
  
  const distA = vectorDistance({ x: cxA, y: cyA, z: czA }, camera.position);
  
  const v0b = indexBuffer[baseB + 0];
  const v1b = indexBuffer[baseB + 1];
  const v2b = indexBuffer[baseB + 2];
  
  const cxB = (vertexBuffer[v0b * 3] + vertexBuffer[v1b * 3] + vertexBuffer[v2b * 3]) / 3;
  const cyB = (vertexBuffer[v0b * 3 + 1] + vertexBuffer[v1b * 3 + 1] + vertexBuffer[v2b * 3 + 1]) / 3;
  const czB = (vertexBuffer[v0b * 3 + 2] + vertexBuffer[v1b * 3 + 2] + vertexBuffer[v2b * 3 + 2]) / 3;
  
  const distB = vectorDistance({ x: cxB, y: cyB, z: czB }, camera.position);
  
  return distB - distA; // Orden descendente (más lejos primero)
 });
}

function sortTrianglesByDepth(meta, tempIndex) {
 return tempIndex
  .map(i => {
   const base = meta.baseIndex + i * 3;
   const i0 = indexBuffer[base + 0] * 3;
   const i1 = indexBuffer[base + 1] * 3;
   const i2 = indexBuffer[base + 2] * 3;
   
   const z0 = vertexBuffer[i0 + 2];
   const z1 = vertexBuffer[i1 + 2];
   const z2 = vertexBuffer[i2 + 2];
   
   const avgZ = (z0 + z1 + z2) / 3;
   
   return { i, z: avgZ };
  })
  .sort((a, b) => b.z - a.z) // de lejos a cerca
  .map(obj => obj.i);
}
//-----------------------//
let ab=0;
let tNumerator=0;
 let tDenominator=0;
 let tndtd =0;
function segmentInterPlane(planePoint, planeNormal, a, b) {
 ab = vectorSub(b, a);
 tNumerator = dotP(vectorSub(planePoint, a), planeNormal);
 tDenominator = dotP(ab, planeNormal);

 tndtd = tNumerator / tDenominator;

return {
x: a.x + ab.x * t,
y: a.y + ab.y * t,
z: a.z + ab.z * t
};
}

//-----------------------//

function createRotationMatrix(axis, angle) {
let cos = Math.cos(angle);
let sin = Math.sin(angle);
let t = 1 - cos;

let matrix = [
[t * axis.x * axis.x + cos, t * axis.x * axis.y - sin * axis.z, t * axis.x * axis.z + sin * axis.y, 0],
[t * axis.x * axis.y + sin * axis.z, t * axis.y * axis.y + cos, t * axis.y * axis.z - sin * axis.x, 0],
[t * axis.x * axis.z - sin * axis.y, t * axis.y * axis.z + sin * axis.x, t * axis.z * axis.z + cos, 0],
[0, 0, 0, 1]
];

return matrix;
}

//-----------------------//
/*
function perspectiveDivide(mesh) {
for (let i = 0; i < mesh.length; i++) {
for (let j = 0; j < 3; j++) {
if (mesh[i][j].w !== 0) {
mesh[i][j].x /= mesh[i][j].w;
mesh[i][j].y /= mesh[i][j].w;
mesh[i][j].z /= mesh[i][j].w;
}
}
}
}
*/

/*
function perspectiveDivide(meta) {
let baseVertex = meta.baseVertex;
let vertexCount = meta.vertexCount;

for (let i = 0; i < vertexCount; i++) {
let index = baseVertex + i;

// Obtener las coordenadas transformadas
let x = vertexBuffer[index * 3];
let y = vertexBuffer[index * 3 + 1];
let z = vertexBuffer[index * 3 + 2];
let w = wArray[i]; // Obtener w del array

// Realizar la división
if (w !== 0) {
vertexBuffer[index * 3] = x / w; // x
vertexBuffer[index * 3 + 1] = y / w; // y
vertexBuffer[index * 3 + 2] = z / w; // z
}
}
}
*/
function perspectiveDivide(meta, tempIndex = null) {
 const baseVertex = meta.baseVertex;
 
 if (tempIndex) {
  for (let i = 0; i < tempIndex.length; i++) {
   const triIndex = tempIndex[i];
   const triBase = meta.baseIndex + triIndex * 3;
   
   for (let j = 0; j < 3; j++) {
    const globalIndex = indexBuffer[triBase + j];
    const localIndex = globalIndex - baseVertex;
    
    const x = vertexBuffer[globalIndex * 3];
    const y = vertexBuffer[globalIndex * 3 + 1];
    const z = vertexBuffer[globalIndex * 3 + 2];
    const w = wArray[localIndex];
    
    if (w !== 0) {
     vertexBuffer[globalIndex * 3] = x / w;
     vertexBuffer[globalIndex * 3 + 1] = y / w;
     vertexBuffer[globalIndex * 3 + 2] = z / w;
    }
   }
  }
 } else {
  for (let localIndex = 0; localIndex < meta.vertexCount; localIndex++) {
   const globalIndex = baseVertex + localIndex;
   
   const x = vertexBuffer[globalIndex * 3];
   const y = vertexBuffer[globalIndex * 3 + 1];
   const z = vertexBuffer[globalIndex * 3 + 2];
   const w = wArray[localIndex];
   
   if (w !== 0) {
    vertexBuffer[globalIndex * 3] = x / w;
    vertexBuffer[globalIndex * 3 + 1] = y / w;
    vertexBuffer[globalIndex * 3 + 2] = z / w;
   }
  }
 }
}
function perspectiveDivide(meta, tempIndex = null) {
 const baseVertex = meta.baseVertex;
 
 if (tempIndex) {
  for (let i = 0; i < tempIndex.length; i++) {
   const triBase = tempIndex[i]; // offset absoluto en indexBuffer
   
   for (let j = 0; j < 3; j++) {
    const globalIndex = indexBuffer[triBase + j];
    const localIndex = globalIndex - baseVertex;
    
    const x = vertexBuffer[globalIndex * 3];
    const y = vertexBuffer[globalIndex * 3 + 1];
    const z = vertexBuffer[globalIndex * 3 + 2];
    const w = wArray[localIndex];
    
    if (w !== 0) {
     vertexBuffer[globalIndex * 3] = x / w;
     vertexBuffer[globalIndex * 3 + 1] = y / w;
     vertexBuffer[globalIndex * 3 + 2] = z / w;
    }
   }
  }
 } else {
  for (let localIndex = 0; localIndex < meta.vertexCount; localIndex++) {
   const globalIndex = baseVertex + localIndex;
   
   const x = vertexBuffer[globalIndex * 3];
   const y = vertexBuffer[globalIndex * 3 + 1];
   const z = vertexBuffer[globalIndex * 3 + 2];
   const w = wArray[localIndex];
   
   if (w !== 0) {
    vertexBuffer[globalIndex * 3] = x / w;
    vertexBuffer[globalIndex * 3 + 1] = y / w;
    vertexBuffer[globalIndex * 3 + 2] = z / w;
   }
  }
 }
}
//-----------------------//

function vectorDistance(vector1, vector2) {
return Math.sqrt(
(vector2.x - vector1.x) ** 2 +
(vector2.y - vector1.y) ** 2 +
(vector2.z - vector1.z) ** 2
);
}
//-----------------------//

function sortMeshesByY(meshes) {
return meshes.sort((mesh1, mesh2) => {
// Ascending order (from lower to higher y-axis value)
return mesh1.position.y - mesh2.position.y;
});
}

//-----------------------//

function updateCameraVectors() {
 // Crear matrices de rotación (en orden Z * Y * X aplicado en ese orden → multiplicar en orden inverso)
 let rx = createRotationMatrix({ x: 1, y: 0, z: 0 }, -camera.rotation.x);
 let ry = createRotationMatrix({ x: 0, y: 1, z: 0 }, -camera.rotation.y);
 let rz = createRotationMatrix({ x: 0, y: 0, z: 1 }, -camera.rotation.z);
 
 // Orden correcto: Rz * Ry * Rx
 let rzy = matrixMultiply(rz, ry);
 let rotationMatrix = matrixMultiply(rzy, rx);
 
 // Recalcular ejes con el vector FORWARD mirando hacia -Z
 camera.forward = matrixTimesVector({ x: 0, y: 0, z: -1, w: 1 }, rotationMatrix);
 camera.up = matrixTimesVector({ x: 0, y: 1, z: 0, w: 1 }, rotationMatrix);
 camera.right = matrixTimesVector({ x: 1, y: 0, z: 0, w: 1 }, rotationMatrix);
 
 // Normalizar ejes
 camera.forward = normV(camera.forward);
 camera.up = normV(camera.up);
 camera.right = normV(camera.right);
}
//-----------------------//

function createProfiler(ctx) {
let data = {};
let fps = 0;
let lastFrameTime = performance.now();
 let frameCount = 0;
let fpsTimer = performance.now();

return {
start(label) {
data[label] = data[label] || {};
data[label].start = performance.now();
},

end(label) {
if (data[label] && data[label].start !== undefined) {
let duration = performance.now() - data[label].start;
data[label].duration = duration.toFixed(1) + " ms";
delete data[label].start; // limpiamos solo el start, para evitar errores
}
},

beginFrame() {
let now = performance.now();
frameCount++;
if (now - fpsTimer >= 500) {
fps = Math.round((frameCount * 1000) / (now - fpsTimer));
fpsTimer = now;
frameCount = 0;
}
},

draw(x = 5, y = 20, lineHeight = 18) {
ctx.fillStyle = "white";
ctx.font = "18px monospace";
ctx.fillText("FPS: " + fps, x, y);
y += lineHeight;

for (let label in data) {
if (data[label].duration) {
ctx.fillText(`${label}: ${data[label].duration}`, x, y);
y += lineHeight;
}
}
},

reset() {
// opcional: si no quieres que se borre nada, puedes comentar esto
// for (let key in data) delete data[key];
}
};
}

//-----------------------//

function adjustShadingSteps(change) {
let newVal = shadingSteps + change;

if (newVal >= 2 && newVal <= 30 && newVal % 2 === 0) {
shadingSteps = newVal;
document.getElementById("shadingStepsDisplay").innerText = shadingSteps;
}
}

function cloneMeta(meta) {
 return {
  position: {
   x: meta.position.x,
   y: meta.position.y,
   z: meta.position.z
  },
  rotation: {
   x: meta.rotation.x,
   y: meta.rotation.y,
   z: meta.rotation.z
  },
  scale: meta.scale,
  name:meta.name,
  baseColor: {
   r: meta.baseColor.r,
   g: meta.baseColor.g,
   b: meta.baseColor.b
  },
  baseVertex: meta.baseVertex,
  baseIndex: meta.baseIndex,
  vertexCount: meta.vertexCount,
  indexCount: meta.indexCount,
  subdivisions: meta.subdivisions
 };
}

//a vertices
function computeTempIndex(meta) {
 const tempIndex = [];
 
 for (let i = 0; i < meta.indexCount; i += 3) {
  const i0 = indexBuffer[meta.baseIndex + i + 0];
  const i1 = indexBuffer[meta.baseIndex + i + 1];
  const i2 = indexBuffer[meta.baseIndex + i + 2];
  
  tempIndex.push(i0, i1, i2); // ya son índices globales hacia vertexBuffer
 }
 
 return tempIndex;
}

//a tris
function computeTempIndex(meta) {
 const tempIndex = [];
 for (let i = 0; i < meta.indexCount; i += 3) {
  tempIndex.push(meta.baseIndex + i); // esto es el offset real del triángulo en indexBuffer
 }
 return tempIndex;
}

function normalizeVertexBuffer(buffer) {
  if (buffer.length < 3) return;

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  // Encontrar extremos
  for (let i = 0; i < buffer.length; i += 3) {
    let x = buffer[i];
    let y = buffer[i + 1];
    let z = buffer[i + 2];

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;

    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  // Rango y escala
  let rangeX = maxX - minX;
  let rangeY = maxY - minY;
  let rangeZ = maxZ - minZ;

  let maxRange = Math.max(rangeX, rangeY, rangeZ);
  if (maxRange === 0) return; // evitar división por cero

  let scale = 1 / maxRange;

  // Normalizar y centrar
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i]     = (buffer[i] - minX) * scale; // x
    buffer[i + 1] = (buffer[i + 1] - minY) * scale; // y
    buffer[i + 2] = (buffer[i + 2] - minZ) * scale; // z
  }
}

function centerXZ_AlignY(buffer) {
  let minY = Infinity, sumX = 0, sumZ = 0;
  let count = buffer.length / 3;

  for (let i = 0; i < buffer.length; i += 3) {
    sumX += buffer[i];
    if (buffer[i + 1] < minY) minY = buffer[i + 1];
    sumZ += buffer[i + 2];
  }

  let centerX = sumX / count;
  let centerZ = sumZ / count;

  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i]     -= centerX; // X
    buffer[i + 1] -= minY;    // Y (pegar al suelo)
    buffer[i + 2] -= centerZ; // Z
  }
}


function normalizeMesh(mesh) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let tri of mesh) {
    for (let v of tri) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
      if (v.z < minZ) minZ = v.z;
      if (v.z > maxZ) maxZ = v.z;
    }
  }

  let sizeX = maxX - minX;
  let sizeY = maxY - minY;
  let sizeZ = maxZ - minZ;
  let maxSize = Math.max(sizeX, sizeY, sizeZ);

  if (maxSize === 0) return; // Evitar división por cero

  for (let tri of mesh) {
    for (let v of tri) {
      v.x = (v.x - minX) / maxSize;
      v.y = (v.y - minY) / maxSize;
      v.z = (v.z - minZ) / maxSize;
    }
  }
}


function centerMeshOnGround(mesh) {
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let minY = Infinity;

  for (let tri of mesh) {
    for (let v of tri) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.z < minZ) minZ = v.z;
      if (v.z > maxZ) maxZ = v.z;
      if (v.y < minY) minY = v.y;
    }
  }

  let offsetX = (minX + maxX) / 2;
  let offsetZ = (minZ + maxZ) / 2;

  for (let tri of mesh) {
    for (let v of tri) {
      v.x -= offsetX;
      v.z -= offsetZ;
      v.y -= minY; // base toca suelo
    }
  }
}