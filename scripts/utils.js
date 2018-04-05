#!/usr/bin/env node
/**
 *
 * utils.js
 *
 * Utility functions for genome-report file organization and such.
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    path = require('path'),
    process = require('process'),
    Promise = require("bluebird");

const config = require('../config.json');


const writeFile = Promise.promisify(fs.writeFile),
    readFile = Promise.promisify(fs.readFile);


const requestOpts = {
    json: true,
    headers: {
      "content-type": "application/json",
      "authorization": null
    }
}


function createGenomeDir(id) {
    let baseDir = path.resolve(`${config.reportDir}`);

    // create reports directory if needed
    if (!fs.existsSync(baseDir)){
        console.log(`\ncreating genome directory ${baseDir} ...` )
        fs.mkdirSync(baseDir);
    }

    // create genome directory if needed
    let genomeDir = path.resolve(`${baseDir}/${id}/`);
    if (!fs.existsSync(genomeDir)){
        console.log(`creating genome dir ${genomeDir} ...` )
        fs.mkdirSync(genomeDir);
    }

    return genomeDir;
}



function helpers(handlebars) {

    // helper to format base pairs to Bps, Kbps, etc.
    handlebars.registerHelper('basePairs', function(number, precision) {
        if (number == null) return '0 Bp';

        if (isNaN(number)) {
            number = number.length;
            if (!number) return '0 Bp';
        }

        if (isNaN(precision)) {
            precision = 2;
        }

        var abbr = ['Bp', 'Kbps', 'Mbp', 'Gb'];
        precision = Math.pow(10, precision);
        number = Number(number);

        var len = abbr.length - 1;
        while (len-- >= 0) {
            var size = Math.pow(10, len * 3);
            if (size <= (number + 1)) {
                number = Math.round(number * precision / size) / precision;
                number += ' ' + abbr[len];
                break;
            }
        }

        return number;
    })

    // returns specified value (given key) from list of objects
    // if name in object matches "match"
    handlebars.registerHelper('get', function(key, match, objs, defaultStr) {
        if (objs === undefined)
            return (typeof undefinedStr !== 'object' ? undefinedStr : '-');

        return objs.filter(o => o.name === match)[0][key];
    })


    handlebars.registerHelper('default', function(item, str) {
        return item ? item : str;
    })

    // modify helpers version
    handlebars.registerHelper('addCommas', function(num, undefinedStr) {
        if (num === undefined)
            return (typeof undefinedStr !== 'object' ? undefinedStr : '-');

        return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    })
}

function parseToken(token) {
    var dataArr = token.split('|');
    var keyValueArr = [];
    var dataobj =  {};
    for (var i = 0; i < dataArr.length; i++) {
        keyValueArr = dataArr[i].split('=');
        dataobj[keyValueArr[0]] = keyValueArr[1];
    }

    return dataobj;
}


module.exports = {
    createGenomeDir,
    writeFile,
    readFile,
    helpers,
    parseToken,
    requestOpts
}