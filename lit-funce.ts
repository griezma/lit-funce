import { html, render, TemplateResult } from 'lit-html';

import throttle from './lib/justthrottle';
import { propsMetaData, PropDefs } from './lib/propsmeta'

export { defineElement, html, render, HostElement };

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

function defineElement(
  tag: string,
  renderFn: RenderFunction,
  props: PropDefs = [],
  options:  Options = defaultOptions) {

  const { shadow, throttled } = options;

  let propsMeta = propsMetaData(tag, props);

  class ElWrapper extends HTMLElement {

    static get observedAttributes(): string[] {
      return propsMeta.getProps();
    }

    constructor(public root, private _litRender, public init) {
      super()
     //console.log("constructor", tag);
      if (shadow) {
        this.root = this.attachShadow({mode: 'open'});
      } else {
        this.root = this;
      }

      this._litRender = render;

      this.init = this;
      this.render();
      this.init = null;

      if (throttled > 0) {
        this._litRender = throttle(render, throttled);
      }
    }

    connectedCallback() {
     //console.log("connectedCallback", tag);
      this.render();
    }

    attributeChangedCallback(name: string, old: string, value: string) {
    //  console.log("changed", {name, old, value});
      
      if (old !== value) {
        this[name] = propsMeta.convertValue(name, value, this.init);      
        this.render();
      }
    }

    render = () => {
     //console.log("render", tag, {init: !!this.init});
      this._litRender(renderFn(this), this.root);
    }
  };

  customElements.define(tag, ElWrapper);
}
