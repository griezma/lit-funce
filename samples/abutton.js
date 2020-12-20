import { funce, html, styleMap } from '../lit-funce.js';

const buttonStyles = {
  border: "none",
  fontWeight: "bold",
  color: "var(--button-color)",
  padding: "16px",
  minWidth: "10em"
};

function aButton({ clicks, color, init, label, props, thanks }) {
  init?.props({
    clicks: 0,
    label: init.innerHTML,
  })

  const styles = {...buttonStyles, backgroundColor: color};

  function clicked() {
    ++clicks;
    props({ 
      clicks,
      label: `${thanks} ${clicks > 1 && `* ${clicks}` || ''}`
    });
  }

  return html`
    <button @click=${clicked} style=${styleMap(styles)}>${label}</button>
  `;
}

funce("a-button", ['color', 'thanks'], aButton);