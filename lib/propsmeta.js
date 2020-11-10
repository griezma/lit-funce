export { propsMetaData };
const ident = val => val;
const toNum = val => +val;
const isDefined = val => !(val === undefined || val === null);
function converterByType(type) {
    switch (type) {
        case "string": return ident;
        case "number": return toNum;
        case "boolean": return Boolean;
    }
    console.warn("could not find converter", { type });
    return ident;
}
function convertedByValue(val) {
    console.log("convertedByVal", { val });
    if (!isNaN(+val)) {
        return toNum(val);
    }
    if (["true", "false"].includes(val)) {
        return Boolean(val);
    }
    if (val.startsWith('{')) {
        return JSON.parse(val);
    }
    return val;
}
function derivePropMeta(propdef) {
    let type;
    let value;
    let convertfn = ident;
    const typeofDef = typeof propdef;
    const basicTypes = ["string", "number", "boolean"];
    if (typeofDef === "string" && basicTypes.includes(propdef)) {
        type = propdef;
        convertfn = converterByType(type);
    }
    else if (basicTypes.includes(typeofDef)) {
        type = typeofDef;
        convertfn = converterByType(type);
        value = propdef;
    }
    else if (typeofDef === "function") {
        type = typeofDef;
        convertfn = propdef;
    }
    else {
        type = typeofDef;
        value = propdef;
    }
    return { type, value, convertfn };
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
        defineProps(propDefs);
    }
    function defineProps(propDefs) {
        const keys = Object.keys(propDefs);
        propNames = keys;
        propMetaMap = derivePropMetaMap(keys, propDefs);
    }
    function convertValue(prop, value, init = false) {
        const { convertfn } = propMetaMap[prop] || {};
        // console.log("convert", tag, {prop, value, init, meta});
        if (convertfn) {
            return convertfn(value);
        }
        else if (init) {
            // console.log("convertValue", tag, {value, type, converter});
            return convertedByValue(value);
        }
        return value;
    }
    function getDefault(prop) {
        //console.log("getDefault", tag);
        const { value, convertfn } = propMetaMap[prop];
        return isDefined(value) ? value : convertfn('');
    }
    function getProps() {
        return propNames;
    }
    return {
        getProps,
        getDefault,
        convertValue,
        defineProps
    };
}
//# sourceMappingURL=propsmeta.js.map