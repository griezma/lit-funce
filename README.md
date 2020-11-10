# [lit-funce] lit-html Functional Custom Elements

A <sub>funky but not too funcy</sub> helper for writing functional web components using [lit-html](https://lit-html.polymer-project.org/).

## Installation
```
yarn add lit-html
yarn add lit-funcel
```
Or optionally `npm install lit-...`.  
Notice the peer dependency to lit-html.


## Usage

Define a web component in functional style...
```javascript
// abutton.js
import { defineElement, html } from 'lit-funce';

// declare props with conversions; 'string'|'number'|'boolean'|(string)=>unknown
const props = { color: 'string' }

// host is a standard HTMLElement subclass
function aButton(host) {
    let { clicked, clicks, color } = host;

    const style = { backgroundColor: color };

    const label = !clicks ? 
        "please click" : 
        `thank you ${clicks > 1 && `* ${clicks}` || ''}`;
  
    if (!clicked) {
        host.clicks = 0;
        clicked = () => {
            host.clicks++;
            host.render();
        }
        host.clicked = clicked;
    }

    return html`
        <button @click=${clicked} style=${style}>${label}</button>
    `;
}
// register web component, declare properties
defineElement("a-button", aButton, props);
```

...and use it
```html
<!DOCTYPE html>
<html>
    <script type="module">
        import "./abutton.js"
    </script>

    <a-button color="blue"></a-button>
</html>
```
