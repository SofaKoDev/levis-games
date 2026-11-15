export function animatePaint(area,color) {
  if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const drop=document.createElement('span');drop.className='falling-drop';drop.style.background=color;area.append(drop);
  drop.addEventListener('animationend',()=>drop.remove(),{once:true});
  // Each tap owns its drop. The decorative ripple never modifies paint state.
  const ripple=document.createElement('span');ripple.className='ripple';area.append(ripple);
  ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
}
