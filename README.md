# [lit-funce] lit-html Functional Custom Elements

Write functional web components using lit-html.

## Usage

Define a web component in functional style...
```javascript
// abutton.js
import { defineElement, html } from 'lit-funce';

// declare props with conversions; 'string'|'number'|'boolean'|(string)=>unknown
const props = { color: 'string', clicks: 'number' }

// host is a standard HTMLElement subclass
function aButton(host) {
    const { color, clicks } = host;

    const style = `background-color:${color};`;
    const label = clicks ? 'please click' : `thank you (${clicks})`;
    
    const clicked = () => {
        host.clicks++;
        host.render();
    }
    
    return html`
        <button @click=${clicked} style=${style}>${label}</button>
    `;
}
// register web component, declare properties
defineElement("a-button", aButton, props);
```

...and use it.
```html
<!DOCTYPE html>
<html>
    <script type="module">
        import "abutton.js"
    </script>

    <a-button color="blue"></a-button>
</html>
```
