import { defineElement, html } from '../lit-funce.js';

const props = {
    interval: "number"
}

function aClock(el) {
    if (el._timer === undefined) {
        const interval = el.interval || 15;
        el._timer = setInterval(el.render, interval);
    }

    return html`
        <span>${new Date().toISOString()}</span>
    `;
}

defineElement("a-clock", aClock, props);