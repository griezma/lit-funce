import { defineElement, html } from '/lit-funce.js';

const style = host => `
  font-weight: 700;
  min-width: 16em; 
  height: 4em; 
  border: none;
  background-color: ${host.color};
  color: white;
`;

const propTypes = {
  color: "string",
  clicks: "number"
};

function when(cond, out) {
  return cond ? out : '';
}

function ElButton(el) {

  const clicked = ev => {
    el.clicks++;
    el.render();
  }

  const { clicks, color } = el;

  const label = !clicks ? 
    "please click" : 
    `thank you ${when(clicks > 1, `${clicks} times`)}`;

  return html`
    <button @click=${clicked} style=${style(el)}>${label}</button>
  `;
}

defineElement("el-button", ElButton, propTypes);