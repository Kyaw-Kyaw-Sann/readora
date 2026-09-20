import vendor from '../../../assets/readora-pdfjs.json';

const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export function pdfViewerHtml(url: string, initialPage: number, background: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('PDF storage must use HTTPS without embedded credentials.');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval' blob:; worker-src blob:; connect-src ${parsed.origin}; style-src 'unsafe-inline'; img-src blob: data:; font-src blob: data:">
    <style>html,body{margin:0;width:100%;height:100%;background:${background}}#viewport{height:100%;overflow:auto;text-align:center}canvas{display:block;margin:12px auto;background:white}</style>
    </head><body><div id="viewport"><canvas id="page"></canvas></div><script type="module">
    const assets = ${safeJson(vendor)};
    const config = ${safeJson({ url, initialPage })};
    const send = value => window.ReactNativeWebView?.postMessage(JSON.stringify(value));
    const moduleUrl = code => URL.createObjectURL(new Blob([code], {type:'text/javascript'}));
    const decode = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
    let pdf, page = 1, zoom = 1, rendering = false, requested = 1;
    const canvas = document.getElementById('page');
    const viewport = document.getElementById('viewport');
    async function render() {
      if (!pdf || rendering) return;
      rendering = true;
      send({type:'busy'});
      const target = requested;
      const targetZoom = zoom;
      try {
        const item = await pdf.getPage(target);
        const base = item.getViewport({scale:1});
        const scale = Math.max(0.1, (viewport.clientWidth - 24) / base.width) * targetZoom;
        const view = item.getViewport({scale});
        const ratio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(6000000 / (view.width * view.height)));
        canvas.width = Math.max(1, Math.floor(view.width * ratio));
        canvas.height = Math.max(1, Math.floor(view.height * ratio));
        canvas.style.width = view.width + 'px'; canvas.style.height = view.height + 'px';
        await item.render({canvasContext:canvas.getContext('2d'), viewport:view, transform:[ratio,0,0,ratio,0,0]}).promise;
        page = target;
        viewport.scrollTop = 0;
        item.cleanup();
        send({type:'page',currentPage:page,totalPages:pdf.numPages,zoom:targetZoom});
      } catch { send({type:'error',message:'Unable to render this PDF page. Please retry.'}); }
      finally { rendering = false; }
      if (requested !== target || zoom !== targetZoom) void render();
    }
    window.readoraCommand = command => {
      if (!pdf) return;
      if (command.type === 'page') requested = Math.max(1,Math.min(pdf.numPages,command.page));
      if (command.type === 'zoom') zoom = Math.max(1,Math.min(3,command.zoom));
      void render();
    };
    try {
      const engineUrl = moduleUrl(assets.engine);
      const lib = await import(engineUrl);
      lib.GlobalWorkerOptions.workerSrc = moduleUrl(assets.worker);
      class BundledBinaryDataFactory {
        async fetch({kind, filename}) {
          const directory = {cMapUrl:'cmaps',standardFontDataUrl:'standard_fonts',wasmUrl:'wasm'}[kind];
          const value = assets.binary[directory + '/' + filename];
          if (!value) throw new Error('Missing bundled PDF resource');
          return decode(value);
        }
      }
      pdf = await lib.getDocument({url:config.url,withCredentials:false,useWorkerFetch:false,
        BinaryDataFactory:BundledBinaryDataFactory, cMapPacked:true,
        disableAutoFetch:true, disableStream:true, enableXfa:false}).promise;
      requested = Math.max(1,Math.min(pdf.numPages,config.initialPage || 1));
      await render();
      let resizeTimer;
      window.addEventListener('resize',() => {clearTimeout(resizeTimer);resizeTimer=setTimeout(render,150)});
    } catch { send({type:'error',message:'Unable to open PDF. Check your connection and retry. Storage must allow CORS.'}); }
    </script></body></html>`;
}
