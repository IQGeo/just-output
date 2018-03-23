const fs = require('fs');
const os = require('os');
const path = require('path');
const tmpdir = os.tmpdir();
let resultsPath = 'results';

let currentTest;

function startRun(lResultsPath) {
    if (lResultsPath) resultsPath = lResultsPath;
	console.log("Temp directory: ", tmpdir);
}

function startTest(test) {
	currentTest = test;
}


function writeTmpResult(currentTestOutput) {
    let resultFilePath = path.join(tmpdir, currentTest.filename+'.txt');
    fs.writeFileSync(resultFilePath, currentTest.output);
}


function getAcceptedResult() {
    const acceptedFilePath = getAcceptedResultPath();
    let acceptedOutput;

    try {
        acceptedOutput = fs.readFileSync(acceptedFilePath, 'utf-8');
    } catch (error) {
        console.log(error);
    }
    return Promise.resolve(acceptedOutput);
}

function getAcceptedResultPath() {
    return path.resolve(resultsPath, currentTest.filename+'.txt');
}


function handleResult(result) {
	if (result.pass) {
		console.log(currentTest.name + ': PASSED');
	} else {
		console.log(currentTest.name+':\t'+result.message.slice(0,180));
		console.log(currentTest.name + ': FAILED');
	}
}

function list(test) {
	console.log('test:', test.filename);
}


module.exports = {
	startRun,
	startTest,
	writeTmpResult,
	getAcceptedResultPath,
	getAcceptedResult,
	handleResult,
	list
};