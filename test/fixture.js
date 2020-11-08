import { html, render } from 'lit-html';

let currentID = 1;

function nextID() {
    return (++currentID).toString()
} 

export default function fixture(testHtml) {
    const id = nextID()
    render(html`<div id=${id}>${testHtml}</div>`, document.body);
    return document.getElementById(id).firstElementChild;
}