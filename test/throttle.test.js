import throttle from "../lib/simpleThrottle.js"
import { assert } from "@esm-bundle/chai/esm/chai.js";

function challenge(fn, freq=10, timeout=100) {
    // fn();
    let arg = 0;
    const timer = setInterval(() => fn(arg++), freq);
    setTimeout(() => clearInterval(timer), timeout);
}

function wait(time) {
    return new Promise(res => setTimeout(res, time));
}

function callCount() {
    let count = 0;
    return {
        call: () => ++count,
        count: () => count
    }
}

describe("throttle", async function() {
    
    it("throttle reduces calls", async function() {
        let cc = callCount();
        cc.call();
        assert.equal(1, cc.count());
        
        cc = callCount();
        challenge(cc.call, 5, 500);
        await wait(501);
        assert(cc.count() >= 99, ""+cc.count());

        cc = callCount();
        const debFn = throttle(cc.call, 100);
        challenge(debFn, 5, 500);
        await wait(501);
        console.log({count: cc.count});
        assert.equal(cc.count(), 5);
    });
});