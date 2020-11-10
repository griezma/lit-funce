import { defineElement, html } from '../lit-funce.js';

const props = { 
    interval: "string",
    
}

function aClock(el) {
    el.init?.props(props);

    if (el._timer === undefined) {
        el._timer = setInterval(el.render, 1);
    }

    return html`
        <span>${new Date().toISOString()}</span>
    `;
}

defineElement("a-clock", aClock, {throttled: 23});