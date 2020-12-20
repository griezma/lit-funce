import { html, render } from './lib/lit-html.js';
import throttle from './lib/throttle.js';
export { funce, defineElement, html, render };
const defaultOptions = {
    shadow: true,
    throttled: 23,
    debug: false
};
function funce(tag, ...rest) {
    let renderFn;
    let props = [];
    let options = defaultOptions;
    for (const arg of rest) {
        if (Array.isArray(arg)) {
            props = arg;
        }
        else if (typeof arg === "function") {
            renderFn = arg;
        }
        else {
            options = Object.assign(Object.assign({}, options), arg);
        }
    }
    defineElement(tag, props, renderFn, options);
}
const nop_log = Object.assign(Object.assign({}, console), { log: () => { } });
function defineElement(tag, props, renderFn, options = defaultOptions) {
    const { shadow, throttled: throttleMs, debug } = options;
    const logger = debug ? console : nop_log;
    logger.log("defineElement", tag, { props, options });
    class ElWrapper extends HTMLElement {
        constructor(root, _litRender) {
            super();
            this.root = root;
            this._litRender = _litRender;
            this.props = props => {
                logger.log("props", tag, props, { context: this.constructor.name });
                let changeCount = 0;
                for (let name in props) {
                    const old = this[name];
                    const val = props[name];
                    if (typeof val === 'function') {
                        this[name] = wrapPropFn(val, this, logger);
                    }
                    else if (old !== val) {
                        changeCount++;
                        this[name] = val;
                    }
                }
                if (changeCount > 0 && !this.init) {
                    this.render();
                }
            };
            this.dispose = (task) => {
                const old = this._disposeTask;
                this._disposeTask = task;
                return old;
            };
            this.dump = (context = tag) => {
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
            };
            this.render = () => {
                //logger.log("render", tag, {init: !!this.init});
                this._litRender(renderFn(this), this.root);
            };
            logger.log("constructor", tag, options);
            if (shadow) {
                this.root = this.attachShadow({ mode: 'open' });
            }
            else {
                this.root = this;
            }
            this._litRender = render;
        }
        static get observedAttributes() {
            return props;
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
        attributeChangedCallback(name, old, value) {
            logger.log("changed", { name, old, value });
            if (old !== value) {
                this[name] = convertByValue(value);
                this.render();
            }
        }
        adoptedCallback() {
            console.log("adopted", tag);
        }
        throttled(timeMs) {
            logger.log("throttled", timeMs);
            if (timeMs === 0) {
                this._litRender = render;
            }
            else {
                this._litRender = throttle(render, timeMs);
            }
        }
        get host() {
            return this;
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
    }
    ;
    customElements.define(tag, ElWrapper);
}
function convertByValue(val) {
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
    };
}
//# sourceMappingURL=lit-funce.js.map