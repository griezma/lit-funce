import { html, render, TemplateResult } from './lib/lit-html.js';
import { styleMap } from './lib/lit-html/directives/style-map.js';
export { funce, defineElement, html, render, styleMap, HostElement };
interface HostElement extends HTMLElement {
    render(): void;
}
declare type RenderFunction = (host: HostElement) => TemplateResult;
interface Options {
    shadow: boolean;
    throttled: number;
    debug: boolean;
}
declare function funce(tag: string, renderFn: RenderFunction, options?: Options): any;
declare function funce(tag: string, props: string[], renderFn: RenderFunction, options?: Options): any;
declare function defineElement(tag: string, props: string[], renderFn: RenderFunction, options?: Options): void;
