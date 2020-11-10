export { propsMetaData };
const ident = val => val;
const toNum = val => +val;
function findConverter(type) {
    switch (type) {
        case "string": return ident;
        case "number": return toNum;
        case "boolean": return Boolean;
    }
    console.warn("could not find converter", { type });
    return ident;
}
function derivePropMeta(propdef) {
    let type;
    let value;
    let converterfn = ident;
    const typeofDef = typeof propdef;
    const basicTypes = ["string", "number", "boolean"];
    if (typeofDef === "string" && basicTypes.includes(propdef)) {
        type = propdef;
        converterfn = findConverter(type);
        value = converterfn('');
    }
    else if (basicTypes.includes(typeofDef)) {
        type = typeofDef;
        converterfn = findConverter(type);
        value = propdef;
    }
    else if (typeofDef === "function") {
        type = typeofDef;
        converterfn = propdef;
    }
    else {
        type = typeofDef;
        value = propdef;
    }
    return { type, value, converterfn };
}
function guessValType(val) {
    if (!isNaN(+val)) {
        return "number";
    }
    if (["true", "false"].includes(val)) {
        return "boolean";
    }
    if (val.startsWith('{')) {
        return "json";
    }
    return "string";
}
function derivePropMetaMap(props, propDefs) {
    const propMetaMap = props.reduce((map, prop) => {
        map[prop] = derivePropMeta(propDefs[prop]);
        return map;
    }, {});
    return propMetaMap;
}
function propsMetaData(tag, propDefs = []) {
    let propNames;
    let propMetaMap = {};
    if (Array.isArray(propDefs)) {
        propNames = propDefs;
    }
    else {
        registerProps(propDefs);
    }
    function registerProps(propDefs) {
        const keys = Object.keys(propDefs);
        propNames = keys;
        propMetaMap = derivePropMetaMap(keys, propDefs);
    }
    function convertValue(prop, value, init = false) {
        const meta = propMetaMap[prop];
        // console.log("convert", tag, {prop, value, init, meta});
        if (meta) {
            const { converterfn } = meta;
            return converterfn ? converterfn(value) : value;
        }
        else if (init) {
            const type = guessValType(value);
            const converter = findConverter(type);
            // console.log("convertValue", tag, {value, type, converter});
            return converter ? converter(value) : value;
        }
        return value;
    }
    function getDefault(prop) {
        var _a;
        //console.log("getDefault", tag);
        return (_a = propMetaMap[prop]) === null || _a === void 0 ? void 0 : _a.value;
    }
    function getProps() {
        return propNames;
    }
    return {
        getProps,
        getDefault,
        convertValue,
        registerProps
    };
}
//# sourceMappingURL=propsmeta.js.map