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

funce("a-button", ["color"], AButton, {throttle: 10});

function createButton(label) {
    return fixture(html`
         <a-button color="red">${label}</a-button>
    `);
}

function firstChild(host) {
    return host.rootChild;
}

describe("clickable button", function() {

    it("should render a styled button", function() {
        const host = createButton("click me");
        const button = firstChild(host);
        assert.isTrue(host.isShady);
        assert.equal(button.innerText, "click me");
        assert.equal(button.style.backgroundColor, "red");
    });
    
    it("should change text on click", async function() {
        const host = createButton("click me");
        const button = firstChild(host);
        assert.equal(button.innerText, "click me");
        button.click();
        await wait(11); // assuming throttle == 10
        assert.equal(button.innerText, "thank you");
    });
});

describe("childText", function() {
    it("childText should be initial text", async function() {
        const host = createButton("click me");
        assert.equal(host.childText, "click me");

        const button = firstChild(host);
        button.click();

        await wait(11); // assuming throttle == 10
        assert.equal(firstChild(host).innerText, "thank you");
        assert.equal(host.childText, "click me");
    });
});

describe("shadow", function() {
    funce("t-ag", () => html`<div>hi</div>`);

    it("should change shadow state as expected", function() {
        const host = fixture(html`<t-ag>hello</t-ag>`);
        assert.isTrue(host.isShady);
        assert.equal(host.root.firstElementChild.innerText, 'hi');
        
        host.shadow('toggle');
        assert.isFalse(host.isShady);
        assert.equal(host.root.firstElementChild.innerText, 'hi');
    });
});

describe("throttling", function() {
    it("throttling should be adjustable", async function () {
        const host = createButton("click me");
        const button = firstChild(host);
        assert.equal(host.clicks, 0);
        
        button.click();
        assert.equal(host.clicks, 1);
        assert.equal(button.innerText, "click me");

        await wait(11); // assuming throttle == 10
        assert.equal(button.innerText, "thank you");

        const slowHost = createButton("slower click me");

        slowHost.throttle(43);

        const slowButton = firstChild(slowHost);
        assert.include(slowButton.innerText, "click me")
        slowButton.click();
        assert.equal(slowHost.clicks, 1);
        
        await wait(11); // assuming throttle == 10
        assert.equal(slowHost.clicks, 1);
        assert.include(slowButton.innerText, "click me");

        await wait(44-11); // assuming throttle == 10
        assert.equal(slowButton.innerText, "thank you");

        // slowHost.dump();
    });
});