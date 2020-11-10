import { defineElement, html } from '../lit-funce.js';
import {styleMap} from 'lit-html/directives/style-map.js';

const buttonStyles = {
  border: "none",
  fontWeight: "bold",
  color: "var(--button-color)",
  padding: "16px",
  minWidth: "10em"
};

function aButton(el) {

  let { clicked, clicks, color } = el;

  if (!clicked) {
    el.clicks = 0;
    clicked = () => {
      el.clicks++;
      el.render();
    }
    el.clicked = clicked;
  }

  const styles = {...buttonStyles, backgroundColor: color};

  const label = !clicks ? 
    "please click" : 
    `thank you ${clicks > 1 && `* ${clicks}` || ''}`;
  
  return html`
    <button @click=${clicked} style=${styleMap(styles)}>${label}</button>
  `;
}

defineElement("a-button", aButton, ['color']);