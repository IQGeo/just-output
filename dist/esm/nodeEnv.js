import { writeFileSync, readFileSync } from 'fs';
import { tmpdir as _tmpdir } from 'os';
import { join, resolve } from 'path';
let tmpdir = _tmpdir();
let resultsPath = 'results';
/** @satisfies {import('./testRunner.js').TestEnv} */
const nodeEnv = {
    startRun(lResultsPath, options) {
        if (lResultsPath)
            resultsPath = lResultsPath;
        if (options.tmpdir)
            tmpdir = options.tmpdir;
        console.log('Temp directory: ', tmpdir);
    },
    writeTmpResult(test) {
        let resultFilePath = join(tmpdir, test.filename + '.txt');
        writeFileSync(resultFilePath, test.output);
    },
    getAcceptedResult(test) {
        const acceptedFilePath = getAcceptedResultPath(test);
        let acceptedOutput;
        try {
            acceptedOutput = readFileSync(acceptedFilePath, 'utf-8');
        }
        catch (error) {
            console.log(error);
        }
        return Promise.resolve(acceptedOutput);
    },
    getAcceptedResultPath(test) {
        return getAcceptedResultPath(test);
    },
    handleResult(test, result) {
        if (result.pass) {
            console.log(test.name + ': PASSED');
        }
        else {
            console.log(test.name + ':\t' + result.message.slice(0, 180));
            console.log(test.name + ': FAILED');
        }
    },
};
/** @type {import('./testRunner.js').TestEnv['getAcceptedResultPath']} */
function getAcceptedResultPath(test) {
    return resolve(resultsPath, test.filename + '.txt');
}
export default nodeEnv;
