# [lit-funce] lit-html Functional Custom Elements

A <sub>funky, not too funcy</sub> helper for writing functional web components using [lit-html](https://lit-html.polymer-project.org/).

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

// The custom element is defined by the render function. 
// The function gets invoked on every update with the 'host' argument.
// Host is an instance of HTMLElement extended by custom attributes (passed in "funce()") and properties (passed in "Host.props()").
// Here 'init' and 'props' are host methods (see below), 'color' is an observed attribute, 'clicks' is a custom property (see init.props... below)
 function aButton({ clicks, color, init, props }) {
    
    const style = clicks ? `border-color:${color}; color:${color}` : '';

    const label = !clicks ?
        "please click" :
        `thank you ${clicks > 1 && `x ${clicks}` || ''}`;

    // 'init' is the same instance as 'host' but it is only injected on the first invocation (think connectedCallback)
    // The idiom "init?.foo" can be used to do something only once on first invocation.
    // Here the host gets extended by a new property 'clicks'
    init?.props({
        clicks: 0,
    });

    // The 'props' method can be used to define or update properties on the host
    // Here props is used to update he clicks property value on the host.
    function clicked() {
        return props({clicks: ++clicks});
    }

    // lit-html is used to render the result. The function must return a valid lit-html template result.
    // Here the lit-html @event directive is used to bind the click handler.
    return html`<button @click=${clicked} style=${style}>${label}</button>`;
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

[See demo...](https://griezma.github.io/lit-funce/demo/button.html)


## Init and Dispose

Logic for `connectedCallback` and `disconnectedCallback` can be expressed using the `init` and `dispose` methods of the host.
The idiom `init?.*` can be used to invoke a method exclusively in the setup phase (think `connectedCallback`).


### Clock example

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

        window.$ = document.querySelector.bind(document);
    </script>

    <c-lock interval="1">Toggle</c-lock>

    <div>
        <button onclick="$('c-lock').start()">Start</Button>
        <button onclick="$('c-lock').stop()">Stop</Button>
    </div>
</html>
```

[See demo...](https://griezma.github.io/lit-funce/samples/index.html)

