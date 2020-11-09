export default debounce;
function timer(message, ...args) {
    const start = Date.now();
    console.log("begin", message, ...args);
    return {
        log(info, ...args) {
            console.log(Date.now() - start, info, ...args);
        }
    };
}
function debounce(fn, time) {
    // const t = timer("debounce", {time});
    let timeout;
    const later = () => {
        timeout = null;
        const out = fn();
        // t.log("later", {out});
        return out;
    };
    return () => {
        // t.log("called", {timeout});
        if (!timeout) {
            timeout = setTimeout(later, time);
        }
    };
}
//# sourceMappingURL=debounce.js.map