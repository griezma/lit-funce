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
import { defel, html } from 'lit-funce';

// host is an instance of a standard HTMLElement subclass
// init is same as host but is only injected once (think connectedCallback)
// `host.props(obj: {[string]: other})` assigns given props to the host element
function aButton(host) {
    let { clicked, clicks, color, init } = host;

    const style = { backgroundColor: color };

    const label = !clicks ? 
        "please click" : 
        `thank you ${clicks > 1 && `* ${clicks}` || ''}`;
  
    init?.props({
        clicks: 0,
        clicked: () => {
            host.clicks++;
            host.render(); 
        }
    });

    return html`
        <button @click=${host.clicked} style=${style}>${label}</button>
    `;
}
// register web component, declare observed attributes
defel("a-button", ['color'], aButton);
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
