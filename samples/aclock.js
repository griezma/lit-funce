import { funce, html } from '../lit-funce.js';

function aClock({ init, interval }) {
    init?.props({
        _timer: setInterval(init.render, interval)
    });
    return html`
        <span>${new Date().toISOString()}</span>
    `;
}

funce("a-clock", aClock, ['interval'], {throttled: 23});