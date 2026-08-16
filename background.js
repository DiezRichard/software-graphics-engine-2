function drawHorizonStripe(ctx, colorTop, colorBottom) {
  let gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0.34, colorTop); // cielo arriba
  gradient.addColorStop(0.37, colorBottom); // pasto abajo
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}