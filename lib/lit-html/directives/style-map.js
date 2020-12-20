/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const t=new WeakMap,e=e=>"function"==typeof e&&t.has(e),s={};String(Math.random()).slice(2),window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:t=>t});class i{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===s||(t=>null===t||!("object"==typeof t||"function"==typeof t))(t)&&t===this.value||(this.value=t,e(t)||(this.committer.dirty=!0))}commit(){for(;e(this.value);){const t=this.value;this.value=s,t(this)}this.value!==s&&this.committer.commit()}}class n extends i{}let o=!1;(()=>{try{const t={get capture(){return o=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})(),
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.3.0")
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;const r=new WeakMap,a=(c=t=>e=>{if(!(e instanceof i)||e instanceof n||"style"!==e.committer.name||e.committer.parts.length>1)throw new Error("The `styleMap` directive must be used in the style attribute and must be the only part in the attribute.");const{committer:s}=e,{style:o}=s.element;let a=r.get(e);void 0===a&&(o.cssText=s.strings.join(" "),r.set(e,a=new Set)),a.forEach((e=>{e in t||(a.delete(e),-1===e.indexOf("-")?o[e]=null:o.removeProperty(e))}));for(const e in t)a.add(e),-1===e.indexOf("-")?o[e]=t[e]:o.setProperty(e,t[e])},(...e)=>{const s=c(...e);return t.set(s,!0),s});var c;export{a as styleMap};
