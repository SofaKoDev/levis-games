export async function picture(svg){
 const clone=svg.cloneNode(true);clone.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));
 const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);
 try{const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;canvas.getContext('2d').drawImage(img,0,0,1200,1500);return await new Promise((ok,no)=>canvas.toBlob(b=>b?ok(b):no(Error('Could not create picture')),'image/png'));}finally{URL.revokeObjectURL(url);}
}
