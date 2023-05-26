!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.jo=e():t.jo=e()}(this,(()=>(()=>{"use strict";var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{default:()=>F,output:()=>l,section:()=>c,setCurrentTest:()=>r,specs:()=>n,subTest:()=>u,suite:()=>a,test:()=>i,testRunner:()=>k,tests:()=>A});const n=[];let o,s={};function r(t){s.test=t}function a(t,e){o=t,e&&(e(),o=void 0)}function i(...t){const e=t.length,s=t[0],r=e>=3?t[2]:t[1],a=e>=3?t[1]:{},i=o?o+"_"+s:s;n.push({name:i.replace(/[^a-z0-9]/gi,"_"),testFunc:r,testOpts:a,suite:o})}function c(t,e){"function"==typeof e?(l("\n***",t),e()):l("\n***",...arguments)}function u(...t){const e=t.length,n=t[0],o=e>=3?t[2]:t[1];e>=3&&t[1],s.test.subTests.push((async function(){l("\n***",n);try{await o()}catch(t){(t instanceof Error?t:new Error(t.msg||t)).stack.split("\n").forEach((t=>l(t)))}}))}function l(...t){const e=t.map((t=>"string"==typeof t?t:p(t)));s.test.output+=e.join(" "),s.test.output+="\n"}function p(t,e){t instanceof Set&&(t=[...t].sort());const n=Object.prototype.toString.call(t);e=e||1;const o=new Array(e+1).join("\t"),s=new Array(e).join("\t");if("[object Object]"===n){const n=[];for(const o in t)t.hasOwnProperty(o)&&n.push([o,p(t[o],e+1)]);return n.sort((function(t,e){return t[0]<e[0]?-1:1})),"{\n"+n.reduce((function(t,e,n){return(n?t+",\n":"")+o+'"'+e[0]+'": '+e[1]}),"")+"\n"+s+"}"}return"[object Array]"===n?"[\n"+t.reduce((function(t,n,s){return(s?t+",\n":"")+o+p(n,e+1)}),"")+"\n"+s+"]":"[object Number]"===n?t.toString().length>13||Math.abs(t)>1e12?parseFloat(t.toPrecision(12)).toString():t.toString():JSON.stringify(t,null,"\t")}const f=n;var d=function(t,e,n){void 0===n&&(n=function(t,e){return t===e});var o=[],s=function(r,a,i,c){var u=a-r+1,l=c-i+1;if(u>0&&l>0){var p=function(o,s,r,a){var i=s-o+1,c=a-r+1,u=i+c,l=i-c,p=(u+1)/2|0,f=null,d={},g={};d[1]=0,g[l-1]=i;for(var y=0;y<=p;y++){for(var v=-y;v<=y&&!f;v+=2)if(j=(b=v===-y||v!==y&&d[v-1]<d[v+1]?d[v+1]:d[v-1]+1)-v,!(isNaN(j)||b>i||j>c)){for(var T=b;b<i&&j<c&&n(t[o+b],e[r+j]);)b++,j++;d[v]=b,1==(1&l)&&h(v,l-(y-1),l+(y-1))&&d[v]>=g[v]&&(f=[T,b].map((t=>m(t,v))))}if(f)var w=2*y-1;for(v=-y;v<=y&&!f;v+=2){var b,j,S=v+l;if(j=(b=v===y||v!==-y&&g[S-1]<g[S+1]?g[S-1]:g[S+1]-1)-S,!(isNaN(j)||b<0||j<0)){for(T=b;b>0&&j>0&&n(t[o+b-1],e[r+j-1]);)b--,j--;g[S]=b,l%2==0&&h(S,-y,y)&&g[S]<=d[S]&&(f=[b,T].map((t=>m(t,S))))}}if(f){w=w||2*y;for(var R=0;R<2;R++)for(var O=0;O<2;O++)f[R][O]+=[o,r][O]-R;return f.concat([w,(u-w)/2])}}}(r,a,i,c),f=p[0][0],d=p[0][1],g=p[1][0],y=p[1][1];p[2]>1?(s(r,f-1,i,d-1),f<=g&&o.push(...t.slice(f,g+1)),s(g+1,a,y+1,c)):l>u?o.push(...t.slice(r,a+1)):o.push(...e.slice(i,c+1))}};return s(0,t.length-1,0,e.length-1),o},h=function(t,e,n){return e<=t&&t<=n||n<=t&&t<=e},m=function(t,e){return[t,t-e]};d.StringLCS=function(t,e){return d(t.split(""),e.split("")).join("")};var g=function(t,e,n){for(var o=e;o<this.length;o++)if(n(t,this[o]))return o;return-1};const y={tmpdir:void 0,getFilename:t=>t.name,getTestName:t=>t.name};let v,T,w=!1;class b{constructor(t,e){this._tests=t,v=e}setOptions(t){Object.assign(y,t)}async run(t,e){w=!1,v.startRun(e,y);let n=0,o=this._tests.length;for(const e of this._tests){if(w)break;if(t&&!S(t,e))continue;if(!await R(e)){o--;continue}n++,T=e,r(e),e.output="",e.subTests=[],e.filename=y.getFilename(e);try{await this.runTest(e.testFunc);for(const t of e.subTests)await this.runTest(t)}catch(t){O(t)}try{await v.writeTmpResult(e)}catch(t){console.log(t)}let s;try{s=await v.getAcceptedResult(e)}catch(t){s=null}const a=j(s);v.handleResult(e,a)}1!==n&&n!==o&&console.log(`Ran ${n} tests out of ${o}`)}async runTest(t){try{await t()}catch(t){O(t)}}cancelTests(){w=!0}async listTests(t){(await this.getTests(t,{logSkippedTests:!1})).forEach((t=>{console.log("test:",y.getTestName(t))}))}async listTestFilenames(t){(await this.getTests(t,{logSkippedTests:!1})).forEach((t=>{console.log(t.name+": "+y.getFilename(t))}))}async getTests(t,e){let n=f;return t&&(n=n.filter(S.bind(null,t))),n=(await Promise.all(n.map((async t=>await R(t,e)?t:null)))).filter((t=>t)),n}}function j(t){const e=T.output;if(null===t)return{pass:!1,message:"No accepted output ("+v.getAcceptedResultPath()+")"};var n=function(t,e,n){void 0===n&&(n=function(t,e){return t===e});for(var o=[],s=0,r=0,a=t.length,i=e.length,c=0;s<a&&r<i&&n(t[s],e[r]);)s++,r++;for(;s<a&&r<i&&n(t[a-1],e[i-1]);)a--,i--,c++;o.push(...t.slice(0,s));for(var u=d(t.slice(s,a),e.slice(r,i),n),l=0;l<u.length;l++){var p=u[l],f=g.call(t,p,s,n),h=g.call(e,p,r,n);o.push(...t.slice(s,f).map((function(t){return{operation:"delete",atom:t}}))),o.push(...e.slice(r,h).map((function(t){return{operation:"add",atom:t}}))),o.push({operation:"none",atom:p}),s=f+1,r=h+1}return o.push(...t.slice(s,a).map((function(t){return{operation:"delete",atom:t}}))),o.push(...e.slice(r,i).map((function(t){return{operation:"add",atom:t}}))),o.push(...t.slice(a,a+c).map((function(t){return{operation:"none",atom:t}}))),o}(e.split(/\r?\n/),t.split(/\r?\n/)),o=n.filter((t=>"add"==t.operation||"delete"==t.operation)),s={pass:0===o.length,message:""};if(s.pass)s.message="output is equal to accepted output";else{var r=[];o.forEach((t=>{"add"==t.operation?r.push("-  "+t.atom):"delete"==t.operation?r.push("+  "+t.atom):t.atom?r.push("   "+t.atom):r.push("   "+t)})),s.message="Expected output to match accepted output:\n"+r.join("\n"),s.diffs=o,s.comparison=n}return s}const S=function(t,e){return null!=e.name.match(t)},R=async function(t,{logSkippedTests:e=!0}={}){const n=y.getTestName(t),o=t.testOpts.shouldRunTest;if(void 0===o)return!0;const s="function"==typeof o?await Promise.resolve(o()):!!o;return"string"==typeof s?(e&&console.log(`Skipping test ${n}: ${s}`),!1):!1!==s||(e&&console.log(`Skipping test ${n}`),!1)};function O(t){var e=t instanceof Error?t:new Error(t.msg||t);if(document&&document.location&&document.location.search&&document.location.search.indexOf("spec=")>=0){if(document.location.search.indexOf("catch=false")>=0)throw e;console.log(e.stack),E(e)}else E(e)}function E(t){t.stack.split("\n").forEach((t=>l(t)))}let x="results";function N(t){return x+"/"+t.filename+".txt"}const P={startRun:function(t,e){t&&(x=t),justOutputUIRender(!0)},writeTmpResult:function(t){},getAcceptedResult:function(t){return e=N(t)+"?"+Math.random(),new Promise((function(t,n){var o=new XMLHttpRequest;function s(){if(o.status>=200&&o.status<400){var e=o.response||o.responseText||o.responseXML;t(e)}else{var s=new Error("Status code was "+o.status);s.code=o.status,s.responseText=o.responseText,n(s)}}try{o.open("GET",e,!0),o.onreadystatechange=function(){4===o.readyState&&s()},o.onload=o.load=s,o.onerror=o.error=function(){n(new Error("Can't XHR "+JSON.stringify(e)))},o.send()}catch(t){n(t)}}));var e},getAcceptedResultPath:N,handleResult:function(t,e){window.handleTestResult(e,t)}},k=(t,e=P)=>new b(t,e),A=k(n),F={tests:A,testRunner:k,specs:n,suite:a,test:i,section:c,subTest:u,output:l};return e})()));