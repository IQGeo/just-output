const fs = require('fs');
const os = require('os');
const path = require('path');
let tmpdir = os.tmpdir();
let resultsPath = 'results';

let currentTest;

function startRun(lResultsPath, options) {
	console.log('options', options)
    if (lResultsPath) resultsPath = lResultsPath;
    if (options.tmpdir) tmpdir = options.tmpdir;
	console.log("Temp directory: ", tmpdir);
}

function startTest(test) {
	currentTest = test;
}


function writeTmpResult(currentTestOutput) {
	console.log('writeTmpResult', tmpdir, currentTest.filename+'.txt')
    let resultFilePath = path.join(tmpdir, currentTest.filename+'.txt');
    console.log('writeTmpResult', resultFilePath)
    fs.writeFileSync(resultFilePath, currentTest.output);
}


function getAcceptedResult() {
    const acceptedFilePath = getAcceptedResultPath();
    let acceptedOutput;

    try {
    	console.log('getAcceptedResult')
        acceptedOutput = fs.readFileSync(acceptedFilePath, 'utf-8');
        console.log(acceptedOutput)
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