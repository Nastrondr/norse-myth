import{x as e,h as a,d as t,w as s,j as l,o as i,a as o,F as r,q as d,u as c,b as n,y as h,l as p,m as k,t as u,z as y,A as b,e as f}from"./index--YLMlww4.js";import{_ as g}from"./_plugin-vue_export-helper.BCo6x5W8.js";
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=e=>{for(const a in e)if(a.startsWith("aria-")||"role"===a||"title"===a)return!0;return!1},x=e=>""===e,w=(...e)=>e.filter((e,a,t)=>Boolean(e)&&""!==e.trim()&&t.indexOf(e)===a).join(" ").trim(),_=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),v=e=>{const a=(e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,t)=>t?t.toUpperCase():a.toLowerCase()))(e);return a.charAt(0).toUpperCase()+a.slice(1)};
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
var C={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=({name:a,iconNode:t,absoluteStrokeWidth:s,"absolute-stroke-width":l,strokeWidth:i,"stroke-width":o,size:r=C.width,color:d=C.stroke,...c},{slots:n})=>e("svg",{...C,...c,width:r,height:r,stroke:d,"stroke-width":x(s)||x(l)||!0===s||!0===l?24*Number(i||o||C["stroke-width"])/Number(r):i||o||C["stroke-width"],class:w("lucide",c.class,...a?[`lucide-${_(v(a))}-icon`,`lucide-${_(a)}`]:["lucide-icon"]),...!n.default&&!m(c)&&{"aria-hidden":"true"}},[...t.map(a=>e(...a)),...n.default?[n.default()]:[]]),j=(a,t)=>(s,{slots:l,attrs:i})=>e(M,{...i,...s,iconNode:t,name:a},l),z=j("book-open",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]),A=j("gamepad-2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]),B=j("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]),S=j("library",[["path",{d:"m16 6 4 14",key:"ji33uf"}],["path",{d:"M12 6v14",key:"1n7gus"}],["path",{d:"M8 8v12",key:"1gg7y9"}],["path",{d:"M4 4v16",key:"6qkkli"}]]);
/**
 * @license lucide-vue-next v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=g({name:"TabBar",props:{current:{type:String,default:"home"}},emits:["change"],data:()=>({tabs:[{id:"home",label:"首页",icon:B,path:"/pages/index/index"},{id:"codex",label:"图鉴",icon:S,path:"/pages/codex/codex-index"},{id:"stories",label:"故事",icon:z,path:"/pages/stories/story-list"},{id:"profile",label:"档案",icon:A,path:"/pages/profile/profile"}]}),methods:{handleTabClick(e){e.id!==this.current&&(this.$emit("change",e),a({url:e.path}))}}},[["render",function(e,a,y,b,f,g){const m=l,x=p;return i(),t(m,{class:"bottom-tab"},{default:s(()=>[(i(!0),o(r,null,d(f.tabs,e=>(i(),t(m,{key:e.id,class:c(["tab-item",{active:y.current===e.id}]),onClick:a=>g.handleTabClick(e)},{default:s(()=>[n(m,{class:"tab-icon-box"},{default:s(()=>[(i(),t(h(e.icon),{size:22,"stroke-width":1.8}))]),_:2},1024),n(x,{class:"tab-label"},{default:s(()=>[k(u(e.label),1)]),_:2},1024)]),_:2},1032,["class","onClick"]))),128))]),_:1})}],["__scopeId","data-v-234cb29d"]]);const q=g({name:"PageHeader",props:{title:{type:String,default:""},subtitle:{type:String,default:""},kicker:{type:String,default:""},back:{type:Boolean,default:!1}},methods:{goBack(){y().length>1?b():a({url:"/pages/codex/codex-index"})}}},[["render",function(e,a,o,r,d,c){const h=p,y=l;return i(),t(y,{class:"page-header"},{default:s(()=>[o.back?(i(),t(y,{key:0,class:"ph-back",onClick:c.goBack},{default:s(()=>[n(h,{class:"ph-back-icon"},{default:s(()=>[k("‹")]),_:1})]),_:1},8,["onClick"])):f("",!0),o.kicker?(i(),t(y,{key:1,class:"ph-kicker-row"},{default:s(()=>[n(y,{class:"ph-line"}),n(y,{class:"ph-diamond"}),n(h,{class:"ph-kicker"},{default:s(()=>[k(u(o.kicker),1)]),_:1}),n(y,{class:"ph-diamond"}),n(y,{class:"ph-line"})]),_:1})):f("",!0),n(h,{class:"ph-title"},{default:s(()=>[k(u(o.title),1)]),_:1}),o.subtitle?(i(),t(h,{key:2,class:"ph-subtitle"},{default:s(()=>[k(u(o.subtitle),1)]),_:1})):f("",!0)]),_:1})}],["__scopeId","data-v-73d42846"]]);export{q as P,$ as T,j as c};
