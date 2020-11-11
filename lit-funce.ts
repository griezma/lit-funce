import { html, render, TemplateResult } from 'lit-html';
import throttle from './lib/throttle';

export { 
  funce, 
  funce as defineElement, 
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

function funce(
  tag: string,
  renderFn: RenderFunction,
  ...rest) {
   
  let [ props, options] = parseLastArgs(rest);
  const { shadow, throttled } = options;
    
  class ElWrapper extends HTMLElement {

    static get observedAttributes(): string[] {
      return props;
    }

    constructor(public root, private _litRender, public init) {
      super()
      console.log("constructor", tag);
      if (shadow) {
        this.root = this.attachShadow({mode: 'open'});
      } else {
        this.root = this;
      }
      this._litRender = render;
    }

    connectedCallback() {
      console.log("connectedCallback", tag);
      this.init = this;
      this.render();
      this.init = null;

      if (throttled > 0) {
        this._litRender = throttle(render, throttled);
      }
      this.render();
    }

    attributeChangedCallback(name: string, old: string, value: string) {
    //  console.log("changed", {name, old, value});
      if (old !== value) {
        this[name] = convertByValue(value);      
        this.render();
      }
    }

    props(props) {
      for (let name of Object.keys(props)) {
        const val = props[name];
        this[name] = val;
        if (typeof val === 'function') {
          val.bind(this);
        }
      }
    }

    render = () => {
     //console.log("render", tag, {init: !!this.init});
      this._litRender(renderFn(this), this.root);
    }
  };

  customElements.define(tag, ElWrapper);
}

function parseLastArgs(args): [string[], Options] {
  let props: string[] = [];
  let options: Options = defaultOptions;

  if (args.length === 2) {
    [props, options] = args;
  } else if (args.length === 1) {
    const arg = args[0]; 
    if (Array.isArray(arg)) {
      props = arg;
    } else {
      options = arg;
    }
  }
  return [props, options];
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
