
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
    739, 743, 751, 757, 761, 769, 773, 787, 797, 809,
    811, 821, 823, 827, 829, 839, 853, 857, 859, 863,
    877, 881, 883, 887, 907, 911, 919, 929, 937, 941,
    947, 953, 967, 971, 977, 983, 991, 997
];

function integer_value(value, default_value) {
    value = resolve(value);
    return (
        typeof value === "number"
        ? Math.floor(value)
        : (
            typeof value === "string"
            ? value.charCodeAt(0)
            : default_value
        )
    );
}

function integer(i, j) {
    if (i === undefined) {
        return wun_of(primes);
    }
    i = integer_value(i, 1);
    if (j === undefined) {
        j = i;
        i = 1;
    } else {
        j = integer_value(j, 1);
    }
    if (i > j) {
        [i, j] = [j, i];
    }
    return function () {
        return Math.floor(Math.random() * (j + 1 - i) + i);
    };
}

function character(i, j) {
    if (i === undefined) {
        return character(32, 126);
    }
    if (typeof i === "string") {
        return (
            j === undefined
            ? wun_of(i.split(""))
            : character(i.codePointAt(0), j.codePointAt(0))
        );
    }
    const ji = integer(i, j);
    return function () {
        return String.fromCodePoint(ji());
    };
}

function array(first, value) {
    if (Array.isArray(first)) {
        return function () {
            return first.map(resolve);
        };
    }
    if (first === undefined) {
        first = integer(4);
    }
    if (value === undefined) {
        value = integer();
    }
    return function () {
        const dimension = resolve(first);
        const result = new Array(dimension).fill(value);
        return (
            typeof value === "function"
            ? result.map(resolve)
            : result
        );
    };
}

function string(...parameters) {
    const length = parameters.length;

    if (length === 0) {
        return string(integer(10), character());
    }
    return function () {
        let pieces = [];
        let parameter_nr = 0;
        let value;
        while (true) {
            value = resolve(parameters[parameter_nr]);
            parameter_nr += 1;
            if (value === undefined) {
                break;
            }
            if (
                Number.isSafeInteger(value)
                && value >= 0
                && parameters[parameter_nr] !== undefined
            ) {
                pieces = pieces.concat(
                    new Array(value).fill(parameters[parameter_nr]).map(resolve)
                );
                parameter_nr += 1;
            } else {
                pieces.push(String(value));
            }

        }
        return pieces.join("");
    };
}

const misc = [
    true, Infinity, -Infinity, falsy(), Math.PI, Math.E, Number.EPSILON
];

function any() {
    return wun_of([integer(), number(), string(), wun_of(misc)]);
}

function object(subject, value) {
    if (subject === undefined) {
        subject = integer(1, 4);
    }
    return function () {
        let result = {};
        const keys = resolve(subject);
        if (typeof keys === "number") {
            const text = string();
            const gen = any();
            let i = 0;
            while (i < keys) {
                result[text()] = gen();
                i += 1;
            }
            return result;
        }
        if (value === undefined) {
            if (keys && typeof keys === "object") {
                Object.keys(subject).forEach(function (key) {
                    result[key] = resolve(keys[key]);
                });
                return result;
            }
        } else {
            const values = resolve(value);
            if (Array.isArray(keys)) {
                keys.forEach(function (key, key_nr) {
                    result[key] = resolve((
                        Array.isArray(values)
                        ? values[key_nr % values.length]
                        : value
                    ), key_nr);
                });
                return result;
            }
        }
    };
}

const ctp = "{name}: {class}{cases} cases tested, {pass} pass{fail}{lost}\n";