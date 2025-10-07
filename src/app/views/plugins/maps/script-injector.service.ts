import { DOCUMENT, inject, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptInjectorService {
  readonly #document: Document = inject(DOCUMENT);
  readonly #rendererFactory: RendererFactory2 = inject(RendererFactory2);
  readonly #renderer: Renderer2 = this.#rendererFactory.createRenderer(null, null);

  readonly loaded = signal(false);
  readonly #loadedScripts = new Set<string>()

  #appendScript(src: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = this.#renderer.createElement('script');
      this.#renderer.setAttribute(scriptElement, 'type', 'text/javascript');
      this.#renderer.setAttribute(scriptElement, 'src', src);
      this.#renderer.setProperty(scriptElement, 'loading', 'async');
      scriptElement.onload = () => {
        resolve({ loaded: true });
      };
      scriptElement.onerror = (error: any) => reject({ loaded: false, error });
      this.#renderer.appendChild(this.#document.head, scriptElement);
    });
  }

  loadScript(src: string) {
    if (this.#loadedScripts.has(src)) {
      // console.log('ScriptInjectorService already loaded:', src);
      this.loaded.set(true);
      return;
    }
    this.#appendScript(src)
      .catch((rejected) => {
        console.log('rejected:', src, rejected);
      })
      .then((resolved) => {
        // console.log('resolved:', src, resolved);
        this.#loadedScripts.add(src);
        this.loaded.set(true);
      });
  }

}
