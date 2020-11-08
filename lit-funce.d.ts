import { html, render, TemplateResult } from 'lit-html';
export { defineElement, html, render, HostElement };
interface HostElement extends HTMLElement {
    render(): void;
}
declare type RenderFunction = (host: HostElement) => TemplateResult;
declare type ConverterFn = (prop: string) => unknown;
declare type PropTypes = {
    [property: string]: string | ConverterFn;
};
interface Options {
    shadow: boolean;
}
declare function defineElement(tag: string, renderFn: RenderFunction, propTypes: PropTypes, { shadow }?: Options): void;
