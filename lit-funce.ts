import { html, render, TemplateResult } from 'lit-html';
import throttle from './lib/throttle';

export { 
  defel,
  defineElement, 
  defineElement as funce, 
  html,
  render, 
  HostElement };

// just do be more specific
interface HostElement extends HTMLElement {
  render(): void;
}

type RenderFunction = (host: HostElement) => TemplateResult;

interface Options {
  shadow: boolean,
  throttled: number
}

const defaultOptions = {
  shadow: true,
  throttled: 23
}

function defel(tag: string, renderFn: RenderFunction, options?: Options);

function defel(tag: string, props: string[], renderFn: RenderFunction, options?: Options);

function defel(tag: string, ...rest) {
    let renderFn;
    let props: string[] = [];
    let options: Options = defaultOptions;

    for (let arg of rest) {
      if (Array.isArray(arg)) {
        props = arg as string[];
      } else if (typeof arg === "function") {
        renderFn = arg as RenderFunction;
      } else {
        options = arg;
      }
    }
  
    defineElement(tag, props, renderFn, options);
}

function defineElement(
  tag: string,
  props: string[],
  renderFn: RenderFunction,
  options: Options = defaultOptions) {
   
  const { shadow, throttled } = options;
    
  class ElWrapper extends HTMLElement {

    static get observedAttributes(): string[] {
      return props;
    }

    constructor(public root, public init, public initText, private _litRender, private _renderFn) {
      super()
      //console.log("constructor", tag);
      if (shadow) {
        this.root = this.attachShadow({mode: 'open'});
      } else {
        this.root = this;
      }
      this._litRender = render;
      this._renderFn = renderFn.bind(this);
    }

    connectedCallback() {
      // console.log("connectedCallback", tag);
      // text content not yet ready in constructor
      this.initText = this.textContent?.trim();

      this.init = this;
      this.render();
      this.init = null;

      if (throttled > 0) {
        this._litRender = throttle(render, throttled);
      }
      this.render();
    }

    attributeChangedCallback(name: string, old: string, value: string) {
    //console.log("changed", {name, old, value});
      if (old !== value) {
        this[name] = convertByValue(value);      
        this.render();
      }
    }

    props = (props) => {
      let changeCount = 0;
      
      for (let name in props) {
        const old = this[name];
        const val = props[name];

        if (typeof val === 'function') {
          this[name] = val.bind(this);
        } else if (old !== val) {
          changeCount++;
          this[name] = val;
        }
      }
      if (changeCount > 0 && !this.init) {
        this.render();
      }
    }

    render = () => {
      // console.log("render", tag, {init: !!this.init});
      const {_litRender, _renderFn } = this;
      _litRender(_renderFn(this), this.root);
    }
  };

  customElements.define(tag, ElWrapper);
}

function convertByValue(val: string): unknown {
  //console.log("convertByValue", {val});
  
  if (!isNaN(+val)) {
    return +val;
  }
  if (["true", "false"].includes(val)) {
    return Boolean(val);
  }
  return val;
}
