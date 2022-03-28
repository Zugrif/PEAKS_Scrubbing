
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