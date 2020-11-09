import { html, render, TemplateResult } from 'lit-html';

import throttle from './lib/simpleThrottle';

export { defineElement, html, render, HostElement };

// just do be more specific
interface HostElement extends HTMLElement {
  render(): void;
}

type RenderFunction = (host: HostElement) => TemplateResult;

type ConverterFn = (prop: string) => unknown;
type ValueConversion = string | ConverterFn;

type PropTypes = {[property: string]: string | ConverterFn}

const props = {a: "string" }
converterFn("a", props);

function converterFn(prop: string, propTypes: PropTypes): ConverterFn {
  const conversion: ValueConversion = propTypes[prop];
  const conversionType = typeof conversion;

  if (conversionType === "string") {
    switch (conversion) {
      case 'string': return v => v || '';
      case 'number': return v => v ? parseInt(v) : 0;
      case 'boolean': return v => Boolean(v);
      default: throw new Error(`invalid conversion type '${conversion}'`);
    }
  } else if (conversionType === "function") {
    return conversion as ConverterFn;
  }
  return v => v;
}

interface Options {
  shadow: boolean,
  throttled: number
}

const defaultOptions = {
  shadow: true,
  throttled: 20
}

function defineElement(
  tag: string,
  renderFn: RenderFunction,
  propTypes: PropTypes,
  { shadow, throttled }: Options = defaultOptions
) {
  const propKeys = propTypes ? Object.keys(propTypes) : [];
  const converterMap = propKeys.reduce(
    (map, prop) => {
      map[prop] = converterFn(prop, propTypes);
      return map
    }, {});

  class WrapperClass extends HTMLElement {

    static get observedAttributes() {
      return propKeys;
    }

    constructor(public readonly root, private litRender) {
      super()
      if (shadow) {
        this.root = this.attachShadow({mode: 'open'});
      } else {
        this.root = this;
      }
      propKeys.forEach(name => this[name] = converterMap[name](null));

      this.litRender = throttled > 0 ? throttle(render, throttled) : render;
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback(name: string, old: string, value: string) {
      if (old !== value) {
        this[name] = converterMap[name](value);        
        this.render();
      }
    }

    render = () => this.litRender(renderFn(this), this.root);
  };

  customElements.define(tag, WrapperClass);
}
