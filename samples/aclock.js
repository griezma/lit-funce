import { defineElement, html } from '../lit-funce.js';

const props = {
    interval: "number"
}

function aClock(el) {
    if (el._timer === undefined) {
        el._timer = setInterval(el.render, 1);
    }

    return html`
        <span>${new Date().toISOString()}</span>
    `;
}

defineElement("a-clock", aClock, props, {throttled: 23});