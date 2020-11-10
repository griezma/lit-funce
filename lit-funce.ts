import { html, render, TemplateResult } from 'lit-html';

import throttle from './lib/simpleThrottle';

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

const ident = val => val;
const toNum = val => +val;

function findConverter(type): ConverterFn {
  switch (type) {
    case "string": return ident;
    case "number": return toNum;
    case "boolean": return Boolean;
  }
  console.warn("could not find converter", {type});
  return ident;
}

function derivePropMeta(propdef) {
  let type;
  let value;
  let converterfn = ident;

  const typeofDef = typeof propdef;

  const basicTypes =  ["string", "number", "boolean"];

  if (typeofDef === "string" && basicTypes.includes(propdef)) {
    type = propdef;
    converterfn = findConverter(type);
    value = converterfn ? converterfn('') : '';
  }
  else if (basicTypes.includes(typeofDef)) {
    type = typeofDef;
    converterfn = findConverter(type);
    value = propdef;
  } 
  else if (typeofDef === "function") {
    type = typeofDef;
    converterfn = propdef;
  } 
  else {
    type = typeofDef;
    value = propdef;
  }
  return { type, value, converterfn };
}

function guessValType(val: string): string {
  if (!isNaN(+val)) {
    return "number";
  }
  if (["true", "false"].includes(val)) {
    return "boolean";
  }
  if (val.startsWith('{')) {
    return "json";
  }
  return "string";
}

function derivePropMetaMap(props: string[], propDefs): ConverterMap {
  const propInfoMap = props.reduce(
    (map, prop) => {
      map[prop] = derivePropMeta(propDefs[prop]);
      return map
    }, {});
    return propInfoMap;
}

type PropDefs = { [prop: string]: unknown } | string[];

function propsMetaData(tag, propDefs: PropDefs = []) {
  let propNames;
  let propMetaMap: { type?, value?, convertfn? } = {};

  if (Array.isArray(propDefs)) {
    propNames = propDefs as string[];
  } else {
    registerProps(propDefs);
  }

  function registerProps(propDefs) {
    const keys = Object.keys(propDefs);
    propNames = keys;
    propMetaMap = derivePropMetaMap(keys, propDefs);
  }

  function getPropMeta(prop): { type: string, value: unknown, converterfn: (string)=>unknown } {
    return propMetaMap[prop] || {};
  }

  function convertValue(prop, value, init = false) {
    const meta = propMetaMap[prop];
    console.log("convert", tag, {prop, value, init, meta});
    if (meta) {
      const { converterfn } = meta;
      return converterfn ? converterfn(value) : value;
    } else if (init) {
      const type = guessValType(value);
      const converter = type && findConverter(type);
      console.log("convertValue", tag, {value, type, converter});
      return converter ? converter(value) : value;
    }
    return value;
  }

  function getDefault(prop: string) {
   //console.log("getDefault", tag);
    return propMetaMap[prop]?.value;
  }

  function getProps() {
    return propNames;
  }

  return {
    getProps,
    getDefault,
    convertValue,
    registerProps
  }
}

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
