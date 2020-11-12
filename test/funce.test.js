import { assert, expect } from "@esm-bundle/chai/esm/chai.js";
import { defel, html } from "/lit-funce.js";
import fixture from "./fixture.js";

const wait = async (ms) => new Promise(res => setTimeout(res, ms));

const ElButton = ({ color, init, label, props }) => {
    init?.props({label: init.innerText});

    function clicked() {
        props({label: "thank you"});
    }
    return html`
        <button @click=${clicked} style="background-color: ${color}">${label}</button>
    `;
}

defel("el-button", ["color"], ElButton, {throttled: 10});

const appendButton = label => fixture(html`
    <el-button color="red">${label}</el-button>
`);

describe("clickable button", function() {

    it("should render a styled button", function() {
        const elButton = appendButton("click me");
        const button = elButton.root.firstElementChild;
        assert.equal(button.innerText, "click me");
        assert.equal(button.style.backgroundColor, "red");
    });
    
    it("should change text on click", async function() {
        const elButton = appendButton("click me");
        const button = elButton.root.firstElementChild;
        assert.equal(button.innerText, "click me");
        button.click();
        await wait(11); // assuming throttled == 10
        assert.equal(button.innerText, "thank you");

        assert.equal(elButton.initText, "click me");
    });
});