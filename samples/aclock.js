import { funce, html } from '../lit-funce.js';

function aClock({ init, interval, props, render, timer, toggle }) {
    init?.props({
        timer: setInterval(render, interval)
    });

    function toggle() {
        if (timer) {
            clearInterval(timer);
            props({timer: null});
        } else {
            const timer = setInterval(render, interval);
            props({timer});
        }
    }
    
    return html`
        <span>${new Date().toISOString()}</span>
        <div><button @click=${toggle}>Toggle timer</button></div>
    `;
}

funce("a-clock", ['interval'], aClock, {throttled: 23});