'use strict';

var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var util = require('util');

var FacilityIndex = [
    'kern',
    'user',
    'mail',
    'daemon',
    'auth',
    'syslog',
    'lpr',
    'news',
    'uucp',
    'clock',
    'sec',
    'ftp',
    'ntp',
    'audit',
    'alert',
    'clock',
    'local0',
    'local1',
    'local2',
    'local3',
    'local4',
    'local5',
    'local6',
    'local7',
    'mark'
];

var SeverityIndex = [
    'emerg',
    'alert',
    'crit',
    'err',
    'error',
    'warn',
    'warning',
    'notice',
    'info',
    'debug',
    'none'
];

var Exclusions = ['mail.notice', 'mail.warning'];

var BSDDateIndex = {
    'Jan': 0,
    'Feb': 1,
    'Mar': 2,
    'Apr': 3,
    'May': 4,
    'Jun': 5,
    'Jul': 6,
    'Aug': 7,
    'Sep': 8,
    'Oct': 9,
    'Nov': 10,
    'Dec': 11
};


var Tail = function(path) { // File, Linea donde abre el tail default 10
    EventEmitter.call(this);
    this.filepath = path;

    var self = this;
    var tail = spawn('tail', ['-0f'].concat(path));
    var parsed = null;
    tail.stdout.on('data', function(data) {
        var lines = data.toString('utf-8');
        lines = lines.split('\n');
        lines.pop();
        lines.forEach(function(line) {
            parsed = self.parseLine(line);

            var showEmitter = true;
            var strTest = null;
            var regExp = null;
            Exclusions.forEach(function(expresion_regular) {
                regExp = new RegExp(expresion_regular);
                strTest = parsed.facility + '.' + parsed.severity;
                if (strTest.match(regExp) !== null) showEmitter = false;
                regExp = null;
            });
            if (showEmitter) {
                self.emit('updated', {
                    filename: path,
                    status: 'success',
                    msg: line,
                    parsed: parsed
                });
            }
        });
    });

    process.on('exit', function() {
        tail.kill();
    });
};
util.inherits(Tail, EventEmitter); // TAIL Hereda la clase EventEmitter

Tail.prototype.start = function(cb) {
    var parent = this;
    cb("Lectura del log [" + parent.filepath + "] inicializada.");
};

module.exports = function(path) {
    return new Tail(path);
};


Tail.prototype.parseLine = function(line) {
    var parsedMessage = {};
    var segments = line.split(' ');
    var timeStamp;
    var tmp;

    parsedMessage.type = 'RFC3164 - SOLARIS';
    parsedMessage.isparsed = true;
    if (segments[1] === '') segments.splice(1, 1);
    timeStamp = segments.splice(0, 3).join(' ').replace(/^(<\d+>)/, '');
    parsedMessage.time = this.parseBsdTime(timeStamp);
    parsedMessage.host = segments.shift();
    var message = segments.join(' ');
    try {
        parsedMessage.app = segments.shift().replace(/:$/, '');
        tmp = segments.join(' ').replace(/\].+/, '').replace(/^(\[ID\s)/, '').split(' ');
        parsedMessage.id = tmp.shift();
        tmp = tmp.shift().split('.');
        parsedMessage.facility = tmp.shift();
        parsedMessage.severity = tmp.shift();
        parsedMessage.severity = (parsedMessage.severity === 'err' ? 'error' : parsedMessage.severity);
        parsedMessage.severity = (parsedMessage.severity === 'warn' ? 'warning' : parsedMessage.severity);
        parsedMessage.message = segments.join(' ').replace(/^.+\] /, '');
        /**
         * Si no detecta facility o severity es un formato desconocido
         */
        if (FacilityIndex.indexOf(parsedMessage.facility) === -1 || SeverityIndex.indexOf(parsedMessage.severity) === -1)
            parsedMessage.message = message;
    } catch (err) {
        parsedMessage.isparsed = false;
        parsedMessage.id = '';
        parsedMessage.app = '';
        parsedMessage.facility = '';
        parsedMessage.severity = 'undefined';
        parsedMessage.message = message;
    }

    return (parsedMessage);
}

/*
 *  Attempts to parse a given timestamp
 *  @param {String} timeStamp Supplied timestamp, should only be the timestamp,
 *      not the entire message
 *  @return {Object} Date object on success
 */
Tail.prototype.parseTimeStamp = function(timeStamp) {

    if (typeof timeStamp != 'string') return;
    var parsedTime;

    parsedTime = this.parse8601(timeStamp);
    if (parsedTime) return parsedTime;

    parsedTime = this.parseRfc3339(timeStamp);
    if (parsedTime) return parsedTime;

    parsedTime = this.parseBsdTime(timeStamp);
    if (parsedTime) return parsedTime;

    return parsedTime;

};

/*
 *  Parse RFC3339 style timestamps
 *  @param {String} timeStamp
 *  @return {Date/false} Timestamp, if parsed correctly
 *  @see http://blog.toppingdesign.com/2009/08/13/fast-rfc-3339-date-processing-in-javascript/
 */
Tail.prototype.parseRfc3339 = function(timeStamp) { 
    var utcOffset, offsetSplitChar, offsetString,   offsetMultiplier = 1,
          dateTime = timeStamp.split("T");
    if (dateTime.length < 2) return false;

      
    var date = dateTime[0].split("-"),
          time = dateTime[1].split(":"),
          offsetField = time[time.length - 1];

      
    offsetFieldIdentifier = offsetField.charAt(offsetField.length - 1);  
    if (offsetFieldIdentifier === "Z") {  
        utcOffset = 0;    
        time[time.length - 1] = offsetField.substr(0, offsetField.length - 2);  
    } else {  
        if (offsetField[offsetField.length - 1].indexOf("+") != -1) {      
            offsetSplitChar = "+";      
            offsetMultiplier = 1;    
        } else {      
            offsetSplitChar = "-";      
            offsetMultiplier = -1;    
        }

            
        offsetString = offsetField.split(offsetSplitChar);
        if (offsetString.length < 2) return false;    
        time[(time.length - 1)] = offsetString[0];    
        offsetString = offsetString[1].split(":");    
        utcOffset = (offsetString[0] * 60) + offsetString[1];    
        utcOffset = utcOffset * 60 * 1000;  
    }          
    var parsedTime = new Date(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]) + (utcOffset * offsetMultiplier));  
    return parsedTime;
};

/*
 *  Parse "BSD style" timestamps, as defined in RFC3164
 *  @param {String} timeStamp
 *  @return {Date/false} Timestamp, if parsed correctly
 */
Tail.prototype.parseBsdTime = function(timeStamp) {
    var parsedTime;
    var currDate;
    var d = timeStamp.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (d) {
        // Years are absent from the specification, use this year
        currDate = new Date();
        parsedTime = new Date(
            currDate.getUTCFullYear(),
            BSDDateIndex[d[1]],
            d[2],
            d[3],
            d[4],
            d[5]);
    }

    return parsedTime;
};

/*
 *  Parse ISO 8601 timestamps
 *  @param {String} timeStamp
 *  @return {Object/false} Timestamp, if successfully parsed
 */
Tail.prototype.parse8601 = function(timeStamp) {
    var parsedTime = new Date(Date.parse(timeStamp));
    if (parsedTime.toString() === 'Invalid Date') return; //FIXME not the best
    return parsedTime;
};