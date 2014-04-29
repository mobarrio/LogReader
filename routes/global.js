var fs = require('fs');

exports.Port = "8080";
if (fs.existsSync('.dev')) {
    exports.IP = '192.168.152.31';
    exports.jobsched = '00 */10 * * * *';
} else {
    exports.IP = 'srace.herokuapp.com';
    exports.jobsched = '00 */10 * * * *';
}