import { defineElement, html, render } from "/lit-funce.js";

import { expect } from "@esm-bundle/chai/esm/chai.js";
import fixture from "./fixture.js";

const wait = async (ms) => new Promise(res => setTimeout(res, ms));

defineElement("el-button", 
    ({ label, color }) => html`
        <button style="background-color: ${color}">${label}</button>
    `,
    {label: "string", color: "string"});

describe("funce", function() {
    it("should render component", async function() {
        const el = fixture(html
            `<el-button label="click me" color="red"></el-button>`);
        
        await wait(51);
        const button = el.root.firstElementChild;
        expect(button.innerText).to.be.includes("click me");
        expect(button.style.backgroundColor).to.be.equal("red");
    });
});