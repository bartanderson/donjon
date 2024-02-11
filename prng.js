// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// prng.js
// seeded pseudo-random number generator
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';((c,e)=>e(c))(window,c=>{function e(a){b=1103515245*b+12345;b&=2147483647;return 1<a?(b>>8)%a:0}let b=Date.now();c.set_prng_seed=function(a){if("number"==typeof a)b=Math.floor(a);else if("string"==typeof a){{var d=42;let f;for(f=0;f<a.length;f++)d=(d<<5)-d+a.charCodeAt(f),d&=2147483647;b=d}}else b=Date.now();return b};c.random=e;c.random_fp=function(){return e(32768)/32768}});
