import { html, render } from '/lib/lit-html.js';

export default function fixture(testHtml, removePrior = true) {
    const fixclass = "__fix";
    const { body } = document;

    if (removePrior) {
        const last = body.querySelector('.' + fixclass);
        if (last) {
            body.removeChild(last);
        }
    }

    const div = document.createElement("div");
    div.className = fixclass;
    body.appendChild(div);
    render(html`${testHtml}`, div);
    return div.firstElementChild;
}