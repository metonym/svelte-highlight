import{S as t,i as e,s as $,a4 as s,l as n,k as r,j as a,N as o,a5 as c,d as l,n as f,m as i,F as m,f as g,o as p,v as h,r as d,w as u,Y as x,e as y,c as v,a as w,a6 as E,a7 as S,p as b,Z as j,_ as H,$ as k,a8 as P,a9 as C,y as D,A as T,aa as O,ab as N,t as A,g as G,h as I,R,E as K,L as z,b as L,ac as q,G as M,ad as Y}from"../chunks/vendor-6dfea934.js";import{s as B,S as J}from"../chunks/ScopedStyle-10c5a6ab.js";import{H as U,C as W}from"../chunks/CodeSnippet-9e2ba8f3.js";import{b as F}from"../chunks/paths-45dac81d.js";function Z(t){let e,$,x,y,v;return y=new U({props:{class:t[0],code:t[2]}}),{c(){e=new s,$=n(),x=r(),a(y.$$.fragment),this.h()},l(t){const s=o('[data-svelte="svelte-v08gfe"]',document.head);e=c(s),$=n(),s.forEach(l),x=f(t),i(y.$$.fragment,t),this.h()},h(){e.a=$},m(s,n){e.m(t[1],document.head),m(document.head,$),g(s,x,n),p(y,s,n),v=!0},p(t,[$]){(!v||2&$)&&e.p(t[1]);const s={};1&$&&(s.class=t[0]),4&$&&(s.code=t[2]),y.$set(s)},i(t){v||(h(y.$$.fragment,t),v=!0)},o(t){d(y.$$.fragment,t),v=!1},d(t){l($),t&&e.d(),t&&l(x),u(y,t)}}}function _(t,e,$){let s,n,{name:r=""}=e,{moduleName:a=""}=e;return t.$$set=t=>{"name"in t&&$(3,r=t.name),"moduleName"in t&&$(0,a=t.moduleName)},t.$$.update=()=>{9&t.$$.dirty&&$(2,s=`<script>\n  import { HighlightSvelte } from "svelte-highlight";\n  import ${a} from "svelte-highlight/src/styles/${r}";\n  \n  const code = \`<button on:click={() => { console.log(0); }}>Click me</button>\`;\n<\/script>\n\n<svelte:head>\n  {@html ${a}}\n</svelte:head>\n\n<HighlightSvelte {code} />`),1&t.$$.dirty&&$(1,n=(B[a]||"").replace(/\.hljs/g,`.${a}.hljs`).replace(/\.hljs /g,`.${a}.hljs`).replace(/\.hljs-/g,`.${a} .hljs-`))},[a,n,s,r]}class Q extends t{constructor(t){super(),e(this,t,_,Z,$,{name:3,moduleName:0})}}const V=t=>({highlighted:2&t}),X=t=>({highlighted:t[1]});function tt(t){let e;return{c(){e=A(t[0])},l($){e=G($,t[0])},m(t,$){g(t,e,$)},p(t,$){1&$&&I(e,t[0])},d(t){t&&l(e)}}}function et(t){let e,$;return{c(){e=new s,$=n(),this.h()},l(t){e=c(t),$=n(),this.h()},h(){e.a=$},m(s,n){e.m(t[1],s,n),g(s,$,n)},p(t,$){2&$&&e.p(t[1])},d(t){t&&l($),t&&e.d()}}}function $t(t){let e;const $=t[4].default,s=x($,t,t[3],X),n=s||function(t){let e,$;function s(t,e){return void 0!==t[1]?et:tt}let n=s(t),r=n(t),a=[t[2]],o={};for(let c=0;c<a.length;c+=1)o=T(o,a[c]);return{c(){e=y("pre"),$=y("code"),r.c(),this.h()},l(t){e=v(t,"PRE",{});var s=w(e);$=v(s,"CODE",{});var n=w($);r.l(n),n.forEach(l),s.forEach(l),this.h()},h(){E(e,o),S(e,"hljs",!0)},m(t,s){g(t,e,s),m(e,$),r.m($,null)},p(t,c){n===(n=s(t))&&r?r.p(t,c):(r.d(1),r=n(t),r&&(r.c(),r.m($,null))),E(e,o=b(a,[4&c&&t[2]])),S(e,"hljs",!0)},d(t){t&&l(e),r.d()}}}(t);return{c(){n&&n.c()},l(t){n&&n.l(t)},m(t,$){n&&n.m(t,$),e=!0},p(t,[r]){s?s.p&&(!e||10&r)&&j(s,$,t,t[3],e?k($,t[3],r,V):H(t[3]),X):n&&n.p&&(!e||7&r)&&n.p(t,e?r:-1)},i(t){e||(h(n,t),e=!0)},o(t){d(n,t),e=!1},d(t){n&&n.d(t)}}}function st(t,e,$){const s=["code"];let n=P(e,s),{$$slots:r={},$$scope:a}=e,{code:o}=e;const c=C();let l;return D((()=>{l&&c("highlight",{highlighted:l})})),t.$$set=t=>{e=T(T({},e),O(t)),$(2,n=P(e,s)),"code"in t&&$(0,o=t.code),"$$scope"in t&&$(3,a=t.$$scope)},t.$$.update=()=>{1&t.$$.dirty&&o&&$(1,l=N.highlightAuto(o).value)},[o,l,n,a,r]}class nt extends t{constructor(t){super(),e(this,t,st,$t,$,{code:0})}}function rt(t){let e,$,x,y,v;return y=new nt({props:{class:t[0],code:t[2]}}),{c(){e=new s,$=n(),x=r(),a(y.$$.fragment),this.h()},l(t){const s=o('[data-svelte="svelte-v08gfe"]',document.head);e=c(s),$=n(),s.forEach(l),x=f(t),i(y.$$.fragment,t),this.h()},h(){e.a=$},m(s,n){e.m(t[1],document.head),m(document.head,$),g(s,x,n),p(y,s,n),v=!0},p(t,[$]){(!v||2&$)&&e.p(t[1]);const s={};1&$&&(s.class=t[0]),4&$&&(s.code=t[2]),y.$set(s)},i(t){v||(h(y.$$.fragment,t),v=!0)},o(t){d(y.$$.fragment,t),v=!1},d(t){l($),t&&e.d(),t&&l(x),u(y,t)}}}function at(t,e,$){let s,n,{name:r=""}=e,{moduleName:a=""}=e;return t.$$set=t=>{"name"in t&&$(3,r=t.name),"moduleName"in t&&$(0,a=t.moduleName)},t.$$.update=()=>{9&t.$$.dirty&&$(2,s=`<script>\n  import { HighlightAuto } from "svelte-highlight";\n  import ${a} from "svelte-highlight/src/styles/${r}";\n  \n  const code = ".body { padding: 0; margin: 0; }";\n<\/script>\n\n<svelte:head>\n  {@html ${a}}\n</svelte:head>\n\n<HighlightAuto {code} />`),1&t.$$.dirty&&$(1,n=(B[a]||"").replace(/\.hljs/g,`.${a}.hljs`).replace(/\.hljs /g,`.${a}.hljs`).replace(/\.hljs-/g,`.${a} .hljs-`))},[a,n,s,r]}class ot extends t{constructor(t){super(),e(this,t,at,rt,$,{name:3,moduleName:0})}}function ct(t){let e;return{c(){e=A("highlight.js")},l(t){e=G(t,"highlight.js")},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function lt(t){let e,$,s,n,r,o,c;return r=new z({props:{inline:!0,style:"font-size: inherit",rel:"external",href:"https://github.com/highlightjs/highlight.js",$$slots:{default:[ct]},$$scope:{ctx:t}}}),{c(){e=y("h4"),$=y("code"),s=A(ae),n=A(" provides Svelte components for code\n      syntax highlighting using "),a(r.$$.fragment),o=A("."),this.h()},l(t){e=v(t,"H4",{class:!0});var a=w(e);$=v(a,"CODE",{class:!0});var c=w($);s=G(c,ae),c.forEach(l),n=G(a," provides Svelte components for code\n      syntax highlighting using "),i(r.$$.fragment,a),o=G(a,"."),a.forEach(l),this.h()},h(){L($,"class","code"),L(e,"class","mb-7")},m(t,a){g(t,e,a),m(e,$),m($,s),m(e,n),p(r,e,null),m(e,o),c=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),r.$set($)},i(t){c||(h(r.$$.fragment,t),c=!0)},o(t){d(r.$$.fragment,t),c=!1},d(t){t&&l(e),u(r)}}}function ft(t){let e,$;return e=new K({props:{xlg:16,lg:16,$$slots:{default:[lt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function it(t){let e,$;return e=new W({props:{code:"yarn add -D "+ae}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p:M,i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function mt(t){let e,$;return e=new W({props:{code:"npm i -D "+ae}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p:M,i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function gt(t){let e,$,s,n,o,c,x,E,S,b;return n=new R({props:{class:"mb-7",noGutter:!0,$$slots:{default:[it]},$$scope:{ctx:t}}}),S=new R({props:{class:"mb-7",noGutter:!0,$$slots:{default:[mt]},$$scope:{ctx:t}}}),{c(){e=y("p"),$=A("Install using Yarn:"),s=r(),a(n.$$.fragment),o=r(),c=y("p"),x=A("Install using NPM:"),E=r(),a(S.$$.fragment),this.h()},l(t){e=v(t,"P",{class:!0});var r=w(e);$=G(r,"Install using Yarn:"),r.forEach(l),s=f(t),i(n.$$.fragment,t),o=f(t),c=v(t,"P",{class:!0});var a=w(c);x=G(a,"Install using NPM:"),a.forEach(l),E=f(t),i(S.$$.fragment,t),this.h()},h(){L(e,"class","mb-5"),L(c,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),g(t,s,r),p(n,t,r),g(t,o,r),g(t,c,r),m(c,x),g(t,E,r),p(S,t,r),b=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),n.$set($);const s={};2&e&&(s.$$scope={dirty:e,ctx:t}),S.$set(s)},i(t){b||(h(n.$$.fragment,t),h(S.$$.fragment,t),b=!0)},o(t){d(n.$$.fragment,t),d(S.$$.fragment,t),b=!1},d(t){t&&l(e),t&&l(s),u(n,t),t&&l(o),t&&l(c),t&&l(E),u(S,t)}}}function pt(t){let e,$;return e=new K({props:{xlg:10,lg:10,$$slots:{default:[gt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function ht(t){let e;return{c(){e=y("hr")},l(t){e=v(t,"HR",{})},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function dt(t){let e,$;return e=new K({props:{$$slots:{default:[ht]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function ut(t){let e,$;return{c(){e=y("h3"),$=A("SvelteKit set-up")},l(t){e=v(t,"H3",{});var s=w(e);$=G(s,"SvelteKit set-up"),s.forEach(l)},m(t,s){g(t,e,s),m(e,$)},d(t){t&&l(e)}}}function xt(t){let e,$;return e=new K({props:{$$slots:{default:[ut]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function yt(t){let e,$;return e=new W({props:{type:"multi",code:t[0]}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p:M,i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function vt(t){let e;return{c(){e=A("SvelteKit example")},l(t){e=G(t,"SvelteKit example")},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function wt(t){let e,$,s,n,o,c,x,E,S,b,j,H,k;return x=new R({props:{class:"mb-7",noGutter:!0,$$slots:{default:[yt]},$$scope:{ctx:t}}}),j=new z({props:{inline:!0,size:"lg",rel:"external",href:"https://github.com/metonym/svelte-highlight/tree/master/examples/sveltekit",$$slots:{default:[vt]},$$scope:{ctx:t}}}),{c(){e=y("p"),$=A("To use this library with SvelteKit, add the following to the kit field in\n      your\n      "),s=y("strong"),n=A("svelte.config.js"),o=A(":"),c=r(),a(x.$$.fragment),E=r(),S=y("p"),b=A("Refer to the "),a(j.$$.fragment),H=A(" for a sample set-up."),this.h()},l(t){e=v(t,"P",{class:!0});var r=w(e);$=G(r,"To use this library with SvelteKit, add the following to the kit field in\n      your\n      "),s=v(r,"STRONG",{});var a=w(s);n=G(a,"svelte.config.js"),a.forEach(l),o=G(r,":"),r.forEach(l),c=f(t),i(x.$$.fragment,t),E=f(t),S=v(t,"P",{class:!0});var m=w(S);b=G(m,"Refer to the "),i(j.$$.fragment,m),H=G(m," for a sample set-up."),m.forEach(l),this.h()},h(){L(e,"class","mb-5"),L(S,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),m(e,s),m(s,n),m(e,o),g(t,c,r),p(x,t,r),g(t,E,r),g(t,S,r),m(S,b),p(j,S,null),m(S,H),k=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),x.$set($);const s={};2&e&&(s.$$scope={dirty:e,ctx:t}),j.$set(s)},i(t){k||(h(x.$$.fragment,t),h(j.$$.fragment,t),k=!0)},o(t){d(x.$$.fragment,t),d(j.$$.fragment,t),k=!1},d(t){t&&l(e),t&&l(c),u(x,t),t&&l(E),t&&l(S),u(j)}}}function Et(t){let e,$;return e=new K({props:{xlg:10,lg:10,$$slots:{default:[wt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function St(t){let e,$;return{c(){e=y("h3"),$=A("Basic usage")},l(t){e=v(t,"H3",{});var s=w(e);$=G(s,"Basic usage"),s.forEach(l)},m(t,s){g(t,e,s),m(e,$)},d(t){t&&l(e)}}}function bt(t){let e,$;return e=new K({props:{$$slots:{default:[St]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function jt(t){let e,$,s;return{c(){e=y("code"),$=A("code"),s=A(": text to highlight"),this.h()},l(t){e=v(t,"CODE",{class:!0});var n=w(e);$=G(n,"code"),n.forEach(l),s=G(t,": text to highlight"),this.h()},h(){L(e,"class","code")},m(t,n){g(t,e,n),m(e,$),g(t,s,n)},d(t){t&&l(e),t&&l(s)}}}function Ht(t){let e,$,s;return{c(){e=y("code"),$=A("language"),s=A(": language used to highlight the text"),this.h()},l(t){e=v(t,"CODE",{class:!0});var n=w(e);$=G(n,"language"),n.forEach(l),s=G(t,": language used to highlight the text"),this.h()},h(){L(e,"class","code")},m(t,n){g(t,e,n),m(e,$),g(t,s,n)},d(t){t&&l(e),t&&l(s)}}}function kt(t){let e,$,s,n;return e=new Y({props:{$$slots:{default:[jt]},$$scope:{ctx:t}}}),s=new Y({props:{$$slots:{default:[Ht]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment),$=r(),a(s.$$.fragment)},l(t){i(e.$$.fragment,t),$=f(t),i(s.$$.fragment,t)},m(t,r){p(e,t,r),g(t,$,r),p(s,t,r),n=!0},p(t,$){const n={};2&$&&(n.$$scope={dirty:$,ctx:t}),e.$set(n);const r={};2&$&&(r.$$scope={dirty:$,ctx:t}),s.$set(r)},i(t){n||(h(e.$$.fragment,t),h(s.$$.fragment,t),n=!0)},o(t){d(e.$$.fragment,t),d(s.$$.fragment,t),n=!1},d(t){u(e,t),t&&l($),u(s,t)}}}function Pt(t){let e;return{c(){e=A("Languages page")},l(t){e=G(t,"Languages page")},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function Ct(t){let e,$,s,n,o,c,x,E,S,b,j,H,k,P,C,D;return n=new q({props:{class:"mb-5",$$slots:{default:[kt]},$$scope:{ctx:t}}}),P=new z({props:{size:"lg",href:F+"/languages",$$slots:{default:[Pt]},$$scope:{ctx:t}}}),{c(){e=y("p"),$=A("The default Highlight component requires two props:"),s=r(),a(n.$$.fragment),o=r(),c=y("p"),x=A("Languages can be found in "),E=y("code"),S=A('"svelte-highlight/src/languages"'),b=A("."),j=r(),H=y("p"),k=A("See the "),a(P.$$.fragment),C=A(" for a\n      list of supported languages."),this.h()},l(t){e=v(t,"P",{class:!0});var r=w(e);$=G(r,"The default Highlight component requires two props:"),r.forEach(l),s=f(t),i(n.$$.fragment,t),o=f(t),c=v(t,"P",{class:!0});var a=w(c);x=G(a,"Languages can be found in "),E=v(a,"CODE",{class:!0});var m=w(E);S=G(m,'"svelte-highlight/src/languages"'),m.forEach(l),b=G(a,"."),a.forEach(l),j=f(t),H=v(t,"P",{class:!0});var g=w(H);k=G(g,"See the "),i(P.$$.fragment,g),C=G(g," for a\n      list of supported languages."),g.forEach(l),this.h()},h(){L(e,"class","mb-5"),L(E,"class","code"),L(c,"class","mb-5"),L(H,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),g(t,s,r),p(n,t,r),g(t,o,r),g(t,c,r),m(c,x),m(c,E),m(E,S),m(c,b),g(t,j,r),g(t,H,r),m(H,k),p(P,H,null),m(H,C),D=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),n.$set($);const s={};2&e&&(s.$$scope={dirty:e,ctx:t}),P.$set(s)},i(t){D||(h(n.$$.fragment,t),h(P.$$.fragment,t),D=!0)},o(t){d(n.$$.fragment,t),d(P.$$.fragment,t),D=!1},d(t){t&&l(e),t&&l(s),u(n,t),t&&l(o),t&&l(c),t&&l(j),t&&l(H),u(P)}}}function Dt(t){let e,$;return e=new J({props:{name:"atom-one-dark",moduleName:"atomOneDark"}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p:M,i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function Tt(t){let e,$,s;return{c(){e=y("code"),$=A("Injected styles"),s=A(": JavaScript styles injected\n        using the svelte:head API"),this.h()},l(t){e=v(t,"CODE",{class:!0});var n=w(e);$=G(n,"Injected styles"),n.forEach(l),s=G(t,": JavaScript styles injected\n        using the svelte:head API"),this.h()},h(){L(e,"class","code")},m(t,n){g(t,e,n),m(e,$),g(t,s,n)},d(t){t&&l(e),t&&l(s)}}}function Ot(t){let e,$,s;return{c(){e=y("code"),$=A("CSS StyleSheet"),s=A(": CSS file that may require an\n        appropriate file loader"),this.h()},l(t){e=v(t,"CODE",{class:!0});var n=w(e);$=G(n,"CSS StyleSheet"),n.forEach(l),s=G(t,": CSS file that may require an\n        appropriate file loader"),this.h()},h(){L(e,"class","code")},m(t,n){g(t,e,n),m(e,$),g(t,s,n)},d(t){t&&l(e),t&&l(s)}}}function Nt(t){let e,$,s,n;return e=new Y({props:{$$slots:{default:[Tt]},$$scope:{ctx:t}}}),s=new Y({props:{$$slots:{default:[Ot]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment),$=r(),a(s.$$.fragment)},l(t){i(e.$$.fragment,t),$=f(t),i(s.$$.fragment,t)},m(t,r){p(e,t,r),g(t,$,r),p(s,t,r),n=!0},p(t,$){const n={};2&$&&(n.$$scope={dirty:$,ctx:t}),e.$set(n);const r={};2&$&&(r.$$scope={dirty:$,ctx:t}),s.$set(r)},i(t){n||(h(e.$$.fragment,t),h(s.$$.fragment,t),n=!0)},o(t){d(e.$$.fragment,t),d(s.$$.fragment,t),n=!1},d(t){u(e,t),t&&l($),u(s,t)}}}function At(t){let e;return{c(){e=A("Styles page")},l(t){e=G(t,"Styles page")},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function Gt(t){let e,$,s,n,o,c,x,E,S,b,j,H,k,P,C,D;return b=new q({props:{class:"mb-5",$$slots:{default:[Nt]},$$scope:{ctx:t}}}),P=new z({props:{size:"lg",href:F+"/styles",$$slots:{default:[At]},$$scope:{ctx:t}}}),{c(){e=y("p"),$=A("Styles can be imported from "),s=y("code"),n=A('"svelte-highlight/src/styles"'),o=A("."),c=r(),x=y("p"),E=A("There are two ways to add styles:"),S=r(),a(b.$$.fragment),j=r(),H=y("p"),k=A("Refer to the "),a(P.$$.fragment),C=A(" for a\n      list of supported styles."),this.h()},l(t){e=v(t,"P",{class:!0});var r=w(e);$=G(r,"Styles can be imported from "),s=v(r,"CODE",{class:!0});var a=w(s);n=G(a,'"svelte-highlight/src/styles"'),a.forEach(l),o=G(r,"."),r.forEach(l),c=f(t),x=v(t,"P",{class:!0});var m=w(x);E=G(m,"There are two ways to add styles:"),m.forEach(l),S=f(t),i(b.$$.fragment,t),j=f(t),H=v(t,"P",{class:!0});var g=w(H);k=G(g,"Refer to the "),i(P.$$.fragment,g),C=G(g," for a\n      list of supported styles."),g.forEach(l),this.h()},h(){L(s,"class","code"),L(e,"class","mb-5"),L(x,"class","mb-5"),L(H,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),m(e,s),m(s,n),m(e,o),g(t,c,r),g(t,x,r),m(x,E),g(t,S,r),p(b,t,r),g(t,j,r),g(t,H,r),m(H,k),p(P,H,null),m(H,C),D=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),b.$set($);const s={};2&e&&(s.$$scope={dirty:e,ctx:t}),P.$set(s)},i(t){D||(h(b.$$.fragment,t),h(P.$$.fragment,t),D=!0)},o(t){d(b.$$.fragment,t),d(P.$$.fragment,t),D=!1},d(t){t&&l(e),t&&l(c),t&&l(x),t&&l(S),u(b,t),t&&l(j),t&&l(H),u(P)}}}function It(t){let e,$,s,n,o,c;return e=new K({props:{xlg:10,lg:10,$$slots:{default:[Ct]},$$scope:{ctx:t}}}),s=new K({props:{noGutter:!0,$$slots:{default:[Dt]},$$scope:{ctx:t}}}),o=new K({props:{xlg:10,lg:10,$$slots:{default:[Gt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment),$=r(),a(s.$$.fragment),n=r(),a(o.$$.fragment)},l(t){i(e.$$.fragment,t),$=f(t),i(s.$$.fragment,t),n=f(t),i(o.$$.fragment,t)},m(t,r){p(e,t,r),g(t,$,r),p(s,t,r),g(t,n,r),p(o,t,r),c=!0},p(t,$){const n={};2&$&&(n.$$scope={dirty:$,ctx:t}),e.$set(n);const r={};2&$&&(r.$$scope={dirty:$,ctx:t}),s.$set(r);const a={};2&$&&(a.$$scope={dirty:$,ctx:t}),o.$set(a)},i(t){c||(h(e.$$.fragment,t),h(s.$$.fragment,t),h(o.$$.fragment,t),c=!0)},o(t){d(e.$$.fragment,t),d(s.$$.fragment,t),d(o.$$.fragment,t),c=!1},d(t){u(e,t),t&&l($),u(s,t),t&&l(n),u(o,t)}}}function Rt(t){let e,$;return{c(){e=y("h3"),$=A("Svelte syntax highlighting")},l(t){e=v(t,"H3",{});var s=w(e);$=G(s,"Svelte syntax highlighting"),s.forEach(l)},m(t,s){g(t,e,s),m(e,$)},d(t){t&&l(e)}}}function Kt(t){let e,$;return e=new K({props:{$$slots:{default:[Rt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function zt(t){let e,$,s,n,r;return{c(){e=y("p"),$=A("Use the "),s=y("code"),n=A("HighlightSvelte"),r=A(" component for Svelte syntax\n      highlighting."),this.h()},l(t){e=v(t,"P",{class:!0});var a=w(e);$=G(a,"Use the "),s=v(a,"CODE",{class:!0});var o=w(s);n=G(o,"HighlightSvelte"),o.forEach(l),r=G(a," component for Svelte syntax\n      highlighting."),a.forEach(l),this.h()},h(){L(s,"class","code"),L(e,"class","mb-5")},m(t,a){g(t,e,a),m(e,$),m(e,s),m(s,n),m(e,r)},d(t){t&&l(e)}}}function Lt(t){let e,$;return e=new Q({props:{name:"atom-one-dark",moduleName:"atomOneDark"}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p:M,i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function qt(t){let e,$,s,n;return e=new K({props:{xlg:10,lg:10,$$slots:{default:[zt]},$$scope:{ctx:t}}}),s=new K({props:{noGutter:!0,$$slots:{default:[Lt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment),$=r(),a(s.$$.fragment)},l(t){i(e.$$.fragment,t),$=f(t),i(s.$$.fragment,t)},m(t,r){p(e,t,r),g(t,$,r),p(s,t,r),n=!0},p(t,$){const n={};2&$&&(n.$$scope={dirty:$,ctx:t}),e.$set(n);const r={};2&$&&(r.$$scope={dirty:$,ctx:t}),s.$set(r)},i(t){n||(h(e.$$.fragment,t),h(s.$$.fragment,t),n=!0)},o(t){d(e.$$.fragment,t),d(s.$$.fragment,t),n=!1},d(t){u(e,t),t&&l($),u(s,t)}}}function Mt(t){let e,$;return{c(){e=y("h3"),$=A("Auto-highlighting")},l(t){e=v(t,"H3",{});var s=w(e);$=G(s,"Auto-highlighting"),s.forEach(l)},m(t,s){g(t,e,s),m(e,$)},d(t){t&&l(e)}}}function Yt(t){let e,$;return e=new K({props:{$$slots:{default:[Mt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function Bt(t){let e,$,s,n,r,a,o,c,f,i,p;return{c(){e=y("p"),$=A("The "),s=y("code"),n=A("HighlightAuto"),r=A(" component invokes the\n      "),a=y("code"),o=A("highlightAuto"),c=A("\n      API from "),f=y("code"),i=A("highlight.js"),p=A("."),this.h()},l(t){e=v(t,"P",{class:!0});var m=w(e);$=G(m,"The "),s=v(m,"CODE",{class:!0});var g=w(s);n=G(g,"HighlightAuto"),g.forEach(l),r=G(m," component invokes the\n      "),a=v(m,"CODE",{class:!0});var h=w(a);o=G(h,"highlightAuto"),h.forEach(l),c=G(m,"\n      API from "),f=v(m,"CODE",{class:!0});var d=w(f);i=G(d,"highlight.js"),d.forEach(l),p=G(m,"."),m.forEach(l),this.h()},h(){L(s,"class","code"),L(a,"class","code"),L(f,"class","code"),L(e,"class","mb-5")},m(t,l){g(t,e,l),m(e,$),m(e,s),m(s,n),m(e,r),m(e,a),m(a,o),m(e,c),m(e,f),m(f,i),m(e,p)},d(t){t&&l(e)}}}function Jt(t){let e,$;return e=new ot({props:{name:"atom-one-dark",moduleName:"atomOneDark"}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p:M,i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function Ut(t){let e,$,s,n;return e=new K({props:{xlg:10,lg:10,$$slots:{default:[Bt]},$$scope:{ctx:t}}}),s=new K({props:{noGutter:!0,$$slots:{default:[Jt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment),$=r(),a(s.$$.fragment)},l(t){i(e.$$.fragment,t),$=f(t),i(s.$$.fragment,t)},m(t,r){p(e,t,r),g(t,$,r),p(s,t,r),n=!0},p(t,$){const n={};2&$&&(n.$$scope={dirty:$,ctx:t}),e.$set(n);const r={};2&$&&(r.$$scope={dirty:$,ctx:t}),s.$set(r)},i(t){n||(h(e.$$.fragment,t),h(s.$$.fragment,t),n=!0)},o(t){d(e.$$.fragment,t),d(s.$$.fragment,t),n=!1},d(t){u(e,t),t&&l($),u(s,t)}}}function Wt(t){let e;return{c(){e=y("hr")},l(t){e=v(t,"HR",{})},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function Ft(t){let e,$;return e=new K({props:{$$slots:{default:[Wt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function Zt(t){let e;return{c(){e=A("types folder in the GitHub repository")},l(t){e=G(t,"types folder in the GitHub repository")},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function _t(t){let e,$,s,n,o,c,x,E,S,b,j;return S=new z({props:{inline:!0,size:"lg",rel:"external",href:"https://github.com/metonym/svelte-highlight/tree/master/types",$$slots:{default:[Zt]},$$scope:{ctx:t}}}),{c(){e=y("h3"),$=A("TypeScript support"),s=r(),n=y("p"),o=A("Svelte version 3.31 or greater is required to use this library with\n      TypeScript."),c=r(),x=y("p"),E=A("TypeScript definitions are located in the "),a(S.$$.fragment),b=A("."),this.h()},l(t){e=v(t,"H3",{class:!0});var r=w(e);$=G(r,"TypeScript support"),r.forEach(l),s=f(t),n=v(t,"P",{class:!0});var a=w(n);o=G(a,"Svelte version 3.31 or greater is required to use this library with\n      TypeScript."),a.forEach(l),c=f(t),x=v(t,"P",{class:!0});var m=w(x);E=G(m,"TypeScript definitions are located in the "),i(S.$$.fragment,m),b=G(m,"."),m.forEach(l),this.h()},h(){L(e,"class","mb-7"),L(n,"class","mb-5"),L(x,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),g(t,s,r),g(t,n,r),m(n,o),g(t,c,r),g(t,x,r),m(x,E),p(S,x,null),m(x,b),j=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),S.$set($)},i(t){j||(h(S.$$.fragment,t),j=!0)},o(t){d(S.$$.fragment,t),j=!1},d(t){t&&l(e),t&&l(s),t&&l(n),t&&l(c),t&&l(x),u(S)}}}function Qt(t){let e,$;return e=new K({props:{$$slots:{default:[_t]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function Vt(t){let e;return{c(){e=A("examples folder")},l(t){e=G(t,"examples folder")},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function Xt(t){let e,$,s,n,o,c,x,E;return c=new z({props:{inline:!0,size:"lg",rel:"external",href:"https://github.com/metonym/svelte-highlight/tree/master/examples",$$slots:{default:[Vt]},$$scope:{ctx:t}}}),{c(){e=y("h3"),$=A("Examples"),s=r(),n=y("p"),o=A("See the "),a(c.$$.fragment),x=A(" for sample set-ups including SvelteKit, Rollup, Webpack, Snowpack, and more."),this.h()},l(t){e=v(t,"H3",{class:!0});var r=w(e);$=G(r,"Examples"),r.forEach(l),s=f(t),n=v(t,"P",{class:!0});var a=w(n);o=G(a,"See the "),i(c.$$.fragment,a),x=G(a," for sample set-ups including SvelteKit, Rollup, Webpack, Snowpack, and more."),a.forEach(l),this.h()},h(){L(e,"class","mb-7"),L(n,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),g(t,s,r),g(t,n,r),m(n,o),p(c,n,null),m(n,x),E=!0},p(t,e){const $={};2&e&&($.$$scope={dirty:e,ctx:t}),c.$set($)},i(t){E||(h(c.$$.fragment,t),E=!0)},o(t){d(c.$$.fragment,t),E=!1},d(t){t&&l(e),t&&l(s),t&&l(n),u(c)}}}function te(t){let e,$;return e=new K({props:{$$slots:{default:[Xt]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function ee(t){let e,$,s,n,a;return{c(){e=y("h3"),$=A("License"),s=r(),n=y("p"),a=A("MIT"),this.h()},l(t){e=v(t,"H3",{class:!0});var r=w(e);$=G(r,"License"),r.forEach(l),s=f(t),n=v(t,"P",{class:!0});var o=w(n);a=G(o,"MIT"),o.forEach(l),this.h()},h(){L(e,"class","mb-7"),L(n,"class","mb-5")},m(t,r){g(t,e,r),m(e,$),g(t,s,r),g(t,n,r),m(n,a)},d(t){t&&l(e),t&&l(s),t&&l(n)}}}function $e(t){let e,$;return e=new K({props:{$$slots:{default:[ee]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function se(t){let e;return{c(){e=y("hr")},l(t){e=v(t,"HR",{})},m(t,$){g(t,e,$)},d(t){t&&l(e)}}}function ne(t){let e,$;return e=new K({props:{$$slots:{default:[se]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment)},l(t){i(e.$$.fragment,t)},m(t,s){p(e,t,s),$=!0},p(t,$){const s={};2&$&&(s.$$scope={dirty:$,ctx:t}),e.$set(s)},i(t){$||(h(e.$$.fragment,t),$=!0)},o(t){d(e.$$.fragment,t),$=!1},d(t){u(e,t)}}}function re(t){let e,$,s,n,o,c,m,x,y,v,w,E,S,b,j,H,k,P,C,D,T,O,N,A,G,I,K,z,L,q,M,Y;return e=new R({props:{$$slots:{default:[ft]},$$scope:{ctx:t}}}),s=new R({props:{$$slots:{default:[pt]},$$scope:{ctx:t}}}),o=new R({props:{noGutter:!0,$$slots:{default:[dt]},$$scope:{ctx:t}}}),m=new R({props:{$$slots:{default:[xt]},$$scope:{ctx:t}}}),y=new R({props:{class:"mb-7",$$slots:{default:[Et]},$$scope:{ctx:t}}}),w=new R({props:{$$slots:{default:[bt]},$$scope:{ctx:t}}}),S=new R({props:{class:"mb-7",$$slots:{default:[It]},$$scope:{ctx:t}}}),j=new R({props:{$$slots:{default:[Kt]},$$scope:{ctx:t}}}),k=new R({props:{class:"mb-7",$$slots:{default:[qt]},$$scope:{ctx:t}}}),C=new R({props:{$$slots:{default:[Yt]},$$scope:{ctx:t}}}),T=new R({props:{class:"mb-7",$$slots:{default:[Ut]},$$scope:{ctx:t}}}),N=new R({props:{noGutter:!0,$$slots:{default:[Ft]},$$scope:{ctx:t}}}),G=new R({props:{$$slots:{default:[Qt]},$$scope:{ctx:t}}}),K=new R({props:{$$slots:{default:[te]},$$scope:{ctx:t}}}),L=new R({props:{$$slots:{default:[$e]},$$scope:{ctx:t}}}),M=new R({props:{noGutter:!0,$$slots:{default:[ne]},$$scope:{ctx:t}}}),{c(){a(e.$$.fragment),$=r(),a(s.$$.fragment),n=r(),a(o.$$.fragment),c=r(),a(m.$$.fragment),x=r(),a(y.$$.fragment),v=r(),a(w.$$.fragment),E=r(),a(S.$$.fragment),b=r(),a(j.$$.fragment),H=r(),a(k.$$.fragment),P=r(),a(C.$$.fragment),D=r(),a(T.$$.fragment),O=r(),a(N.$$.fragment),A=r(),a(G.$$.fragment),I=r(),a(K.$$.fragment),z=r(),a(L.$$.fragment),q=r(),a(M.$$.fragment)},l(t){i(e.$$.fragment,t),$=f(t),i(s.$$.fragment,t),n=f(t),i(o.$$.fragment,t),c=f(t),i(m.$$.fragment,t),x=f(t),i(y.$$.fragment,t),v=f(t),i(w.$$.fragment,t),E=f(t),i(S.$$.fragment,t),b=f(t),i(j.$$.fragment,t),H=f(t),i(k.$$.fragment,t),P=f(t),i(C.$$.fragment,t),D=f(t),i(T.$$.fragment,t),O=f(t),i(N.$$.fragment,t),A=f(t),i(G.$$.fragment,t),I=f(t),i(K.$$.fragment,t),z=f(t),i(L.$$.fragment,t),q=f(t),i(M.$$.fragment,t)},m(t,r){p(e,t,r),g(t,$,r),p(s,t,r),g(t,n,r),p(o,t,r),g(t,c,r),p(m,t,r),g(t,x,r),p(y,t,r),g(t,v,r),p(w,t,r),g(t,E,r),p(S,t,r),g(t,b,r),p(j,t,r),g(t,H,r),p(k,t,r),g(t,P,r),p(C,t,r),g(t,D,r),p(T,t,r),g(t,O,r),p(N,t,r),g(t,A,r),p(G,t,r),g(t,I,r),p(K,t,r),g(t,z,r),p(L,t,r),g(t,q,r),p(M,t,r),Y=!0},p(t,[$]){const n={};2&$&&(n.$$scope={dirty:$,ctx:t}),e.$set(n);const r={};2&$&&(r.$$scope={dirty:$,ctx:t}),s.$set(r);const a={};2&$&&(a.$$scope={dirty:$,ctx:t}),o.$set(a);const c={};2&$&&(c.$$scope={dirty:$,ctx:t}),m.$set(c);const l={};2&$&&(l.$$scope={dirty:$,ctx:t}),y.$set(l);const f={};2&$&&(f.$$scope={dirty:$,ctx:t}),w.$set(f);const i={};2&$&&(i.$$scope={dirty:$,ctx:t}),S.$set(i);const g={};2&$&&(g.$$scope={dirty:$,ctx:t}),j.$set(g);const p={};2&$&&(p.$$scope={dirty:$,ctx:t}),k.$set(p);const h={};2&$&&(h.$$scope={dirty:$,ctx:t}),C.$set(h);const d={};2&$&&(d.$$scope={dirty:$,ctx:t}),T.$set(d);const u={};2&$&&(u.$$scope={dirty:$,ctx:t}),N.$set(u);const x={};2&$&&(x.$$scope={dirty:$,ctx:t}),G.$set(x);const v={};2&$&&(v.$$scope={dirty:$,ctx:t}),K.$set(v);const E={};2&$&&(E.$$scope={dirty:$,ctx:t}),L.$set(E);const b={};2&$&&(b.$$scope={dirty:$,ctx:t}),M.$set(b)},i(t){Y||(h(e.$$.fragment,t),h(s.$$.fragment,t),h(o.$$.fragment,t),h(m.$$.fragment,t),h(y.$$.fragment,t),h(w.$$.fragment,t),h(S.$$.fragment,t),h(j.$$.fragment,t),h(k.$$.fragment,t),h(C.$$.fragment,t),h(T.$$.fragment,t),h(N.$$.fragment,t),h(G.$$.fragment,t),h(K.$$.fragment,t),h(L.$$.fragment,t),h(M.$$.fragment,t),Y=!0)},o(t){d(e.$$.fragment,t),d(s.$$.fragment,t),d(o.$$.fragment,t),d(m.$$.fragment,t),d(y.$$.fragment,t),d(w.$$.fragment,t),d(S.$$.fragment,t),d(j.$$.fragment,t),d(k.$$.fragment,t),d(C.$$.fragment,t),d(T.$$.fragment,t),d(N.$$.fragment,t),d(G.$$.fragment,t),d(K.$$.fragment,t),d(L.$$.fragment,t),d(M.$$.fragment,t),Y=!1},d(t){u(e,t),t&&l($),u(s,t),t&&l(n),u(o,t),t&&l(c),u(m,t),t&&l(x),u(y,t),t&&l(v),u(w,t),t&&l(E),u(S,t),t&&l(b),u(j,t),t&&l(H),u(k,t),t&&l(P),u(C,t),t&&l(D),u(T,t),t&&l(O),u(N,t),t&&l(A),u(G,t),t&&l(I),u(K,t),t&&l(z),u(L,t),t&&l(q),u(M,t)}}}const ae="svelte-highlight";function oe(t){return['export default {\n  kit: {\n    target: "#svelte",\n    vite: {\n      optimizeDeps: {\n        include: ["highlight.js/lib/core"],\n      },\n    },\n  },\n};']}export default class extends t{constructor(t){super(),e(this,t,oe,re,$,{})}}