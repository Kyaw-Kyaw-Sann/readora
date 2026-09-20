import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { pdfViewerHtml } from './pdf-viewer-html';

export interface PdfPosition { currentPage: number; totalPages: number; zoom: number }
export interface PdfViewerHandle { page: (page: number) => void; zoom: (zoom: number) => void }
interface Props {
  url: string; initialPage: number; background: string;
  onPage: (position: PdfPosition) => void; onError: (message: string) => void; onBusy: () => void;
}

export const PdfViewer = forwardRef<PdfViewerHandle, Props>(function PdfViewer({url, initialPage, background, onPage, onError, onBusy}, ref) {
  const web = useRef<WebView>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [source] = useState(() => ({html:pdfViewerHtml(url, initialPage, background), baseUrl:'https://readora.invalid/'}));
  useEffect(() => {
    web.current?.injectJavaScript(`document.documentElement.style.background=${JSON.stringify(background)};document.body.style.background=${JSON.stringify(background)};true;`);
  }, [background]);
  const stopTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  const errorCallback = useRef(onError);
  errorCallback.current = onError;
  useEffect(() => {
    timer.current = setTimeout(() => errorCallback.current('PDF loading timed out. Please retry.'), 60000);
    return stopTimer;
  }, [source]);
  useImperativeHandle(ref, () => ({
    page: (page) => web.current?.injectJavaScript(`window.readoraCommand?.(${JSON.stringify({type:'page',page})});true;`),
    zoom: (zoom) => web.current?.injectJavaScript(`window.readoraCommand?.(${JSON.stringify({type:'zoom',zoom})});true;`),
  }), []);
  const message = (event: WebViewMessageEvent) => {
    try {
      const value = JSON.parse(event.nativeEvent.data);
      if (value.type === 'page' && Number.isInteger(value.currentPage) && Number.isInteger(value.totalPages)
        && value.currentPage >= 1 && value.currentPage <= value.totalPages && Number.isFinite(value.zoom)) {
        stopTimer(); onPage(value);
      } else if (value.type === 'busy') {
        stopTimer();
        timer.current = setTimeout(() => errorCallback.current('PDF rendering timed out. Please retry.'), 60000);
        onBusy();
      }
      else if (value.type === 'error') {stopTimer(); onError('Unable to open or render PDF. Check your connection and retry.');}
    } catch { stopTimer(); onError('The PDF viewer could not communicate. Please retry.'); }
  };
  return <WebView ref={web} source={source} onMessage={message} javaScriptEnabled
    originWhitelist={['*']} onShouldStartLoadWithRequest={(request) => request.url === 'about:blank' || request.url === 'https://readora.invalid/'}
    onError={() => {stopTimer(); onError('PDF viewer failed. Please retry.');}}
    onContentProcessDidTerminate={() => onError('PDF viewer stopped. Please retry.')}
    onRenderProcessGone={() => onError('PDF viewer stopped. Please retry.')}
    mixedContentMode="never" sharedCookiesEnabled={false} thirdPartyCookiesEnabled={false}
    setSupportMultipleWindows={false} allowsFullscreenVideo={false} style={{backgroundColor:background}} />;
});
