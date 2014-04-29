"use strict";

require('date-utils');

var fs = require('fs');

function LogReader(cfg) {
    this.bite_size = cfg.bite_size || 256;
    this.readbytes = cfg.readbytes || 0;
    this.interval = cfg.interval || 3000;
    this.filename = cfg.filename || null;
    this.fd = null;
    // console.log('LogReader instanciado.');
}

LogReader.prototype.readLog = function(parent) {
    if (!parent.fd) return;
    var stats = fs.fstatSync(parent.fd);
    if (stats.size < parent.readbytes + 1) {
        setTimeout(function() {
            LogReader.prototype.readLog(parent)
        }, parent.interval);
    } else {
        fs.read(parent.fd, new Buffer(parent.bite_size), 0, parent.bite_size, parent.readbytes, function(err, bytecount, buff) {
            process.emit('updated', {
                filename: parent.filename,
                status: 'success',
                interval: parent.interval,
                readbytes: parent.readbytes,
                msg: buff.toString('utf-8', 0, bytecount)
            });
            parent.readbytes += bytecount;
            process.nextTick(function() {
                LogReader.prototype.readLog(parent);
            });
        });
    }
};

LogReader.prototype.start = function(cb) {
    var parent = this;
    fs.open(parent.filename, 'r', function(err, fd) {
        fs.fstat(fd, function(err, stats) {
            parent.fd = fd;
            parent.readbytes = stats.size;
            LogReader.prototype.readLog(parent);
            cb("Lectura del log " + parent.filename + " inicializada.");
        });
    });
};

module.exports = LogReader;