import { assert, expect } from "@esm-bundle/chai/esm/chai.js";
import { funce, html } from "/lit-funce.js";
import fixture from "./fixture.js";

const wait = async (ms) => new Promise(res => setTimeout(res, ms));

function AButton({ clicks, color, init, label, props }) {
    init?.props({
        label: init.childText, 
        clicks: 0
    });
    
    function clicked() {
        ++clicks;
        props({
            label: "thank you", 
            clicks
        });
    }

    return html`
        <button @click=${clicked} style="background-color: ${color}">${label}</button>
    `;
}

funce("a-button", ["color"], AButton, {throttled: 10});

function createButton(label) {
    console.log("createbutton", labely);
    return fixture(html`
         <a-button color="red">${label}</a-button>
    `);
}

function firstChild(host) {
    return host.rootChild;
}

describe("clickable button", function() {
    let host, button;
    beforeEach(() => {
        host = createButton("click me");
        button = firstChild(host);
    });

    it("should render a styled button", function() {
        assert.isTrue(!!host.shadowRoot);
        assert.equal(button.innerText, "click me");
        assert.equal(button.style.backgroundColor, "red");
    });
    
    it("should change text on click", async function() {
        assert.equal(button.innerText, "click me");
        button.click();
        await wait(11); // assuming throttled == 10
        assert.equal(button.innerText, "thank you");
    });
});

describe("childText", function() {
    const host = createButton("click me");
    const button = firstChild(host);
    
    it("childText should be initial text", async function() {
        assert.equal(host.childText, "click me");

        button.click();

        await wait(11); // assuming throttled == 10
        assert.equal(firstChild(host).innerText, "thank you");
        assert.equal(host.childText, "click me");
    });
});

describe("throttling", function() {
    const host = createButton("click me");
    const button = firstChild(host);

    it("throttling should be adjustable", async function () {   
        assert.equal(host.clicks, 0);
        
        button.click();
        assert.equal(host.clicks, 1);
        assert.equal(button.innerText, "click me");

        await wait(11); // assuming throttled == 10
        assert.equal(button.innerText, "thank you");

        const slowHost = createButton("slower click me");

        slowHost.throttled(43);

        const slowButton = firstChild(slowHost);
        assert.include(slowButton.innerText, "click me")
        slowButton.click();
        assert.equal(slowHost.clicks, 1);
        
        await wait(11); // assuming throttled == 10
        assert.equal(slowHost.clicks, 1);
        assert.include(slowButton.innerText, "click me");

        await wait(44-11); // assuming throttled == 10
        assert.equal(slowButton.innerText, "thank you");
    });
});

describe("init and dispose", function() {

    let initCounter;
    let renderCounter;
    let disposeCounter;
    let host;
    let parentDiv;

    function createTimerComponent() {
        funce("t-imer", timer, {throttled: 0, debug: false});
        function timer({ init, count }) {
            // console.log("timer", {init, count})
            init?.props({
                count: initCounter.call(),
            });
            init?.dispose(() => disposeCounter.call());
            renderCounter.call();
            return html`<span>${count}</span>`;
        }
    }

    before(createTimerComponent);

    beforeEach(function() {
        initCounter = callCounter();
        renderCounter = callCounter();   
        disposeCounter = callCounter();

        // note: switch off 'remove prior node' in fixture
        parentDiv = fixture(html`<div id="1"><t-imer id="timer-1"></t-imer></div>`, false);

        host = parentDiv.firstElementChild;
    });

    it("init should be called only once", function() {
        assert.equal(1, initCounter.count());
        assert.equal(2, renderCounter.count(), "twice for init and first render");
        host.render();
        host.render();
        assert.equal(1, initCounter.count(), "init called once expected");
        assert.equal(4, renderCounter.count(), "render should be called 3x");
    });

    it("dispose should be called when disconnected", function() {
        assert.equal(0, disposeCounter.count(), "dispose not be called before disconnectedCallback");
        parentDiv.removeChild(host);
        assert.equal(1, disposeCounter.count(), "dispose should have been called");
    });

    it.skip("callCounter works", function() {
        const cc = callCounter();
        assert.equal(0, cc.count());
        assert.equal(1, cc.call());
        assert.equal(1, cc.count());
        cc.call();
        assert.equal(3, cc.call());
        assert.equal(3, cc.count());
    });
});

function callCounter() {
    let count = 0;
    return {
        call() {
            return ++count;
        },
        count() {
            return count;
        }
    }
}
