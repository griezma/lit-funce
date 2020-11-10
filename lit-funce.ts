import { html, render, TemplateResult } from 'lit-html';

import throttle from './lib/simpleThrottle';
import { propsMetaData, PropDefs } from './lib/propsmeta'

export { defineElement, html, render, HostElement };

// just do be more specific
interface HostElement extends HTMLElement {
  render(): void;
}

type RenderFunction = (host: HostElement) => TemplateResult;

type PropTypes = {[property: string]: string | ConverterFn};
type ConverterFn = (prop: string) => unknown;
type ValueConversion = string | ConverterFn;

type ConverterMap = { [propName: string]: ConverterFn };


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
  options:  Options = defaultOptions) { // PropTypes and or Options

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

      this.init = { props: this._initProps };
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
     console.log("changed", {name, old, value});
      
      if (old !== value) {
        this[name] = propsMeta.convertValue(name, value, old === null);        
        this.render();
      }
    }

    render = () => {
     //console.log("render", tag, {init: !!this.init});
      this._litRender(renderFn(this), this.root);
    }

    _initProps = (propDefs: PropDefs) => {
     //console.log("_initProps", tag);
      propsMeta.registerProps(propDefs);

      const attr = this.getAttribute.bind(this);
      const defoult = propsMeta.getDefault;
      propsMeta.getProps()
        .forEach(prop => {
          this[prop] = attr(prop) || defoult(prop);
        });
    }
  };

  customElements.define(tag, ElWrapper);
}
