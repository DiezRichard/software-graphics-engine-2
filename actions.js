


function move(touchesArray)
{
let factor=.1;
let input=touchesArray;
if(input.length>0)
{
  
for(let i=0;i<input.length;i++)
{
if (input[i]== "ArrowLeft" || input[i] == "a" || input[i] == "4")
{
moveCameraLeft();

//break;
}

if (input[i] == "ArrowRight" || input[i] == "d" || input[i] == "6")
{

moveCameraRight();

// break;
}

if (input[i] == "ArrowUp" || input[i] == "w" || input[i] == "8")
{
 
moveCameraForward();

//break;
}

if (input[i] == "ArrowDown" || input[i] == "s" || input[i] == "2")
{
moveCameraBackward();

// break;
}

if(input[i]==",")
{
lookCameraLeft();
//break;
}

if (input[i] == ".")
{
  lookCameraRight();
//break;
}
 
if (input[i] == "i")
{
  lookCameraUP();

//break;
}
 
if (input[i] == "k")
{
  lookCameraDown();
//break;
}

}//loop


 }
 

//-----------------------------//
/*
//LOCAL EVENT
window.addEventListener('keydown', e => {

move3d(e.key, xAxis, yAxis, zAxis);

});
*/

//touchesArray = [];

} //END MOVE

//-----------------------------//

var moveWaveFrequency=0.015;
var moveWaveAmplitude=0.1;
function moveCameraForward() {

 let sinMove=Math.sin(Date.now() * moveWaveFrequency) * moveWaveAmplitude;
  
camera.position.x += camera.forward.x* moveSpeed;
camera.position.y += camera.forward.y* moveSpeed+sinMove;
camera.position.z += camera.forward.z * moveSpeed;
//light.rotation.x+=moveSpeed;
}

function moveCameraBackward() {
  
  
  let sinMove= Math.sin(Date.now() * moveWaveFrequency) * moveWaveAmplitude;
camera.position.x -= camera.forward.x * moveSpeed;
camera.position.y -= camera.forward.y * moveSpeed+sinMove;
camera.position.z -= camera.forward.z * moveSpeed;
//light.rotation.x-=moveSpeed;
}

function moveCameraLeft() {
  
  let sinMove=0;// Math.sin(Date.now() * moveWaveFrequency) * moveWaveAmplitude;
  
  
camera.position.x += camera.right.x * moveSpeed;
camera.position.y += camera.right.y * moveSpeed+sinMove;
camera.position.z += camera.right.z * moveSpeed;
//light.rotation.z-=moveSpeed;

}

function moveCameraRight() {
  let sinMove=0;// Math.sin(Date.now() * moveWaveFrequency) * moveWaveAmplitude;
  
camera.position.x -= camera.right.x * moveSpeed;
camera.position.y -= camera.right.y * moveSpeed+sinMove;
camera.position.z -= camera.right.z * moveSpeed;
//light.rotation.z+=moveSpeed;
}

function moveCameraUp() {
camera.position.x += camera.up.x * moveSpeed;
camera.position.y += camera.up.y * moveSpeed;
camera.position.z += camera.up.z * moveSpeed;

}

function moveCameraDown() {
camera.position.x -= camera.up.x * moveSpeed;
camera.position.y -= camera.up.y * moveSpeed;
camera.position.z -= camera.up.z * moveSpeed;

}

function lookCameraUP() {
camera.rotation.x += rotationSpeed;
}

function lookCameraDown() {
camera.rotation.x -= rotationSpeed;

}

function lookCameraLeft() {
camera.rotation.y -= rotationSpeed;
//light.rotation.z-=0.1;

}

function lookCameraRight() {
camera.rotation.y += rotationSpeed;
//light.rotation.z+=0.1;
}


//-------------------------------------//

/*
function fall(object)
{
  let plane = layers[0].objects[0].mesh;
  
  object.velocity.y-=0.05;
  
  let tolerance=35;
//console.log(plane); duck
let planeNormal=calculateTriangleNormal(plane[0]);

  
  // Calculate x and z limits based on the plane's vertices
  let xLimits = calculateXAxisLimits(plane);
  let zLimits = calculateZAxisLimits(plane);
  //console.log(xLimits); fuck
  //console.log(camera.position); fuck
  // Check if the object is outside x and z limits
  if(isAbovePlane(object.position, planeNormal, plane[0][0], tolerance ))
  {
  if ((object.position.x < xLimits.min ||
    object.position.x > xLimits.max ||
    object.position.z < zLimits.min ||
    object.position.z > zLimits.max
 )  )
  {
    // Apply falling velocity
    object.velocity.y -= 0.05;
  } 
  else 
  {
    // Reset falling velocity if within limits
    object.velocity.y = 0;
  }
  }
  
  

object.position.x += object.velocity.x;
  object.position.y += object.velocity.y;
  object.position.z += object.velocity.z;
  
  
}
*/
//-------------------------------------//

  function isAbovePlane(objectPosition, planeNormal, planePoint, tolerance) {
    // Calculate the distance between the object and the plane
    var distance = {
      x: objectPosition.x - planePoint.x,
      y: objectPosition.y - planePoint.y,
      z: objectPosition.z - planePoint.z
    };
  
    // Calculate the dot product between the distance vector and the plane's normal
    var dotProduct = distance.x * planeNormal.x + distance.y * planeNormal.y + distance.z * planeNormal.z;
  
    // Check if the object is above the plane
    return dotProduct > -tolerance;
  }
  
  //-------------------------------------//
  
function calculateXAxisLimits(plane) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  // Iterate over vertices to find min and max values along the specified axis
  for (let i = 0; i < plane.length; i++) {
  
  let tri=plane[i];
  for(let u=0; u<tri.length;u++)
  {
    let value = tri[u].x;

    // Update min and max values
    if (value < min) min = value;
    if (value > max) max = value;
    //console.log(plane[i][]); duck
  }
  }

min *= plane.scale;
max *= plane.scale;

min += plane.position.x;
max += plane.position.x;
//console.log(max);
  return { min, max };
}

//-------------------------------------//

function calculateZAxisLimits(plane) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  // Iterate over vertices to find min and max values along the specified axis
  for (let i = 0; i < plane.length; i++) {
  
  let tri=plane[i];
  for(let u=0; u<tri.length;u++)
  {
    let value = tri[u].z;

    // Update min and max values
    if (value < min) min = value;
    if (value > max) max = value;
    //console.log(plane[i][]); duck
  }
  }
  
  min *= plane.scale;
  max *= plane.scale;
  
  min += plane.position.z;
  max += plane.position.z;
  return { min, max };
}

//-------------------------------------//

function respawn()
{
  if(camera.position.y<-1000)
  {
    camera.position.y=0;
    camera.position.x=-50;
    camera.position.z=-170;
  }
}

//-------------------------------------//

let joystickLBase = document.getElementById('joystick-left-base');
let joystickLStick = document.getElementById('joystick-left-stick');

let joystickRBase = document.getElementById('joystick-right-base');
let joystickRStick = document.getElementById('joystick-right-stick');


let dragging = false;
let center = { x: 0, y: 0 };

let rotate = 0;
let moveForward = 0;


let leftTouchId = null;

joystickLBase.addEventListener('touchstart', e => {
  for (let touch of e.changedTouches) {
    if (leftTouchId === null) {
      leftTouchId = touch.identifier;
      let rect = joystickLBase.getBoundingClientRect();
      center.x = rect.left + rect.width / 2;
      center.y = rect.top + rect.height / 2;
      dragging = true;
    }
  }
}, { passive: true });

joystickLBase.addEventListener('touchmove', e => {
  if (!dragging) return;
  
  for (let touch of e.changedTouches) {
    if (touch.identifier === leftTouchId) {
      let dx = touch.clientX - center.x;
      let dy = touch.clientY - center.y;
      
      let maxDist = 40;
      let dist = Math.min(maxDist, Math.hypot(dx, dy));
      let angle = Math.atan2(dy, dx);
      
      let offsetX = Math.cos(angle) * dist;
      let offsetY = Math.sin(angle) * dist;
      
      joystickLStick.style.left = `${40 + offsetX}px`;
      joystickLStick.style.top = `${40 + offsetY}px`;
      
      rotate = offsetX / maxDist;
      moveForward = -offsetY / maxDist;
      break;
    }
  }
}, { passive: true });

joystickLBase.addEventListener('touchend', e => {
  for (let touch of e.changedTouches) {
    if (touch.identifier === leftTouchId) {
      joystickLStick.style.left = '40px';
      joystickLStick.style.top = '40px';
      dragging = false;
      rotate = 0;
      moveForward = 0;
      leftTouchId = null;
    }
  }
}, { passive: true });


let lastUpdateTime = 0;
let updateInterval = 10; // ms

function updateCamera() {
  
  
  
  let now = Date.now();
  if (now - lastUpdateTime < updateInterval) return;
  
  
  lastUpdateTime = now;
  
  let threshold = 0.6;
  
  if (moveForward > threshold) {
    moveCameraForward();
  } else if (moveForward < -threshold) {
    moveCameraBackward();
  }
  
  if (rotate > threshold) {
    //lookCameraRight();
    moveCameraRight();
  } else if (rotate < -threshold) {
    //lookCameraLeft();
    moveCameraLeft();
    
  }
  
if (strafe < -0.4) {
  lookCameraLeft()
  //moveCameraLeft();
} else if (strafe > 0.4) {
  lookCameraRight()
 //moveCameraRight();
}  
  
}

let gravity = -9.8;
let velocityY = 0;
let deltaTime = 0.020; // 60 FPS aprox

function pointInTriangle2D(px, pz, triangle) {
  let [v1, v2, v3] = triangle;
  
  function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
  }
  
  let d1 = sign({ x: px, z: pz }, v1, v2);
  let d2 = sign({ x: px, z: pz }, v2, v3);
  let d3 = sign({ x: px, z: pz }, v3, v1);
  
  let has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  let has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  
  return !(has_neg && has_pos);
}

function interpolateYInTriangle(px, pz, triangle) {
  let [v1, v2, v3] = triangle;
  
  let denom = (v2.z - v3.z) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.z - v3.z);
  let w1 = ((v2.z - v3.z) * (px - v3.x) + (v3.x - v2.x) * (pz - v3.z)) / denom;
  let w2 = ((v3.z - v1.z) * (px - v3.x) + (v1.x - v3.x) * (pz - v3.z)) / denom;
  let w3 = 1 - w1 - w2;
  
  return w1 * v1.y + w2 * v2.y + w3 * v3.y;
}


function applyGravity(camX, camZ, mesh) {
  for (let triangle of mesh) {
    if (!Array.isArray(triangle) || triangle.length !== 3) continue;
    
    if (pointInTriangle2D(camX, camZ, triangle)) {
      let groundY = interpolateYInTriangle(camX, camZ, triangle)+howTall;
      
      velocityY += gravity * deltaTime;
      camera.position.y += velocityY * deltaTime;
      
      
      
      if (camera.position.y < groundY) {
        camera.position.y = groundY;
        velocityY = 0;
      }
      
      camera.position.y = groundY;
velocityY = 0;
      break;
    }
  }
}



function applyGravityToObject(obj, cell) {
  let howTall = 0;
  
  // Si ya está en el suelo, no lo proceses más
  if (obj.falling === false) return;
  
  if (!obj.position || !cell || !Array.isArray(cell)) return;
  
  for (let triangle of cell) {
    if (!Array.isArray(triangle) || triangle.length !== 3) continue;
    
    const px = obj.position.x;
    const pz = obj.position.z;
    
    if (pointInTriangle2D(px, pz, triangle)) {
      const groundY = interpolateYInTriangle(px, pz, triangle) + howTall;
      
      // Si ya está en altura correcta (o muy cerca), marcar como estable
      if (Math.abs(obj.position.y - groundY) < 0.1) {
        obj.position.y = groundY;
        obj.falling = false; // Dejó de caer
     
      } else {
       // obj.position.y -= 1
        obj.position.y = groundY;
        ; // Caída directa (puede reemplazar por algo más suave)
        obj.falling = true;
      }
      
      break;
    }
  }
}



let draggingRight = false;
let centerR = { x: 0, y: 0 };
let strafe = 0; // valor entre -1 y 1

let rightTouchId = null;

joystickRBase.addEventListener('touchstart', e => {
  for (let touch of e.changedTouches) {
    if (rightTouchId === null) {
      rightTouchId = touch.identifier;
      let rect = joystickRBase.getBoundingClientRect();
      centerR.x = rect.left + rect.width / 2;
      centerR.y = rect.top + rect.height / 2;
      draggingRight = true;
    }
  }
}, { passive: true });

joystickRBase.addEventListener('touchmove', e => {
  if (!draggingRight) return;
  
  for (let touch of e.changedTouches) {
    if (touch.identifier === rightTouchId) {
      let dx = touch.clientX - centerR.x;
      let maxDist = 40;
      let dist = Math.max(-maxDist, Math.min(maxDist, dx));
      joystickRStick.style.left = `${40 + dist}px`;
      strafe = dist / maxDist;
      break;
    }
  }
}, { passive: true });

joystickRBase.addEventListener('touchend', e => {
  for (let touch of e.changedTouches) {
    if (touch.identifier === rightTouchId) {
      joystickRStick.style.left = '40px';
      draggingRight = false;
      strafe = 0;
      rightTouchId = null;
    }
  }
}, { passive: true });
