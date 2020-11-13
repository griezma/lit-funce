import { html, render, TemplateResult } from 'lit-html';
import throttlefn from './lib/throttle';

export { 
  funce,
  defineElement, 
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
  throttle: number
}

const defaultOptions = {
  shadow: true,
  throttle: 23
}

function funce(tag: string, renderFn: RenderFunction, options?: Options);

function funce(tag: string, props: string[], renderFn: RenderFunction, options?: Options);

function funce(tag: string, ...rest) {
    let renderFn;
    let props: string[] = [];
    let options: Options = defaultOptions;

    for (const arg of rest) {
      if (Array.isArray(arg)) {
        props = arg as string[];
      } else if (typeof arg === "function") {
        renderFn = arg as RenderFunction;
      } else {
        options = {...options, ...arg};
      }
    }
  
    defineElement(tag, props, renderFn, options);
}

function defineElement(
  tag: string,
  props: string[],
  renderFn: RenderFunction,
  options: Options = defaultOptions) {

  // console.log("defineElement", tag, {props, options});
  
  const { shadow, throttle: throttleMs } = options;
    
  class ElWrapper extends HTMLElement {

    static get observedAttributes(): string[] {
      return props;
    }

    constructor(public root, public init, private _litRender, private _renderFn) {
      super()
      // console.log("constructor", tag, {shadow, throttle: throttleMs});
      if (shadow) {
        this.root = this.attachShadow({ mode: 'open' });
      } else {
        this.root = this;
      }
      this._litRender = render;
      this._renderFn = renderFn.bind(this);
    }

    connectedCallback() {
      // console.log("connectedCallback", tag);
      // text content not yet ready in constructor
      this.init = this;
      this.render();
      this.init = null;

      this.throttle(throttleMs);
      this.render();
    }

    attributeChangedCallback(name: string, old: string, value: string) {
    // console.log("changed", {name, old, value});
      if (old !== value) {
        this[name] = guessedConversion(value);      
        this.render();
      }
    }

    throttle(timeMs: number) {
      if (timeMs === 0) {
        this._litRender = render;
      } else {
        this._litRender = throttlefn(render, timeMs);
      }
    }

    get childText() {
      // Note: differs from this.root.childNodes
      for (const node of this.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.nodeValue.trim();
        }
      }
    }

    get rootChild() {
      return this.root.firstElementChild;
    }

    get isShady(): boolean {
      return this.root !== this;
    }

    shadow(request: (boolean | 'toggle') = true) {
      // console.log("shadow", {shadowOn: request});
      if (request === 'toggle') {
        this.shadow(!this.isShady);
      } else if (request !== this.isShady) {
        const oldRoot = this.root;
        this.root = request ? this.attachShadow({ mode: 'open' }) : this;
        this.root.append(oldRoot.firstElementChild);
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

    dump(context: string = tag) {
      const props = {};
      const names = Object.getOwnPropertyNames(this);
      names.filter(p => typeof this[p] !== 'function')
        .forEach(p => props[p] = this[p]);

      console.log("dump", context, {
        self: this,
        shady: this.isShady,
        throttle: throttleMs, 
        props,
        childText: this.childText,
        rootChild: this.rootChild,
        childnodes: this.childNodes, 
        root: this.root, 
        rootChildNodes: this.root.childNodes});
    }

    render = () => {
      // console.log("render", tag, {init: !!this.init});
      const {_litRender, _renderFn } = this;
      _litRender(_renderFn(this), this.root);
    }
  };

  customElements.define(tag, ElWrapper);
}

function guessedConversion(val: string): unknown {
  //console.log("convertByValue", {val});
  
  if (!isNaN(+val)) {
    return +val;
  }
  if (["true", "false"].includes(val)) {
    return Boolean(val);
  }
  return val;
}

