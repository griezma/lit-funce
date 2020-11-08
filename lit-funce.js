import { html, render } from 'lit-html';
export { defineElement, html, render };
const props = { a: "string" };
converterFn("a", props);
function converterFn(prop, propTypes) {
    const conversion = propTypes[prop];
    const conversionType = typeof conversion;
    if (conversionType === "string") {
        switch (conversion) {
            case 'string': return v => v || '';
            case 'number': return v => v ? parseInt(v) : 0;
            case 'boolean': return v => Boolean(v);
            default: throw new Error(`invalid conversion type '${conversion}'`);
        }
    }
    else if (conversionType === "function") {
        return conversion;
    }
    return v => v;
}
const defaultOptions = {
    shadow: true
};
function defineElement(tag, renderFn, propTypes, { shadow } = defaultOptions) {
    const propKeys = propTypes ? Object.keys(propTypes) : [];
    const converterMap = propKeys.reduce((map, prop) => {
        map[prop] = converterFn(prop, propTypes);
        return map;
    }, {});
    class WrapperClass extends HTMLElement {
        constructor(root) {
            super();
            this.root = root;
            if (shadow) {
                this.root = this.attachShadow({ mode: 'open' });
            }
            else {
                this.root = this;
            }
            propKeys.forEach(name => this[name] = converterMap[name](null));
        }
        static get observedAttributes() {
            return propKeys;
        }
        connectedCallback() {
            this.render();
        }
        attributeChangedCallback(name, old, value) {
            if (old !== value) {
                this[name] = converterMap[name](value);
                this.render();
            }
        }
        render() {
            return render(renderFn(this), this.root);
        }
    }
    ;
    customElements.define(tag, WrapperClass);
}
//# sourceMappingURL=lit-funce.js.map