import { BONUSES } from './engine.js';

function drawPineTree(ctx) {
  // Soft snow shadow
  ctx.fillStyle = 'rgba(114, 152, 178, 0.28)';
  ctx.beginPath();
  ctx.ellipse(2, 14, 22, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Warm wooden trunk
  ctx.fillStyle = '#8b634b';
  ctx.beginPath();
  ctx.roundRect(-4.5, 2, 9, 14, 3);
  ctx.fill();

  // 3-tier rounded evergreen boughs
  const tiers = [
    { y: 6, w: 23, h: 19, c1: '#4d9284', c2: '#377368' },
    { y: -7, w: 19, h: 18, c1: '#5aa192', c2: '#3f8074' },
    { y: -19, w: 14, h: 17, c1: '#6ab1a2', c2: '#4a8e81' },
  ];
  for (const t of tiers) {
    const grad = ctx.createLinearGradient(-t.w, t.y - t.h, t.w, t.y);
    grad.addColorStop(0, t.c1);
    grad.addColorStop(1, t.c2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, t.y - t.h);
    ctx.quadraticCurveTo(t.w * 0.72, t.y - t.h * 0.25, t.w, t.y);
    ctx.quadraticCurveTo(0, t.y + 4.5, -t.w, t.y);
    ctx.quadraticCurveTo(-t.w * 0.72, t.y - t.h * 0.25, 0, t.y - t.h);
    ctx.closePath();
    ctx.fill();
  }

  // Soft snow cap on top & bough tips
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.quadraticCurveTo(7, -27, 10, -23);
  ctx.quadraticCurveTo(4, -20, 0, -24);
  ctx.quadraticCurveTo(-4, -20, -10, -23);
  ctx.quadraticCurveTo(-7, -27, 0, -36);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.beginPath();
  ctx.ellipse(-10, -10, 5.5, 2.5, -0.25, 0, Math.PI * 2);
  ctx.ellipse(10, -10, 5.5, 2.5, 0.25, 0, Math.PI * 2);
  ctx.ellipse(-13, 3, 6.5, 2.6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(13, 3, 6.5, 2.6, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawRock(ctx) {
  ctx.fillStyle = 'rgba(114, 152, 178, 0.26)';
  ctx.beginPath();
  ctx.ellipse(2, 11, 20, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createLinearGradient(-16, -10, 16, 12);
  grad.addColorStop(0, '#a8bccb');
  grad.addColorStop(0.6, '#879eb0');
  grad.addColorStop(1, '#6c8497');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.quadraticCurveTo(-17, -9, -2, -10);
  ctx.quadraticCurveTo(15, -10, 18, 5);
  ctx.quadraticCurveTo(17, 12, 0, 12);
  ctx.quadraticCurveTo(-17, 12, -18, 6);
  ctx.closePath();
  ctx.fill();

  // Snow drift cap
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-2, -5.5, 11.5, 4.5, -0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoodieGlow(ctx, color, bob) {
  ctx.fillStyle = 'rgba(114, 152, 178, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const halo = ctx.createRadialGradient(0, bob, 3, 0, bob, 24);
  halo.addColorStop(0, color);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, bob, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawCocoa(ctx, bob, elapsed, reduced) {
  drawGoodieGlow(ctx, 'rgba(255, 211, 138, 0.58)', bob);
  ctx.save();
  ctx.translate(0, bob);

  // Steam wisps
  const drift = reduced ? 0 : Math.sin(elapsed * 4) * 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -14);
  ctx.quadraticCurveTo(-7 + drift, -20, -3, -25);
  ctx.moveTo(4, -14);
  ctx.quadraticCurveTo(7 - drift, -20, 3, -25);
  ctx.stroke();

  // Mug handle
  ctx.strokeStyle = '#d46b53';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(10, 0, 6, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();

  // Mug body
  const mug = ctx.createLinearGradient(-11, -10, 11, 10);
  mug.addColorStop(0, '#ee846a');
  mug.addColorStop(1, '#c95c44');
  ctx.fillStyle = mug;
  ctx.beginPath();
  ctx.roundRect(-11, -10, 21, 21, 6);
  ctx.fill();

  // Cocoa & cream top
  ctx.fillStyle = '#6b422d';
  ctx.beginPath();
  ctx.ellipse(-0.5, -9, 9, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff9ee';
  ctx.beginPath();
  ctx.arc(-3.5, -10, 3.2, 0, Math.PI * 2);
  ctx.arc(2.5, -10, 3.2, 0, Math.PI * 2);
  ctx.arc(-0.5, -12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Highlight stripe
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.roundRect(-8, -5, 3, 12, 2);
  ctx.fill();
  ctx.restore();
}

function drawMittens(ctx, bob) {
  drawGoodieGlow(ctx, 'rgba(247, 168, 196, 0.58)', bob);
  ctx.save();
  ctx.translate(0, bob);
  for (const hand of [-1, 1]) {
    ctx.save();
    ctx.translate(hand * 9.5, 0);
    ctx.rotate(hand * 0.16);
    const grad = ctx.createLinearGradient(-7, -14, 7, 12);
    grad.addColorStop(0, '#ef8cac');
    grad.addColorStop(1, '#cc5f86');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-7, -13, 14, 24, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hand * 7, -1, 4.5, 7, hand * -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy knit cuff
    ctx.fillStyle = '#fff7f9';
    ctx.beginPath();
    ctx.roundRect(-8, 7, 16, 7, 3.5);
    ctx.fill();
    ctx.strokeStyle = '#d98ba6';
    ctx.lineWidth = 1.4;
    for (let rib = -4; rib <= 4; rib += 4) {
      ctx.beginPath();
      ctx.moveTo(rib, 8.5);
      ctx.lineTo(rib, 12.5);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawHat(ctx, bob) {
  drawGoodieGlow(ctx, 'rgba(147, 206, 245, 0.62)', bob);
  ctx.save();
  ctx.translate(0, bob);

  // Knit dome
  const dome = ctx.createLinearGradient(-13, -12, 13, 6);
  dome.addColorStop(0, '#6ba6db');
  dome.addColorStop(1, '#467eb3');
  ctx.fillStyle = dome;
  ctx.beginPath();
  ctx.arc(0, 3, 13, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Warm gold stripe
  ctx.strokeStyle = '#ffd97d';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-11.5, -2.5);
  ctx.quadraticCurveTo(0, -5, 11.5, -2.5);
  ctx.stroke();

  // Cozy white cuff
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.roundRect(-15, 1, 30, 8, 4);
  ctx.fill();
  ctx.strokeStyle = '#c4d8e6';
  ctx.lineWidth = 1.3;
  for (let rib = -10; rib <= 10; rib += 5) {
    ctx.beginPath();
    ctx.moveTo(rib, 2.5);
    ctx.lineTo(rib, 7.5);
    ctx.stroke();
  }

  // Fluffy pom-pom
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -13, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSkier(ctx, s, reduced) {
  const wiggle = s.protection > 0 && !reduced ? Math.sin(s.protection * 16) * 0.55 : 0;
  const carve = s.phase === 'running' ? Math.max(-0.2, Math.min(0.2, (s.vx || 0) * 0.38)) : 0;
  ctx.rotate(wiggle + carve);

  // Soft snow shadow under skis
  ctx.fillStyle = 'rgba(104, 144, 173, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 21, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Forward-pointing skis with curved front tips pointing UP the trail
  for (const side of [-1, 1]) {
    const sx = side * 9.5;
    ctx.strokeStyle = '#366b8f';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, 20);
    ctx.lineTo(sx, -24);
    ctx.quadraticCurveTo(sx, -31, sx + side * 2, -33);
    ctx.stroke();

    ctx.strokeStyle = '#8cc7e8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx, 17);
    ctx.lineTo(sx, -23);
    ctx.stroke();
  }

  // Ski poles angled back behind the skier
  ctx.strokeStyle = '#9c826b';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-15, -4);
  ctx.lineTo(-24, 19);
  ctx.moveTo(15, -4);
  ctx.lineTo(24, 19);
  ctx.stroke();
  ctx.fillStyle = '#537e9c';
  ctx.beginPath();
  ctx.arc(-22.5, 15, 3, 0, Math.PI * 2);
  ctx.arc(22.5, 15, 3, 0, Math.PI * 2);
  ctx.fill();

  // Rear 3/4 view of bundled-up penguin skier heading forward up the trail
  // Flippers held out for balance
  ctx.fillStyle = '#273f52';
  ctx.beginPath();
  ctx.ellipse(-15, -3, 5.5, 10.5, 0.48, 0, Math.PI * 2);
  ctx.ellipse(15, -3, 5.5, 10.5, -0.48, 0, Math.PI * 2);
  ctx.fill();

  // Cute penguin back + little tail tuft
  const back = ctx.createRadialGradient(-3, -9, 3, 0, -2, 20);
  back.addColorStop(0, '#466782');
  back.addColorStop(1, '#243a4d');
  ctx.fillStyle = back;
  ctx.beginPath();
  ctx.ellipse(0, -3, 15, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Little penguin tail & orange boots tucked on skis
  ctx.fillStyle = '#243a4d';
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.lineTo(4, 10);
  ctx.lineTo(0, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f29e38';
  ctx.beginPath();
  ctx.ellipse(-9.5, 10, 4.5, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(9.5, 10, 4.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cozy coral-red scarf wrapped around neck with two tails fluttering BEHIND (downward)
  const flutter = reduced ? 0 : Math.sin(s.elapsed * 10) * 3.5;
  ctx.fillStyle = '#e86f5c';
  ctx.beginPath();
  ctx.roundRect(-13.5, -18, 27, 7.5, 3.8);
  ctx.fill();
  // Two trailing scarf tails streaming behind
  ctx.beginPath();
  ctx.moveTo(2, -12);
  ctx.quadraticCurveTo(9 + flutter, -3, 7 + flutter * 1.2, 7);
  ctx.lineTo(13 + flutter * 1.2, 5);
  ctx.quadraticCurveTo(15 + flutter, -4, 9, -13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f58b78';
  ctx.beginPath();
  ctx.moveTo(-2, -12);
  ctx.quadraticCurveTo(-7 - flutter * 0.6, -4, -5 - flutter * 0.8, 4);
  ctx.lineTo(0 - flutter * 0.8, 3);
  ctx.quadraticCurveTo(-1 - flutter * 0.5, -4, 3, -12);
  ctx.closePath();
  ctx.fill();

  // Back of penguin head
  ctx.fillStyle = '#2b4357';
  ctx.beginPath();
  ctx.arc(0, -25, 12.2, 0, Math.PI * 2);
  ctx.fill();

  // Striped knit winter beanie (seen from behind) + big fluffy pom-pom
  const hatGrad = ctx.createLinearGradient(-12, -38, 12, -24);
  hatGrad.addColorStop(0, '#6ba6db');
  hatGrad.addColorStop(1, '#4478ab');
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.arc(0, -26, 12.6, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffd97d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-11.5, -30.5);
  ctx.quadraticCurveTo(0, -33.5, 11.5, -30.5);
  ctx.stroke();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.roundRect(-13.5, -28.5, 27, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -39.5, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFriend(ctx, kind) {
  // Soft shadow
  ctx.fillStyle = 'rgba(110, 148, 174, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (kind === 0) {
    // Cozy Snowman
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 4, 10.5, 0, Math.PI * 2);
    ctx.arc(0, -9, 7.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d3e5f0';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Red scarf
    ctx.fillStyle = '#e86f5c';
    ctx.beginPath();
    ctx.roundRect(-8, -3, 16, 4, 2);
    ctx.fill();
    // Carrot nose + eyes
    ctx.fillStyle = '#243a4d';
    ctx.beginPath();
    ctx.arc(-2.6, -10.5, 1.3, 0, Math.PI * 2);
    ctx.arc(2.6, -10.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f28c38';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6.5, -7.5);
    ctx.lineTo(0, -6.5);
    ctx.closePath();
    ctx.fill();
    // Cute top hat
    ctx.fillStyle = '#3f5f75';
    ctx.beginPath();
    ctx.roundRect(-9, -17, 18, 3, 1.5);
    ctx.roundRect(-6, -24, 12, 8, 2);
    ctx.fill();
  } else if (kind === 1) {
    // Baby Penguin friend
    ctx.fillStyle = '#2e475c';
    ctx.beginPath();
    ctx.ellipse(0, 2, 10, 11, 0, 0, Math.PI * 2);
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.ellipse(0, 3, 6.8, 8, 0, 0, Math.PI * 2);
    ctx.arc(-2.5, -9.5, 3.6, 0, Math.PI * 2);
    ctx.arc(2.5, -9.5, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#203140';
    ctx.beginPath();
    ctx.arc(-2.7, -10, 1.3, 0, Math.PI * 2);
    ctx.arc(2.7, -10, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5a83d';
    ctx.beginPath();
    ctx.moveTo(-2.5, -8);
    ctx.lineTo(2.5, -8);
    ctx.lineTo(0, -5.5);
    ctx.closePath();
    ctx.fill();
    // Cozy pink earmuffs
    ctx.fillStyle = '#ec88a8';
    ctx.beginPath();
    ctx.arc(-8.5, -10, 3, 0, Math.PI * 2);
    ctx.arc(8.5, -10, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 2) {
    // Cozy Woodland Fox
    ctx.fillStyle = '#e58149';
    ctx.beginPath();
    ctx.ellipse(9, 7, 7, 4, -0.4, 0, Math.PI * 2);
    ctx.ellipse(0, 3, 9.5, 10, 0, 0, Math.PI * 2);
    ctx.arc(0, -9, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff9ee';
    ctx.beginPath();
    ctx.arc(13, 5, 3, 0, Math.PI * 2);
    ctx.ellipse(0, 5, 5.5, 6.5, 0, 0, Math.PI * 2);
    ctx.ellipse(0, -6.5, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pointy ears
    ctx.fillStyle = '#e58149';
    ctx.beginPath();
    ctx.moveTo(-7, -14);
    ctx.lineTo(-9, -22);
    ctx.lineTo(-2, -16);
    ctx.moveTo(7, -14);
    ctx.lineTo(9, -22);
    ctx.lineTo(2, -16);
    ctx.fill();
    ctx.fillStyle = '#2d3b45';
    ctx.beginPath();
    ctx.arc(-3, -10, 1.3, 0, Math.PI * 2);
    ctx.arc(3, -10, 1.3, 0, Math.PI * 2);
    ctx.arc(0, -7, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cozy Winter Bunny
    ctx.fillStyle = '#fff7ec';
    ctx.strokeStyle = '#d6c5b3';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(-4, -20, 3.2, 8, -0.12, 0, Math.PI * 2);
    ctx.ellipse(4, -20, 3.2, 8, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f5b5c0';
    ctx.beginPath();
    ctx.ellipse(-4, -20, 1.6, 5, -0.12, 0, Math.PI * 2);
    ctx.ellipse(4, -20, 1.6, 5, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff7ec';
    ctx.beginPath();
    ctx.ellipse(0, 3, 9.5, 10, 0, 0, Math.PI * 2);
    ctx.arc(0, -9, 8.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Mint scarf
    ctx.fillStyle = '#73b8a8';
    ctx.beginPath();
    ctx.roundRect(-7.5, -2.5, 15, 3.8, 2);
    ctx.fill();
    ctx.fillStyle = '#3d4c57';
    ctx.beginPath();
    ctx.arc(-2.8, -10, 1.3, 0, Math.PI * 2);
    ctx.arc(2.8, -10, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f29aa8';
    ctx.beginPath();
    ctx.arc(0, -7.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function draw(ctx, s, w, h, reduced = false) {
  const skiY = h * 0.7;
  const scale = Math.max(7, h / 52);
  const left = w * 0.07;
  const right = w * 0.93;

  ctx.clearRect(0, 0, w, h);

  // Soft sunlit alpine snow gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#eef7fd');
  bg.addColorStop(0.55, '#e5f2fb');
  bg.addColorStop(1, '#f7fbff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft sculpted side snowbanks
  ctx.fillStyle = '#d3e8f4';
  ctx.beginPath();
  ctx.ellipse(-18, h * 0.45, w * 0.16, h * 0.85, 0, 0, Math.PI * 2);
  ctx.ellipse(w + 18, h * 0.58, w * 0.16, h * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-26, h * 0.45, w * 0.12, h * 0.8, 0, 0, Math.PI * 2);
  ctx.ellipse(w + 26, h * 0.58, w * 0.12, h * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Groomed ski trail grooves
  ctx.strokeStyle = 'rgba(182, 211, 229, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const y = ((i * 97 + s.distance * scale) % (h + 100)) - 50;
    ctx.beginPath();
    ctx.moveTo(w * 0.455, y);
    ctx.lineTo(w * 0.445, y + 42);
    ctx.moveTo(w * 0.515, y);
    ctx.lineTo(w * 0.505, y + 42);
    ctx.stroke();
  }

  // Soft falling snowflakes
  for (let i = 0; i < 24; i++) {
    const x = ((i * 73 + 19 + (reduced ? 0 : Math.sin(s.elapsed + i) * 6)) % w + w) % w;
    const y = (i * 91 + (reduced ? 0 : s.elapsed * (12 + (i % 3) * 5))) % h;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.68)';
    ctx.beginPath();
    ctx.arc(x, y, i % 4 === 0 ? 2.8 : 1.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheering woodland friends along the trail (custom storybook illustrations, no emojis)
  for (let d = 35; d < 500; d += 37) {
    const y = skiY - (d - s.distance) * scale;
    if (y < -45 || y > h + 50) continue;
    const side = Math.floor(d / 37) % 2;
    const x = side ? w - 24 : 24;
    const bounce = reduced ? 0 : Math.sin(s.elapsed * 2.4 + d) * 2.5;
    ctx.save();
    ctx.translate(x, y + bounce);
    drawFriend(ctx, Math.floor(d / 37) % 4);
    ctx.restore();

    if (Math.abs(d - s.distance) < 12) {
      const text = side ? 'Go, Levi!' : 'You can do it!';
      ctx.font = '800 12px ui-rounded, system-ui, sans-serif';
      const width = ctx.measureText(text).width + 18;
      const bx = side ? x - width - 14 : x + 14;
      ctx.fillStyle = '#fffdf7';
      ctx.beginPath();
      ctx.roundRect(bx, y + bounce - 46, width, 25, 12);
      ctx.fill();
      ctx.strokeStyle = '#a7c8dc';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#3c6882';
      ctx.textAlign = 'left';
      ctx.fillText(text, bx + 9, y + bounce - 29);
    }
  }

  // Obstacles & collectibles sorted by depth
  const visible = s.objects
    .filter((o) => !o.used)
    .map((o) => ({ ...o, y: skiY - (o.d - s.distance) * scale }))
    .filter((o) => o.y > -65 && o.y < h + 65)
    .sort((a, b) => a.y - b.y);

  for (const o of visible) {
    ctx.save();
    ctx.translate(o.x * w, o.y);
    const bob = reduced ? 0 : Math.sin(s.elapsed * 4 + o.d) * 3;
    if (o.type === 'tree') drawPineTree(ctx);
    else if (o.type === 'rock') drawRock(ctx);
    else if (o.type === 'cocoa') drawCocoa(ctx, bob, s.elapsed, reduced);
    else if (o.type === 'mittens') drawMittens(ctx, bob);
    else drawHat(ctx, bob);
    ctx.restore();
  }

  // Festive Alpine Finish Banner
  const finishY = skiY - (500 - s.distance) * scale;
  if (finishY > -65) {
    // Checkered snow mat
    const cols = 20;
    const cellW = (right - left) / cols;
    for (let i = 0; i < cols; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff' : '#4a708a';
      ctx.fillRect(left + i * cellW, finishY, cellW + 0.5, 9);
      ctx.fillStyle = i % 2 ? '#4a708a' : '#ffffff';
      ctx.fillRect(left + i * cellW, finishY + 9, cellW + 0.5, 9);
    }
    // Wooden posts
    ctx.fillStyle = '#8b634b';
    ctx.beginPath();
    ctx.roundRect(left - 5, finishY - 44, 8, 76, 3);
    ctx.roundRect(right - 3, finishY - 44, 8, 76, 3);
    ctx.fill();
    // Overhead banner ribbon
    ctx.fillStyle = '#e86f5c';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 64, finishY - 42, 128, 28, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH!', w / 2, finishY - 22);
  }

  // Skier + subtle snow spray when moving
  ctx.save();
  ctx.translate(
    s.x * w,
    skiY + (s.phase === 'finished' && !reduced ? Math.sin(performance.now() / 180) * 3 : 0),
  );
  if (s.phase === 'running' && !reduced) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 4; i++) {
      const puff = (s.elapsed * 18 + i * 7) % 16;
      ctx.beginPath();
      ctx.arc((i % 2 ? 1 : -1) * (11 + puff * 0.5), 18 + puff * 0.7, Math.max(1, 3.5 - puff * 0.16), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawSkier(ctx, s, reduced);
  ctx.restore();

  // Floating pickup / tumble callouts
  for (const e of s.events) {
    const y = skiY - 52 - e.age * 36;
    ctx.save();
    ctx.font = '900 22px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeText(e.text, e.x * w, y);
    ctx.fillStyle = e.good ? '#378260' : '#b85c77';
    ctx.fillText(e.text, e.x * w, y);
    ctx.restore();
  }

  // Celebration confetti
  if (s.phase === 'finished' && !reduced) {
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = ['#f0b454', '#e382a3', '#6bc0b8', '#7aa9e0'][i % 4];
      ctx.fillRect((i * 83) % w, (i * 43 + s.elapsed * 28) % h, 6, 10);
    }
  }
}
