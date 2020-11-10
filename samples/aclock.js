import { defineElement, html } from '../lit-funce.js';

function aClock(el) {

    if (el.init) {
        el._timer = setInterval(el.render, 1);
    }

    return html`
        <span>${new Date().toISOString()}</span>
    `;
}

defineElement("a-clock", aClock, "interval", {throttled: 23});