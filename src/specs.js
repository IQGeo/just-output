export const tests = [];
let currentSuite;
let current = {};

export function setCurrentTest(test) {
    current.test = test;
}

/**
 * Declares a test suite
 * @param  {string} name        Name of test suite
 * @param  {function} [tests]   Tests to run. If not specified, all tests declared until next call will be considered part of this suite
 */
export function suite(name, tests) {
    currentSuite = name;
    if (tests) {
        tests();
        currentSuite = undefined;
    }
}

/**
 * Declares a test, result is stored in a separate file
 * @param  {string} name       Name of test
 * @param  {any[]} args        Arguments, in the format (name: string, opts: Record<string, any> (optional), testFunc: function)
 */
export function test(name, ...args) {
    const argsLength = args.length;
    const testFunc = argsLength >= 2 ? args[1] : args[0];
    const testOpts = argsLength >= 2 ? args[0] : {};

    const fullName = currentSuite ? currentSuite + '_' + name : name;

    tests.push({
        name: fullName.replace(/[^a-z0-9]/gi, '_'),
        testFunc,
        testOpts,
        suite: currentSuite,
    });
}

/**
 * Defines a section in the current test
 * @param {string} name
 * @param {function} [test] Optional sub test to execute
 */
export function section(name, test) {
    if (typeof test == 'function') {
        output('\n***', name);
        test();
    } else {
        output('\n***', ...arguments);
    }
}

/**
 * Defines a sub test.
 * Output will be in same file as parent test but identified with the sub test's name
 * @param  {string} name       Name of sub test
 * @param  {any[]} args        Arguments, in the format (name: string, opts: Record<string, any> (optional), testFunc: function)
 */
export function subTest(name, ...args) {
    const argsLength = args.length;
    const testFunc = argsLength >= 2 ? args[1] : args[0];
    const testOpts = argsLength >= 2 ? args[0] : {};

    current.test.subTests.push(async function () {
        output('\n***', name);
        try {
            await testFunc();
        } catch (reason) {
            var error = reason instanceof Error ? reason : new Error(reason.msg || reason);
            error.stack.split('\n').forEach((line) => output(line));
        }
    });
}

/**
 * Outputs the given arguments to the result of the test.
 * Values are stringified for readability and sorted for consistency
 * @param  {...any} args
 */
export function output(...args) {
    const strArgs = args.map((value) => (typeof value == 'string' ? value : _stringify(value)));
    current.test.output += strArgs.join(' ');
    current.test.output += '\n';
}

function _stringify(obj, indentLvl) {
    if (obj instanceof Set) obj = [...obj].sort();
    const type = Object.prototype.toString.call(obj);
    indentLvl = indentLvl || 1;
    const indent = new Array(indentLvl + 1).join('\t'),
        indentClose = new Array(indentLvl).join('\t');
    if (type === '[object Object]') {
        const pairs = [];
        for (const k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            pairs.push([k, _stringify(obj[k], indentLvl + 1)]);
        }
        pairs.sort(function (a, b) {
            return a[0] < b[0] ? -1 : 1;
        });
        let pairsStr = pairs.reduce(function (m, v, i) {
            return (i ? m + ',\n' : '') + indent + '"' + v[0] + '": ' + v[1];
        }, '');
        return '{\n' + pairsStr + '\n' + indentClose + '}';
    } else if (type === '[object Array]') {
        return (
            '[\n' +
            obj.reduce(function (m, v, i) {
                return (i ? m + ',\n' : '') + indent + _stringify(v, indentLvl + 1);
            }, '') +
            '\n' +
            indentClose +
            ']'
        );
    } else if (type === '[object Number]') {
        if (obj.toString().length > 13 || Math.abs(obj) > 1.0e12) {
            return parseFloat(obj.toPrecision(12)).toString();
        }
        return obj.toString();
    }

    return JSON.stringify(obj, null, '\t');
}

//these functions will be exposed as globals
export default tests;
