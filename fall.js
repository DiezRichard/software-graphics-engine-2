/*
//--------------------------//
//for the object
 function calculateLowestY(mesh)
{

let lowestY = Infinity;
for (let triangle of mesh) {
for (let vertex of triangle) {
if (vertex.y < lowestY) {
lowestY = vertex.y;
}
}
}
return lowestY;

}

//--------------------------//

//--------------------------//

function calculateTriangleMedianY(triangle) {
  let [vertex1, vertex2, vertex3] = triangle;
  let medianY = (vertex1.y + vertex2.y + vertex3.y) / 3;
  return medianY;
}
//--------------------------//


//--------------------------//


 function preventFall(mesh, inGrid) {
  // Get the position of the mesh in world space
  let meshPosX = mesh.position.x;
  let meshPosZ = mesh.position.z;
  
  let newGrid=[];
  
  for(let mesh of inGrid)
  {
  let cell= toWorldView(mesh);
  
  newGrid.push(cell);
  }

  // Find the triangle that contains the mesh's position
  let triangle = findTriangleInGrid(meshPosX, meshPosZ, newGrid);
//console.log(triangle);

  // Calculate the median Y value of the triangle
  let triY = calculateTriangleMedianY(triangle);

  // Calculate the lowest Y value of the mesh
  let lowestY = Math.floor(calculateLowestY(mesh));

  if (triY < mesh.position.y ) {
    
   // mesh.position.y = triY;
    mesh.position.y += fallSpeed;
  } else {
    mesh.position.y -= fallSpeed;
  }
}


 function findTriangleInCell(posX, posZ, cell) {
  
    for (let triangle of cell) {
      let [vertex1, vertex2, vertex3] = triangle;
      
      let minX = Math.min(vertex1.x, vertex2.x, vertex3.x);
      let maxX = Math.max(vertex1.x, vertex2.x, vertex3.x);
      let minZ = Math.min(vertex1.z, vertex2.z, vertex3.z);
      let maxZ = Math.max(vertex1.z, vertex2.z, vertex3.z);

      if (posX >= minX && posX <= maxX && posZ >= minZ && posZ <= maxZ) {
        return triangle;
      }
    }
  
  return 0; // Return null if no triangle is found
}


*/