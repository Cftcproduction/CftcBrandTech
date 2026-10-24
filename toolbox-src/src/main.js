import './style.css';
import './workspace.css';
import './brand-theme.css';
import {createIcons,Blocks,Image as ImageIcon,ShieldCheck,CircleHelp,ArrowUpRight,Plus,Scan,FolderOpen,ArrowRight,Upload,RotateCw,FlipHorizontal2,Undo2,Crop,Layers2,Sparkles,SlidersHorizontal,Download,Archive,LockKeyhole,KeyRound,X} from 'lucide';
import {decodeImage,canvas,oriented,integerCrop,outputDimensions,exportImage,stopCodec} from './images.js';
const icons={Blocks,Image:ImageIcon,ShieldCheck,CircleHelp,ArrowUpRight,Plus,Scan,FolderOpen,ArrowRight,Upload,RotateCw,FlipHorizontal2,Undo2,Crop,Layers2,Sparkles,SlidersHorizontal,Download,Archive,LockKeyhole,KeyRound,X};
const $=selector=>document.querySelector(selector), $$=selector=>[...document.querySelectorAll(selector)];
const iconize=()=>createIcons({icons});iconize();
let items=[],selected=null,original=null,view=null,busy=false,canceled=false,format='webp',drawMode=false,drag=null,toastTimer;
const editor=$('#editor'),stage=$('#stage'),ctx=editor.getContext('2d');
const number=n=>Math.round(n).toLocaleString('tr-TR'),sizeText=n=>n<1024*1024?`${Math.round(n/1024)} KB`:`${(n/1024/1024).toLocaleString('tr-TR',{maximumFractionDigits:2})} MB`;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function status(text,error=false){$('#status').textContent=text;$('#status').classList.toggle('error',error);}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,5500);}
function enable(){
  const valid=!!selected&&!!view;
  $('#add-top').disabled=busy;$('#clear').disabled=busy||!items.length;$('#files').disabled=busy;
  for(const id of ['reset','apply-crop','export-one'])$('#'+id).disabled=busy||!valid;
  for(const id of ['rotate','mirror','new-crop','ratio-lock','ratio','crop-w','crop-h','crop-x','crop-y'])$('#'+id).disabled=busy||!valid||!!selected?.preview;
  $$('[data-ratio]').forEach(b=>b.disabled=busy||!valid||!!selected?.preview);
  $('#export-all').disabled=busy||!items.length;
  for(const element of $$('.settings input,.settings select,.format-picker button')){
    if(!['ratio','crop-w','crop-h','crop-x','crop-y'].includes(element.id))element.disabled=busy||(['ratio-w','ratio-h'].includes(element.id)&&!!selected?.preview);
  }
  updateFormat();syncLock();syncPreview();editor.style.pointerEvents=busy||selected?.preview?'none':'auto';$('#dropzone').setAttribute('aria-disabled',String(busy));
}
function syncPreview(){
  const preview=!!selected?.preview;
  $('#apply-crop').setAttribute('aria-pressed',String(preview));
  $('#apply-label').hidden=preview;$('#edit-label').hidden=!preview;
  $('#apply-crop').classList.toggle('previewing',preview);
  $('#new-crop').hidden=preview;$('#ratio-lock').hidden=preview;
}
$('#apply-crop').onclick=()=>{
  if(!selected||busy)return;
  selected.preview=!selected.preview;drawMode=false;drag=null;$('#new-crop').classList.remove('active');
  enable();cropChanged();
  status(selected.preview?'Kırpılmış görsel hazır. İndirebilir veya kadrajı yeniden düzenleyebilirsin.':'Kadraj düzenleme açık. Alanı ayarlayıp kırpmayı yeniden uygula.');
};
function resetView(){original?.close?.();original=null;if(view)view.width=view.height=1;view=null;selected=null;$('#editor').hidden=true;$('#dropzone').hidden=false;$('#canvas-badge').hidden=true;$('#image-title').textContent='Önizleme';$('#image-meta').textContent='ÇALIŞMA ALANI';$('#output-size').textContent='—';drawMode=false;$('#new-crop').classList.remove('active');enable();}
function updateFormat(){
  const lossless=$('#lossless').checked&&['webp','avif'].includes(format);
  $('#quality').disabled=busy||format==='png'||lossless;
  $('#quality-value').innerHTML=format==='png'||lossless?'Kayıpsız':`${$('#quality').value}<span>%</span>`;
  $('#lossless-row').hidden=!['webp','avif'].includes(format);$('#matte-row').hidden=format!=='jpg';
  $('#format-info').textContent={webp:'Küçük dosyalar, şeffaf arka plan desteği.',png:'Kayıpsız görüntü ve şeffaf arka plan.',jpg:'Geniş uyumluluk. Şeffaf alanlar doldurulur.',avif:'Yeni nesil sıkıştırma, şeffaflık desteği.'}[format];
  $$('[data-format]').forEach(b=>{b.classList.toggle('selected',b.dataset.format===format);b.setAttribute('aria-pressed',String(b.dataset.format===format));});
}
function ratioValue(){if(!selected)return null;const r=selected.ratio;if(r==='free')return null;if(r==='current')return selected.fixedRatio;if(r==='original')return view.width/view.height;if(r==='custom')return selected.custom[0]/selected.custom[1];return Number(r);}
function syncLock(){
  const locked=!!selected&&selected.ratio!=='free',button=$('#ratio-lock');
  button.classList.toggle('locked',locked);button.setAttribute('aria-pressed',String(locked));
  button.setAttribute('aria-label','En-boy oranı kilidi');
  button.title=locked?'Oran kilitli · Serbest kırpmaya geç':'Serbest kırpma · Mevcut en-boy oranını kilitle';
  $('#lock-label').textContent=locked?'Oran kilitli':'Serbest';
}
function syncRatio(){
  $('#ratio').value=selected?.ratio||'free';$('#custom-ratio').hidden=selected?.ratio!=='custom';
  $('#ratio-w').value=selected?.custom[0]||1;$('#ratio-h').value=selected?.custom[1]||1;
  $$('[data-ratio]').forEach(b=>b.classList.toggle('selected',b.dataset.ratio===selected?.ratio));
  syncLock();
}
function cropChanged(){
  if(!selected||!view)return;
  const c=integerCrop(selected.crop,view.width,view.height);
  for(const key of ['x','y','w','h'])$('#crop-'+key).value=c[key];
  const [w,h]=outputDimensions(c,Number($('#max-edge').value)||0);
  $('#output-size').textContent=`${number(w)} × ${number(h)} px`;
  $('#canvas-badge').textContent=`${selected.preview?'Kırpılmış · ':''}${number(c.w)} × ${number(c.h)} px`;
  $('#crop-hint').textContent=selected.preview?'Kırpma uygulandı. Sonucu görüyorsun.':'Köşelerden boyutlandır, içinden tutup taşı.';
  draw();
}
function applyRatio(value){
  if(!selected||busy)return;selected.ratio=value;
  selected.custom=[clamp(Number($('#ratio-w').value)||1,1,1000),clamp(Number($('#ratio-h').value)||1,1,1000)];
  if(value==='current')selected.fixedRatio=selected.crop.w/selected.crop.h;
  else fitCropToRatio();
  syncRatio();cropChanged();
}
function fitCropToRatio(){
  const ratio=ratioValue();if(ratio){let w=view.width,h=w/ratio;if(h>view.height){h=view.height;w=h*ratio;}selected.crop={x:(view.width-w)/2,y:(view.height-h)/2,w,h};}
}
$('#ratio-lock').onclick=()=>{
  if(!selected||busy)return;
  if(selected.ratio==='free'){selected.fixedRatio=selected.crop.w/selected.crop.h;selected.ratio='current';}
  else selected.ratio='free';
  syncRatio();cropChanged();
};
function renderQueue(){
  const queue=$('#queue');queue.replaceChildren();$('#file-count').textContent=items.length;
  if(!items.length){queue.innerHTML='<div class="queue-empty"><i data-lucide="layers-2"></i><p>Eklediğin görseller burada görünecek.</p></div>';iconize();return;}
  for(const item of items){
    const card=document.createElement('div');card.className='file-card'+(selected?.id===item.id?' selected':'');card.tabIndex=0;card.role='button';card.setAttribute('aria-label',item.file.name+' dosyasını düzenle');
    const img=document.createElement('img');img.src=item.thumb;img.alt='';
    const name=document.createElement('span');name.className='filename';name.textContent=item.file.name;name.title=item.file.name;
    const remove=document.createElement('button');remove.className='remove';remove.textContent='×';remove.title='Görseli kaldır';remove.setAttribute('aria-label',item.file.name+' dosyasını kaldır');remove.disabled=busy;
    remove.onclick=async e=>{e.stopPropagation();if(busy)return;URL.revokeObjectURL(item.thumb);items=items.filter(i=>i.id!==item.id);if(selected===item){resetView();if(items.length)await selectItem(items[0]);}renderQueue();enable();if(!items.length)status('Başlamak için bir görsel ekle.');};
    card.append(img,name,remove);card.onclick=()=>!busy&&selectItem(item);card.onkeydown=e=>{if(e.target!==card)return;if(['Enter',' '].includes(e.key)){e.preventDefault();if(!busy)selectItem(item);}};queue.append(card);
  }
  const add=document.createElement('button');add.className='queue-add';add.textContent='+';add.setAttribute('aria-label','Daha fazla görsel ekle');add.disabled=busy;add.onclick=browse;queue.append(add);
}
async function selectItem(item){
  if(busy)return;busy=true;enable();status('Görsel açılıyor…');
  try{
    const image=await decodeImage(item.file);original?.close?.();original=image;if(view)view.width=view.height=1;
    view=oriented(image,item);selected=item;syncRatio();drawMode=false;$('#new-crop').classList.remove('active');
    $('#editor').hidden=false;$('#dropzone').hidden=true;$('#canvas-badge').hidden=false;
    $('#image-title').textContent=item.file.name;$('#image-meta').textContent=`${number(view.width)} × ${number(view.height)} · ${sizeText(item.file.size)}`;
    cropChanged();renderQueue();status('Kadrajını ayarla, sonra görselini indir.');
  }catch(error){status(error.message,true);toast(error.message);}
  finally{busy=false;enable();renderQueue();}
}
async function addFiles(fileList){
  if(busy)return;const files=Array.from(fileList);if(!files.length)return;
  busy=true;enable();const errors=[],seen=new Set(items.map(i=>i.file.name+':'+i.file.size+':'+i.file.lastModified));
  let added=0;
  for(const [index,file] of files.entries()){
    const key=file.name+':'+file.size+':'+file.lastModified;if(seen.has(key))continue;seen.add(key);
    status(`Görseller hazırlanıyor · ${index+1}/${files.length}`);
    try{
      const image=await decodeImage(file),factor=Math.min(1,200/Math.max(image.width,image.height));
      const thumb=canvas(Math.max(1,Math.round(image.width*factor)),Math.max(1,Math.round(image.height*factor)));thumb.getContext('2d').drawImage(image,0,0,thumb.width,thumb.height);
      const blob=await new Promise(resolve=>thumb.toBlob(resolve,'image/png'));
      items.push({id:crypto.randomUUID(),file,thumb:URL.createObjectURL(blob),turns:0,flip:false,ratio:'free',custom:[1,1],crop:{x:0,y:0,w:image.width,h:image.height}});
      image.close?.();added++;renderQueue();
    }catch(error){errors.push(`${file.name}: ${error.message}`);}
  }
  busy=false;if(!selected&&items.length)await selectItem(items[0]);enable();renderQueue();
  if(errors.length){status(errors.join(' • '),true);toast(`${errors.length} dosya açılamadı. Ayrıntı çıktı panelinde.`);}
  else if(added)status(`${added} görsel eklendi. Her birinin kadrajını ayrı ayarlayabilirsin.`);
  $('#files').value='';
}
function browse(){if(!busy)$('#files').click();}
$('#add-top').onclick=browse;$('#dropzone').onclick=browse;
$('#dropzone').onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();browse();}};
$('#files').onchange=e=>addFiles(e.target.files);
let dragDepth=0;
document.addEventListener('dragenter',e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();dragDepth++;if(!busy)$('.drag-overlay').hidden=false;}});
document.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault();});
document.addEventListener('dragleave',e=>{e.preventDefault();if(--dragDepth<=0){dragDepth=0;$('.drag-overlay').hidden=true;}});
document.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;$('.drag-overlay').hidden=true;if(e.dataTransfer.files.length)addFiles(e.dataTransfer.files);});
$('#clear').onclick=()=>{if(busy)return;for(const item of items)URL.revokeObjectURL(item.thumb);items=[];resetView();renderQueue();status('Başlamak için bir görsel ekle.');};
$('#ratio').onchange=e=>applyRatio(e.target.value);$$('[data-ratio]').forEach(b=>b.onclick=()=>applyRatio(b.dataset.ratio));
for(const id of ['ratio-w','ratio-h'])$('#'+id).onchange=()=>applyRatio('custom');
$$('[data-format]').forEach(b=>b.onclick=()=>{format=b.dataset.format;updateFormat();});
$('#quality').oninput=updateFormat;$('#lossless').onchange=updateFormat;$('#max-edge').oninput=cropChanged;
function transform(reset=false){if(!selected||busy)return;selected.preview=false;if(view)view.width=view.height=1;view=oriented(original,selected);selected.crop={x:0,y:0,w:view.width,h:view.height};if(reset)selected.ratio='free';else fitCropToRatio();syncRatio();enable();$('#image-meta').textContent=`${number(view.width)} × ${number(view.height)} · ${sizeText(selected.file.size)}`;cropChanged();}
$('#rotate').onclick=()=>{selected.turns=(selected.turns+1)%4;transform();};$('#mirror').onclick=()=>{selected.flip=!selected.flip;transform();};$('#reset').onclick=()=>{selected.turns=0;selected.flip=false;transform(true);};
$('#new-crop').onclick=()=>{drawMode=!drawMode;$('#new-crop').classList.toggle('active',drawMode);toast(drawMode?'Görselin üzerinde sürükleyerek yeni bir alan çiz.':'Kırpma alanını taşıyabilirsin.');};
for(const key of ['x','y','w','h'])$('#crop-'+key).onchange=()=>{
  if(!selected||busy)return;const c={...selected.crop},value=Number($('#crop-'+key).value);if(!Number.isFinite(value)){cropChanged();return;}
  c[key]=value;const ratio=ratioValue();
  if(key==='w'||key==='h'){
    c.w=clamp(c.w,1,view.width);c.h=clamp(c.h,1,view.height);
    if(ratio){if(key==='w')c.h=c.w/ratio;else c.w=c.h*ratio;const factor=Math.min(1,view.width/c.w,view.height/c.h);c.w*=factor;c.h*=factor;}
  }
  c.x=clamp(c.x,0,view.width-c.w);c.y=clamp(c.y,0,view.height-c.h);selected.crop=c;cropChanged();
};
function geometry(){const w=stage.clientWidth,h=stage.clientHeight,pad=20,size=selected.preview?integerCrop(selected.crop,view.width,view.height):{w:view.width,h:view.height};const scale=Math.min((w-pad*2)/size.w,(h-pad*2)/size.h);return{x:(w-size.w*scale)/2,y:(h-size.h*scale)/2,w:size.w*scale,h:size.h*scale,scale};}
function draw(){
  if(!view||!selected)return;const dpr=Math.min(devicePixelRatio||1,2),w=stage.clientWidth,h=stage.clientHeight;
  if(editor.width!==Math.round(w*dpr)||editor.height!==Math.round(h*dpr)){editor.width=Math.round(w*dpr);editor.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const g=geometry(),c=selected.crop;
  ctx.save();ctx.beginPath();ctx.rect(g.x,g.y,g.w,g.h);ctx.clip();
  for(let y=g.y;y<g.y+g.h;y+=12)for(let x=g.x;x<g.x+g.w;x+=12){ctx.fillStyle=(Math.round((x-g.x)/12)+Math.round((y-g.y)/12))%2?'#2b2b2b':'#202020';ctx.fillRect(x,y,12,12);}
  if(selected.preview){const crop=integerCrop(c,view.width,view.height);ctx.drawImage(view,crop.x,crop.y,crop.w,crop.h,g.x,g.y,g.w,g.h);ctx.restore();return;}
  ctx.drawImage(view,g.x,g.y,g.w,g.h);
  const r={x:g.x+c.x*g.scale,y:g.y+c.y*g.scale,w:c.w*g.scale,h:c.h*g.scale};
  ctx.fillStyle='#00000099';ctx.beginPath();ctx.rect(g.x,g.y,g.w,g.h);ctx.rect(r.x,r.y,r.w,r.h);ctx.fill('evenodd');
  ctx.strokeStyle='#ffffff50';ctx.lineWidth=1;ctx.beginPath();for(const f of [1/3,2/3]){ctx.moveTo(r.x+r.w*f,r.y);ctx.lineTo(r.x+r.w*f,r.y+r.h);ctx.moveTo(r.x,r.y+r.h*f);ctx.lineTo(r.x+r.w,r.y+r.h*f);}ctx.stroke();ctx.restore();
  ctx.strokeStyle=getComputedStyle(editor).getPropertyValue('--accent').trim();ctx.lineWidth=1.5;ctx.strokeRect(r.x,r.y,r.w,r.h);
  ctx.fillStyle='#ffffff';for(const [x,y] of [[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]]){ctx.beginPath();ctx.roundRect(x-4,y-4,8,8,2);ctx.fill();}
}
new ResizeObserver(draw).observe(stage);
function point(event){const rect=editor.getBoundingClientRect(),g=geometry();return{x:clamp((event.clientX-rect.left-g.x)/g.scale,0,view.width),y:clamp((event.clientY-rect.top-g.y)/g.scale,0,view.height)};}
function hitCorner(p){const c=selected.crop,g=geometry(),tolerance=16/g.scale;return[[c.x,c.y],[c.x+c.w,c.y],[c.x,c.y+c.h],[c.x+c.w,c.y+c.h]].findIndex(([x,y])=>Math.hypot(p.x-x,p.y-y)<tolerance);}
editor.onpointerdown=e=>{
  if(busy||!view||e.button!==0)return;e.preventDefault();const p=point(e),c=selected.crop,corner=hitCorner(p),corners=[[c.x,c.y],[c.x+c.w,c.y],[c.x,c.y+c.h],[c.x+c.w,c.y+c.h]];
  if(corner>=0&&!drawMode&&!e.shiftKey){const [x,y]=corners[3-corner];drag={type:'resize',anchor:{x,y}};}
  else if(!drawMode&&!e.shiftKey&&p.x>=c.x&&p.x<=c.x+c.w&&p.y>=c.y&&p.y<=c.y+c.h)drag={type:'move',start:p,crop:{...c}};
  else drag={type:'resize',anchor:p};
  editor.setPointerCapture(e.pointerId);
};
editor.onpointermove=e=>{
  if(!view||!selected||busy)return;const p=point(e),c=selected.crop;
  if(!drag){const corner=hitCorner(p);editor.style.cursor=drawMode?'crosshair':corner>=0?(corner===0||corner===3?'nwse-resize':'nesw-resize'):p.x>=c.x&&p.x<=c.x+c.w&&p.y>=c.y&&p.y<=c.y+c.h?'move':'crosshair';return;}
  if(drag.type==='move'){selected.crop={...drag.crop,x:clamp(drag.crop.x+p.x-drag.start.x,0,view.width-c.w),y:clamp(drag.crop.y+p.y-drag.start.y,0,view.height-c.h)};}
  else{const a=drag.anchor,dx=p.x-a.x,dy=p.y-a.y,sx=dx>=0?1:-1,sy=dy>=0?1:-1;let w=Math.abs(dx),h=Math.abs(dy);const ratio=ratioValue();if(ratio){w=Math.max(w,h*ratio);w=Math.min(w,sx>0?view.width-a.x:a.x,(sy>0?view.height-a.y:a.y)*ratio);h=w/ratio;}if(w>=1&&h>=1)selected.crop={x:sx>0?a.x:a.x-w,y:sy>0?a.y:a.y-h,w,h};}
  cropChanged();
};
function finishDrag(e){drag=null;if(editor.hasPointerCapture(e.pointerId))editor.releasePointerCapture(e.pointerId);drawMode=false;$('#new-crop').classList.remove('active');}
editor.onpointerup=finishDrag;editor.onpointercancel=finishDrag;
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function doExport(all){
  if(busy||!items.length||(!all&&!selected))return;
  const maxEdge=Number($('#max-edge').value)||0;if(maxEdge<0||maxEdge>16000){status('En uzun kenar 1–16.000 px arasında olmalı; orijinal boyut için boş bırak.',true);return;}
  const options={format,quality:Number($('#quality').value),lossless:$('#lossless').checked,matte:$('#matte').value,maxEdge};
  const targets=(all?items:[selected]).map(i=>({...i,crop:{...i.crop}}));const results=[],errors=[],names=new Set();
  canceled=false;busy=true;enable();renderQueue();$('#progress').hidden=false;$('#progress div').style.width='0%';$('#cancel').hidden=false;
  try{
    for(const [index,item] of targets.entries()){
      if(canceled)break;status(`${index+1}/${targets.length} · ${item.file.name} dönüştürülüyor…`);
      try{
        const blob=await exportImage(item,options);if(canceled)break;
        const stem=(item.file.name.replace(/\.[^.]+$/,'').replace(/[<>:"/\\|?*\x00-\x1F]/g,'_')||'gorsel')+'_toolbox';
        let name=`${stem}.${format}`,n=2;while(names.has(name.toLowerCase()))name=`${stem}_${n++}.${format}`;names.add(name.toLowerCase());results.push({blob,name});
      }catch(error){if(!canceled)errors.push(`${item.file.name}: ${error.message}`);}
      $('#progress div').style.width=`${(index+1)/targets.length*100}%`;
    }
    if(canceled){status('İşlem iptal edildi. Dosyaların ve ayarların korunuyor.');return;}
    if(results.length){
      if(all){status('ZIP hazırlanıyor…');const {zip}=await import('fflate');const entries=Object.create(null);for(const r of results)entries[r.name]=new Uint8Array(await r.blob.arrayBuffer());
        const archive=await new Promise((resolve,reject)=>zip(entries,{level:0},(error,data)=>error?reject(error):resolve(data)));if(canceled){status('İşlem iptal edildi.');return;}download(new Blob([archive],{type:'application/zip'}),'toolbox-gorseller.zip');
      }else download(results[0].blob,results[0].name);
      const total=results.reduce((sum,r)=>sum+r.blob.size,0);toast(`${results.length} görsel hazır · ${sizeText(total)}`);
      status(`${results.length} görsel indirildi · ${sizeText(total)}${errors.length?' • '+errors.join(' • '):''}`,!!errors.length);
    }else status(errors.join(' • ')||'Görsel kaydedilemedi.',true);
  }catch(error){status(error.message,true);}
  finally{busy=false;$('#cancel').hidden=true;$('#progress').hidden=true;enable();renderQueue();}
}
$('#export-one').onclick=()=>doExport(false);$('#export-all').onclick=()=>doExport(true);$('#cancel').onclick=()=>{canceled=true;stopCodec();status('İşlem durduruluyor…');};
$('#help').onclick=$('#footer-help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();$('#help-dialog').onclick=e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='o'){e.preventDefault();browse();}if(e.key==='Escape'&&drag){drag=null;drawMode=false;$('#new-crop').classList.remove('active');}});
enable();
