
// jscheck.js
// Douglas Crockford
// 2021-05-17

// Public Domain

// http://www.jscheck.org/

/*jslint for, node */

/*property
    E, EPSILON, PI, any, args, array, boolean, cases, charCodeAt, character,
    check, claim, class, classification, classifier, codePointAt, concat,
    detail, fail, falsy, fill, findIndex, floor, forEach, freeze, fromCodePoint,
    integer, isArray, isSafeInteger, join, key, keys, length, literal, losses,
    lost, map, name, nr_trials, number, object, ok, pass, predicate, push,
    random, reduce, replace, report, sequence, serial, signature, sort, split,
    string, stringify, summary, time_limit, total, type, verdict, wun_of
*/

import fulfill from "./fulfill.js";

function resolve(value, ...rest) {

// The 'resolve' function takes a value. If that value is a function, then it is
// called to produce the return value. Otherwise, the value is the return value.

    return (
        typeof value === "function"
        ? value(...rest)
        : value
    );
}

function literal(value) {
    return function () {
        return value;
    };
}

function boolean(bias = 0.5) {

// A signature can contain a boolean specification. An optional bias
// parameter can be provided. If the bias is 0.25, then approximately a
// quarter of the booleans produced will be true.

    bias = resolve(bias);
    return function () {
        return Math.random() < bias;
    };
}

function number(from = 1, to = 0) {
    from = Number(resolve(from));
    to = Number(resolve(to));
    if (from > to) {
        [from, to] = [to, from];
    }
    const difference = to - from;
    return function () {
        return Math.random() * difference + from;
    };
}

function wun_of(array, weights) {

// The 'wun_of' specifier has two signatures.

//.  wun_of(array)
//.      Wun element is taken from the array and resolved.
//.      The elements are selected randomly with equal probabilities.

//. wun_of(array, weights)
//.      The two arguments are both arrays with equal lengths.
//.      The larger a weight, the more likely an element will be selected.

    if (
        !Array.isArray(array)
        || array.length < 1
        || (
            weights !== undefined
            && (!Array.isArray(weights) || array.length !== weights.length)
        )
    ) {
        throw new Error("JSCheck wun_of");
    }
    if (weights === undefined) {
        return function () {
            return resolve(array[Math.floor(Math.random() * array.length)]);
        };
    }
    const total = weights.reduce(function (a, b) {
        return a + b;
    });
    let base = 0;
    const list = weights.map(function (value) {
        base += value;
        return base / total;
    });
    return function () {
        let x = Math.random();
        return resolve(array[list.findIndex(function (element) {
            return element >= x;
        })]);
    };
}

function sequence(seq) {
    seq = resolve(seq);
    if (!Array.isArray(seq)) {
        throw "JSCheck sequence";
    }
    let element_nr = -1;
    return function () {
        element_nr += 1;
        if (element_nr >= seq.length) {
            element_nr = 0;
        }
        return resolve(seq[element_nr]);
    };
}

const bottom = [false, null, undefined, "", 0, NaN];

function falsy() {
    return wun_of(bottom);
}

const primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
    31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113,
    127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
    179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
    233, 239, 241, 251, 257, 263, 269, 271, 277, 281,
    283, 293, 307, 311, 313, 317, 331, 337, 347, 349,
    353, 359, 367, 373, 379, 383, 389, 397, 401, 409,
    419, 421, 431, 433, 439, 443, 449, 457, 461, 463,
    467, 479, 487, 491, 499, 503, 509, 521, 523, 541,
    547, 557, 563, 569, 571, 577, 587, 593, 599, 601,
    607, 613, 617, 619, 631, 641, 643, 647, 653, 659,
    661, 673, 677, 683, 691, 701, 709, 719, 727, 733,