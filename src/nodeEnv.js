// import { writeFileSync, readFileSync } from 'fs';
// import { tmpdir as _tmpdir } from 'os';
// import { join, resolve } from 'path';

const { writeFileSync, readFileSync } = require('fs');
const { tmpdir: _tmpdir } = require('os');
const { join, resolve } = require('path');

let tmpdir = _tmpdir();
let resultsPath = 'results';

function startRun(lResultsPath, options) {
    if (lResultsPath) resultsPath = lResultsPath;
    if (options.tmpdir) tmpdir = options.tmpdir;
    console.log('Temp directory: ', tmpdir);
}

function writeTmpResult(test) {
    let resultFilePath = join(tmpdir, test.filename + '.txt');
    writeFileSync(resultFilePath, test.output);
}

function getAcceptedResult(test) {
    const acceptedFilePath = getAcceptedResultPath(test);
    let acceptedOutput;

    try {
        acceptedOutput = readFileSync(acceptedFilePath, 'utf-8');
    } catch (error) {
        console.log(error);
    }
    return Promise.resolve(acceptedOutput);
}

function getAcceptedResultPath(test) {
    return resolve(resultsPath, test.filename + '.txt');
}

function handleResult(test, result) {
    if (result.pass) {
        console.log(test.name + ': PASSED');
    } else {
        console.log(test.name + ':\t' + result.message.slice(0, 180));
        console.log(test.name + ': FAILED');
    }
}

module.exports = {
    startRun,
    writeTmpResult,
    getAcceptedResult,
    getAcceptedResultPath,
    handleResult,
};

// export default { startRun, writeTmpResult, getAcceptedResult, getAcceptedResultPath, handleResult };
