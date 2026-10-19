import{J as e}from"./index-xqX1jCvW.js";
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t=e=>{for(const t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1},o=e=>""===e,r=(...e)=>e.filter((e,t,o)=>Boolean(e)&&""!==e.trim()&&o.indexOf(e)===t).join(" ").trim(),i=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),s=e=>{const t=(e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,o)=>o?o.toUpperCase():t.toLowerCase()))(e);return t.charAt(0).toUpperCase()+t.slice(1)};
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=({name:n,iconNode:l,absoluteStrokeWidth:d,"absolute-stroke-width":c,strokeWidth:h,"stroke-width":u,size:w=a.width,color:k=a.stroke,...p},{slots:m})=>e("svg",{...a,...p,width:w,height:w,stroke:k,"stroke-width":o(d)||o(c)||!0===d||!0===c?24*Number(h||u||a["stroke-width"])/Number(w):h||u||a["stroke-width"],class:r("lucide",p.class,...n?[`lucide-${i(s(n))}-icon`,`lucide-${i(n)}`]:["lucide-icon"]),...!m.default&&!t(p)&&{"aria-hidden":"true"}},[...l.map(t=>e(...t)),...m.default?[m.default()]:[]]),l=(t,o)=>(r,{slots:i,attrs:s})=>e(n,{...s,...r,iconNode:o,name:t},i);
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */export{l as c};
