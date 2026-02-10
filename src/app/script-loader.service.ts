import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

interface LoadScriptOptions {
  async?: boolean;
  defer?: boolean;
  attrs?: Record<string, string>; // e.g., { integrity: '...', nonce: '...' }
}

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {

  private renderer: Renderer2;
  private loadingMap = new Map<string, Promise<void>>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }


  load(src: string, options: LoadScriptOptions = {}): Promise<void> {
    if (this.loadingMap.has(src)) {
      return this.loadingMap.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      // If already present in DOM, resolve immediately
      const existing = this.document.querySelector<HTMLScriptElement>(
        `script[src="${src}"]`
      );
      if (existing && (existing as any)._loaded === true) {
        resolve();
        return;
      }

      const script = this.renderer.createElement('script') as HTMLScriptElement;
      script.src = src;
      script.async = options.async ?? false;
      script.defer = options.defer ?? true; // default to defer = true
      script.type = 'text/javascript';
      // Optional attributes (integrity, nonce, crossOrigin, etc.)
      if (options.attrs) {
        Object.entries(options.attrs).forEach(([k, v]) =>
          this.renderer.setAttribute(script, k, v),
        );
      }

      // Mark when loaded so subsequent checks can fast-resolve
      script.onload = () => {
        (script as any)._loaded = true;
        resolve();
      };
      script.onerror = (e) => {
        this.loadingMap.delete(src);
        reject(new Error(`Failed to load script: ${src}`));
      };

      // Append to <head> (or body if needed)
      const target = this.document.head || this.document.body;
      this.renderer.appendChild(target, script);
    });

    this.loadingMap.set(src, promise);
    return promise;
  }
}