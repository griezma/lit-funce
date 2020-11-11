export default throttle;

const nop = {
    info: (...args) => {} 
}

const log_topic = "";

function timelog(topic, args, enabled = topic === log_topic) {
    if (!enabled) return nop;

    const start = Date.now();
    console.log("begin", topic, args)
    return {
        info(...args) {
            console.log(Date.now() - start, ...args);
        }
    }
}

function throttle(fn: Function, wait: number) {
    const t = timelog("throttle", {fn: fn.name, time: wait});

    let lastCall;
    let timeout;
    let context, nextArgs;

    function later() {
        const now = Date.now();
        t.info("later", {sinceLast: now - lastCall, nextArgs});

        timeout = null;
        lastCall = now;
        return fn.apply(context, nextArgs);
    }

    function remainingTime() {
        const sinceLast = Date.now() - lastCall;
        return Math.max(wait - sinceLast, 0);
    }

    return (...args) => {
        t.info("proxy call", {args});

        context = this;
        nextArgs = args;

        if (!lastCall) {
            // first invocation
            t.info("first");
            later();
        }

        const remaining = remainingTime();
        t.info({remaining});

        if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
    }
}