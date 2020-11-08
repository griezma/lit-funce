import { defineElement, html, render } from "/lit-funce.js";

import { expect } from "@esm-bundle/chai/esm/chai.js";
import fixture from "./fixture.js";

defineElement("el-button", 
    ({ label, color }) => html`
        <button style="background-color: ${color}">${label}</button>
    `,
    {label: "string", color: "string"});

describe("funce", function() {
    it("should render component", async function() {
        const el = fixture(html
            `<el-button label="click me" color="red"></el-button>`);

        const button = el.root.firstElementChild;
        expect(button.innerText).to.be.includes("click me");
        expect(button.style.backgroundColor).to.be.equal("red");
    });
});