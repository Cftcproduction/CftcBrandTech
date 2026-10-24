import avifWasm from '@jsquash/avif/codec/enc/avif_enc.wasm?url';
import avifDecodeWasm from '@jsquash/avif/codec/dec/avif_dec.wasm?url';
import webpWasm from '@jsquash/webp/codec/enc/webp_enc.wasm?url';
import webpSimdWasm from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url';
import jxlWasm from '@jsquash/jxl/codec/dec/jxl_dec.wasm?url';
let avifEncoder, webpReady, avifReady, jxlReady;
self.onmessage = async ({data:message}) => {
  try {
    const {id,action,format,data,options={}}=message;
    let result;
    if(action==='encode' && format==='avif') {
      const [{default:factory},{defaultOptions}] = await Promise.all([import('@jsquash/avif/codec/enc/avif_enc.js'),import('@jsquash/avif/meta.js')]);
      avifEncoder ??= factory({locateFile:()=>avifWasm});
      const codec=await avifEncoder;
      const settings={...defaultOptions,quality:options.quality,qualityAlpha:100,speed:7,lossless:options.lossless};
      if(options.lossless) Object.assign(settings,{quality:100,qualityAlpha:-1,subsample:3});
      const output=codec.encode(new Uint8Array(data.data.buffer),data.width,data.height,settings);
      if(!output) throw new Error('AVIF kodlama başarısız.');
      result=output.buffer;
    } else if(action==='encode' && format==='webp') {
      const codec=await import('@jsquash/webp/encode.js');
      webpReady ??= codec.init({locateFile:name=>name.includes('simd')?webpSimdWasm:webpWasm});
      await webpReady;
      result=await codec.default(data,{quality:options.quality,lossless:options.lossless?1:0,method:4});
    } else if(action==='decode' && format==='avif') {
      const codec=await import('@jsquash/avif/decode.js');
      avifReady ??= codec.init({locateFile:()=>avifDecodeWasm});
      await avifReady;
      result=await codec.default(data);
    } else if(action==='decode' && format==='jxl') {
      const codec=await import('@jsquash/jxl/decode.js');
      jxlReady ??= codec.init({locateFile:()=>jxlWasm});
      await jxlReady;
      result=await codec.default(data);
    } else throw new Error('Desteklenmeyen işlem.');
    if(action==='encode') self.postMessage({id,result},[result]);
    else self.postMessage({id,result:{width:result.width,height:result.height,data:result.data}},[result.data.buffer]);
  } catch(error) { self.postMessage({id:message.id,error:error.message||String(error)}); }
};
