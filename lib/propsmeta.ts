export { propsMetaData, PropDefs }

const ident = val => val;
const toNum = val => +val;
const isDefined = val => !(val === undefined || val === null);

function converterByType(type): (string)=>unknown {
  switch (type) {
    case "string": return ident;
    case "number": return toNum;
    case "boolean": return Boolean;
  }
  console.warn("could not find converter", {type});
  return ident;
}

function convertedByValue(val: string): unknown {
  console.log("convertedByVal", {val});
  
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

  const basicTypes =  ["string", "number", "boolean"];

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

function derivePropMetaMap(props: string[], propDefs) {
  const propMetaMap = props.reduce(
    (map, prop) => {
      map[prop] = derivePropMeta(propDefs[prop]);
      return map
    }, {});
    return propMetaMap;
}

type PropDefs = { [prop: string]: unknown } | string[];

function propsMetaData(tag, propDefs: PropDefs = []) {
  let propNames;
  let propMetaMap: { type?, value?, convertfn? } = {};

  if (Array.isArray(propDefs)) {
    propNames = propDefs as string[];
  } else {
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
    } else if (init) {
      // console.log("convertValue", tag, {value, type, converter});
      return convertedByValue(value);
    }
    return value;
  }

  function getDefault(prop: string) {
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
  }
}
