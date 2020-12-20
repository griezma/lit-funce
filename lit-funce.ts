import { html, render, TemplateResult } from './lib/lit-html.js';
import throttle from './lib/throttle.js';

export {
  funce,
  defineElement,
  html,
  render,
  HostElement
};

// just do be more specific
interface HostElement extends HTMLElement {
  render(): void;
}

type RenderFunction = (host: HostElement) => TemplateResult;

interface Options {
  shadow: boolean,
  throttled: number,
  debug: boolean
}

const defaultOptions = {
  shadow: true,
  throttled: 23,
  debug: false
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
      options = { ...options, ...arg };
    }
  }

  defineElement(tag, props, renderFn, options);
}

const nop_log = { ...console, log: () => {}};

function defineElement(
  tag: string,
  props: string[],
  renderFn: RenderFunction,
  options: Options = defaultOptions) {
  
  const { shadow, throttled: throttleMs, debug } = options;
    
  const logger: Console = debug ? console : nop_log;
  
  logger.log("defineElement", tag, {props, options});

  class ElWrapper extends HTMLElement {

    static get observedAttributes(): string[] {
      return props;
    }

    public init: ElWrapper;
    private _disposeTask: Function;
  
    constructor(public root: ShadowRoot | ElWrapper, private _litRender: Function) {
      super()
      logger.log("constructor", tag, options);
      if (shadow) {
        this.root = this.attachShadow({ mode: 'open' });
      } else {
        this.root = this;
      }
      this._litRender = render;
    }

    connectedCallback() {
      logger.log("connectedCallback", tag);
      // text content not yet ready in constructor
      this.init = this;
      this.render();
      this.init = null;

      this.throttled(throttleMs);
      this.render();
    }

    disconnectedCallback() {
      logger.log("disconnectedCallback", tag, "dispose", !!(this._disposeTask));
      if (this._disposeTask) {
        logger.log("disposing");
        this._disposeTask(this);
      }
    }

    attributeChangedCallback(name: string, old: string, value: string) {
      logger.log("changed", {name, old, value});
      if (old !== value) {
        this[name] = convertByValue(value);
        this.render();
      }
    }

    adoptedCallback() {
      console.log("adopted", tag);
    }

    throttled(timeMs: number) {
      logger.log("throttled", timeMs);
      if (timeMs === 0) {
        this._litRender = render;
      } else {
        this._litRender = throttle(render, timeMs);
      }
    }

    get host(): ElWrapper {
      return this;
    }

    get childText(): string {
      // Note: differs from this.root.childNodes
      for (const node of this.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.nodeValue.trim();
        }
      }
    }

    get rootChild(): Element {
      return this.root.firstElementChild;
    }

    props = props => {
      logger.log("props", tag, props, { context: this.constructor.name });
      let changeCount = 0;

      for (let name in props) {
        const old = this[name];
        const val = props[name];

        if (typeof val === 'function') {
          this[name] = wrapPropFn(val, this, logger);
        } else if (old !== val) {
          changeCount++;
          this[name] = val;
        }
      }
      if (changeCount > 0 && !this.init) {
        this.render();
      }
    }

    dispose = (task: Function) => {
      const old = this._disposeTask;
      this._disposeTask = task;
      return old;
    }

    dump = (context: string = tag) => {
      const props = {};

      Object.getOwnPropertyNames(this)
        .filter(p => typeof this[p] !== 'function')
        .forEach(p => props[p] = this[p]);

      logger.info("dump", context, {
        host: this,
        shadow: !!this.shadowRoot,
        throttled: throttleMs,
        props,
        childText: this.childText,
        root: this.root,
        rootChild: this.rootChild
      });
    }

    render = () => {
      //logger.log("render", tag, {init: !!this.init});
      this._litRender(renderFn(this), this.root);
    }
  };

  customElements.define(tag, ElWrapper);
}

function convertByValue(val: string): unknown {
  //out.log("convertByValue", {val});

  if (!isNaN(+val)) {
    return +val;
  }
  if (["true", "false"].includes(val)) {
    return Boolean(val);
  }
  return val;
}

function wrapPropFn(fn, host, logger) {
  return () => {
    const res = fn.call(null, host);
    logger.log("wrapPropFn", fn, "props", res);
    if (res && typeof res === "object") {
      host.props(res);
    }
  }
}
