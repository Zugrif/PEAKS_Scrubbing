
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