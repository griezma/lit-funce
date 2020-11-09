import debounce from "../lib/debounce.js"
import { assert } from "@esm-bundle/chai/esm/chai.js";


function challenge(fn, freq=10, timeout=100) {
    // fn();
    const timer = setInterval(fn, freq);
    setTimeout(() => clearInterval(timer), timeout);
}

function wait(time) {
    return new Promise(res => setTimeout(res, time));
}

describe("debounce", async function() {
    
    it("debounce reduces calls", async function() {
        let callCount = 0;
        const fn = () => ++callCount;

        callCount = 0;
        challenge(fn, 10, 500);
        await wait(511);
        assert(callCount > 40);

        callCount = 0;
        const debFn = debounce(fn, 40);
        challenge(debFn, 10, 500);
        await wait(511);
        console.log({callCount});
        assert(callCount <= 12);
    });
});