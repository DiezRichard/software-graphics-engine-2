function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

//-----------------------//

function lerp(a, b, t) {
  return a + t * (b - a);
}

//-----------------------//

function grad(hash, x, y) {
  let h = hash & 3;
  let u = h < 2 ? x : y;
  let v = h < 2 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
}

//-----------------------//

// Perlin 2D básico
function perlin(x, y) {
  let X = Math.floor(x) & 255;
  let Y = Math.floor(y) & 255;

  x = x - Math.floor(x);
  y = y - Math.floor(y);

  let u = fade(x);
  let v = fade(y);

  let aa = perm[X + perm[Y]];
  let ab = perm[X + perm[Y + 1]];
  let ba = perm[X + 1 + perm[Y]];
  let bb = perm[X + 1 + perm[Y + 1]];

  let g1 = grad(aa, x, y);
  let g2 = grad(ba, x - 1, y);
  let g3 = grad(ab, x, y - 1);
  let g4 = grad(bb, x - 1, y - 1);

  let lerp1 = lerp(g1, g2, u);
  let lerp2 = lerp(g3, g4, u);

  return lerp(lerp1, lerp2, v);
}

//-----------------------//
