// local perlin
function getY(u, i, col, row, camPosX, camPosZ) {
 let worldX = (u + (col + camPosX) * cellSize) / tileScale;
 let worldZ = (i + (row + camPosZ) * cellSize) / tileScale;
 
 let scale = frequency || 0.1;
 let noiseVal = perlin(worldX * scale + random, worldZ * scale + random);
 
 let y = noiseVal * beef;
 return y;
}


function createGrid(camPosX, camPosZ) {
 const grid = [];
 const baseColor = { r: 100, g: 200, b: 100 };
 const totalSize = gridSize * cellSize;
// const offset = (totalSize * tileScale) / 2;
 
 for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
   const mesh = [];
   
   for (let subRow = 0; subRow < cellSize; subRow++) {
    for (let subCol = 0; subCol < cellSize; subCol++) {
     const worldCol = col + camPosX;
     const worldRow = row + camPosZ;
     
     
     const x0 = (worldCol * cellSize + subCol) * tileScale - offset;
     const z0 = (worldRow * cellSize + subRow) * tileScale - offset;
     const x1 = x0 + tileScale;
     const z1 = z0 + tileScale;
     const y = 0;
     
     const v0 = { x: x0, y, z: z0, ...baseColor };
     const v1 = { x: x1, y, z: z0, ...baseColor };
     const v2 = { x: x1, y, z: z1, ...baseColor };
     const v3 = { x: x0, y, z: z1, ...baseColor };
     
     mesh.push([v2, v1, v0]);
     mesh.push([v3, v2, v0]);
    }
   }
   
   grid.push(mesh); // cada mesh representa una celda
  }
 }
 
 return grid;
}

//lod
function createGrid(camPosX, camPosZ) {
 const grid = [];
 const baseColor = { r: 100, g: 200, b: 100 };
 const totalSize = gridSize * cellSize;
// const offset = (totalSize * tileScale) / 2;
 const centerX = camPosX + gridSize / 2;
 const centerZ = camPosZ + gridSize / 2;
 
 for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
   const mesh = [];
   
   const worldCol = col + camPosX;
   const worldRow = row + camPosZ;
   
   // Distancia euclidiana al centro (puedes usar manhattan si prefieres)
   const dx = worldCol - centerX;
   const dz = worldRow - centerZ;
   const dist = Math.sqrt(dx * dx + dz * dz);
   
let lod = 1;

if (dist > 8) lod = 6;
else if (dist > 6) lod = 4;
else if (dist > 4) lod = 2; 
   const step = lod; // paso de subcuadrícula
   
   for (let subRow = 0; subRow < cellSize; subRow += step) {
    for (let subCol = 0; subCol < cellSize; subCol += step) {
     const x0 = (worldCol * cellSize + subCol) * tileScale - offset;
     const z0 = (worldRow * cellSize + subRow) * tileScale - offset;
     const x1 = x0 + tileScale * step;
     const z1 = z0 + tileScale * step;
     const y = 0;
     
     const v0 = { x: x0, y, z: z0, ...baseColor };
     const v1 = { x: x1, y, z: z0, ...baseColor };
     const v2 = { x: x1, y, z: z1, ...baseColor };
     const v3 = { x: x0, y, z: z1, ...baseColor };
     
     mesh.push([v2, v1, v0]);
     mesh.push([v3, v2, v0]);
    }
   }
   
   grid.push(mesh);
  }
 }
 
 return grid;
}

