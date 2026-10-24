let worker, nextId=1;
const pending=new Map();
export function stopCodec() {
  worker?.terminate(); worker=null;
  for(const {reject} of pending.values()) reject(new Error('İşlem iptal edildi.'));
  pending.clear();
}
function codec(action,format,data,options={}) {
  if(!worker) {
    worker=new Worker(new URL('./codec.worker.js',import.meta.url),{type:'module'});
    worker.onmessage=({data:message})=>{const call=pending.get(message.id);if(!call)return;pending.delete(message.id);message.error?call.reject(new Error(message.error)):call.resolve(message.result);};
    worker.onerror=()=>{stopCodec();};
  }
  return new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,{resolve,reject});worker.postMessage({id,action,format,data,options});});
}
export function canvas(width,height) {const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
export function fromData(data) {const c=canvas(data.width,data.height);c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data.data),data.width,data.height),0,0);return c;}
function validateSize(width,height) {if(!width||!height)throw new Error('Görselin boyutları okunamadı.');if(width*height>40_000_000||width>30000||height>30000)throw new Error('Görsel çok büyük. Sınır: 40 megapiksel, kenar başına 30.000 px.');}
async function browserDecode(blob) {
  try {return await createImageBitmap(blob);}catch {
    const url=URL.createObjectURL(blob);
    try {const image=new Image();image.src=url;await image.decode();validateSize(image.naturalWidth,image.naturalHeight);const c=canvas(image.naturalWidth,image.naturalHeight);c.getContext('2d').drawImage(image,0,0);return c;}finally{URL.revokeObjectURL(url);}
  }
}
export async function decodeImage(file) {
  if(file.size>50*1024*1024)throw new Error('Dosya 50 MB sınırını aşıyor.');
  const ext=file.name?.split('.').pop().toLowerCase();
  let image;
  try {image=await browserDecode(file);}catch(nativeError) {
    if(['heic','heif','hif'].includes(ext)) {
      const {default:convert}=await import('heic2any');
      let blob=await convert({blob:file,toType:'image/png',multiple:false});
      if(Array.isArray(blob))blob=blob[0];
      image=await browserDecode(blob);
    } else if(['tif','tiff'].includes(ext)) {
      const {default:UTIF}=await import('utif');const buffer=await file.arrayBuffer();const [page]=UTIF.decode(buffer);
      if(!page)throw new Error('TIFF sayfası bulunamadı.');
      validateSize(page.t256?.[0],page.t257?.[0]);UTIF.decodeImage(buffer,page);
      image=fromData({width:page.width,height:page.height,data:UTIF.toRGBA8(page)});
    } else if(ext==='psd') {
      const {readPsd}=await import('ag-psd');const psd=readPsd(await file.arrayBuffer(),{skipLayerImageData:true,skipThumbnail:true});
      if(!psd.canvas)throw new Error('PSD birleşik önizlemesi bulunamadı.');image=psd.canvas;
    } else if(ext==='jxl'||ext==='avif') image=fromData(await codec('decode',ext,await file.arrayBuffer()));
    else throw new Error('Bu format veya dosya okunamadı. Kullanım bölümünden desteklenen formatları kontrol et.');
  }
  try {validateSize(image.width,image.height);}catch(error){image.close?.();throw error;}
  return image;
}
export function oriented(image,item) {
  const odd=item.turns%2;const c=canvas(odd?image.height:image.width,odd?image.width:image.height),ctx=c.getContext('2d');
  ctx.translate(c.width/2,c.height/2);if(item.flip)ctx.scale(-1,1);ctx.rotate(item.turns*Math.PI/2);ctx.drawImage(image,-image.width/2,-image.height/2);return c;
}
export function integerCrop(crop,width,height) {
  const x=Math.max(0,Math.min(width-1,Math.round(crop.x))),y=Math.max(0,Math.min(height-1,Math.round(crop.y)));
  return {x,y,w:Math.max(1,Math.min(width,Math.round(crop.x+crop.w))-x),h:Math.max(1,Math.min(height,Math.round(crop.y+crop.h))-y)};
}
export function outputDimensions(crop,maxEdge) {
  const factor=maxEdge?Math.min(1,maxEdge/Math.max(crop.w,crop.h)):1;
  return [Math.max(1,Math.round(crop.w*factor)),Math.max(1,Math.round(crop.h*factor))];
}
export async function exportImage(item,options) {
  const original=await decodeImage(item.file);
  const source=oriented(original,item);original.close?.();
  const crop=integerCrop(item.crop,source.width,source.height);
  const [w,h]=outputDimensions(crop,options.maxEdge),out=canvas(w,h),ctx=out.getContext('2d');
  if(options.format==='jpg'){ctx.fillStyle=options.matte;ctx.fillRect(0,0,w,h);}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,crop.x,crop.y,crop.w,crop.h,0,0,w,h);source.width=source.height=1;
  let blob;
  if(['avif','webp'].includes(options.format)) {
    const data=ctx.getImageData(0,0,w,h);out.width=out.height=1;
    blob=new Blob([await codec('encode',options.format,data,options)],{type:'image/'+options.format});
  } else {
    const mime=options.format==='jpg'?'image/jpeg':'image/png';
    blob=await new Promise((resolve,reject)=>out.toBlob(b=>b?resolve(b):reject(new Error('Görsel kaydedilemedi.')),mime,options.quality/100));
    if(blob.type!==mime)throw new Error('Tarayıcı bu çıktı formatını desteklemiyor.');
    out.width=out.height=1;
  }
  return blob;
}
