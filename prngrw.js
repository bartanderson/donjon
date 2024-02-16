// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// prngrw.js
// seeded pseudo-random number generator
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';

((globalObject, executeFunction) => executeFunction(globalObject))(window, globalObject => {
    function generateRandomNumber(maxValue) {
        seed = 1103515245 * seed + 12345;
        seed &= 2147483647;
        return 1 < maxValue ? (seed >> 8) % maxValue : 0;
    }

    let seed = Date.now();

    globalObject.set_prng_seed = function(input) {
        if ("number" == typeof input) {
            seed = Math.floor(input);
        } else if ("string" == typeof input) {
            var hash = 42;
            let index;
            for (index = 0; index < input.length; index++) {
                hash = (hash << 5) - hash + input.charCodeAt(index);
                hash &= 2147483647;
                seed = hash;
            }
        } else {
            seed = Date.now();
        }
        return seed;
    };

    globalObject.random = generateRandomNumber;

    globalObject.random_fp = function() {
        return generateRandomNumber(32768) / 32768;
    };
});