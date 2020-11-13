import { html, render } from 'lit-html';

export default function fixture(testHtml, removeLast = true) {
    const fixclass = "__fix";
    const { body } = document;

    if (removeLast) {
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