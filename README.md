# [lit-funce] lit-html Functional Custom Elements

A <sub>funky but not too funcy</sub> helper for writing functional web components using [lit-html](https://lit-html.polymer-project.org/).

## Installation
```
yarn add lit-html
yarn add lit-funce
```
Or optionally `npm install lit-{html, funce}`.  
There is a peer dependency to lit-html.


## Usage

Define a web component in functional style...
```javascript
// abutton.js
import { funce, html } from 'lit-funce';

// register web component, declare observed attributes
funce("a-button", ['color'], aButton);

// host is an instance of a standard HTMLElement subclass
// init is same as host but is only injected once (think connectedCallback)
// `host.props(obj: {[string]: other})` assigns given props to the host element
function aButton({ clicked, clicks, color, init, props }) {
   
    const style = { backgroundColor: color };

    const label = !clicks ? 
        "please click" : 
        `thank you ${clicks > 1 && `* ${clicks}` || ''}`;
  
    init?.props({
        clicks: 0,
        clicked: () => {
            clicks++;
            props({clicks}); 
        }
    });

    return html`
        <button @click=${host.clicked} style=${style}>${label}</button>
    `;
}

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


## Init and Dispose

Logic for `connectedCallback` and `disconnectedCallback` can be expressed using the `init` and `dispose` methods of the host.
The idiom `init?.*` can be used to invoke a method exclusively in the setup phase (think `connectedCallback`).

### Clock example

<iframe src="https://ghcdn.rawgit.org/griezma/lit-funce/main/demo/clock.html" width="240" height="100" title="Clock Demo"></iframe>

```html
<html>
    <script type="module">
        import { funce, html } from "../lit-funce.js";

        const millis = () => (Date.now() % 1000).toString().padStart(3, '0');

        funce("c-lock", ["interval"], clock);
        function clock({ init, interval, render }) {
            // call init?.props(p: object) to update or extend host properties;
            // an object result of a function is applied to `props` as well
            init?.props({
                timeout: setInterval(render, interval),
                stop: ({ timeout }) => ({ timeout: clearInterval(timeout) }),
                start: ({ interval }) => ({ timeout: setInterval(render, interval) })
            });
            // call init?.dispose(fn: (host) => any) to hook a dispose function (think disconnnectedCallback) 
            init?.dispose(({ timeout }) => clearInterval(timeout));

            return html`${new Date().toLocaleTimeString()}.${millis()}`;
        }
    </script>

    <c-lock interval="1">Toggle</c-lock>

    <div>
        <button onclick="document.querySelector('c-lock').start()">Start</Button>
        <button onclick="document.querySelector('c-lock').stop()">Stop</Button>
    </div>
</html>
```



