require('date-utils');
var fs = require('fs');

exports.getDate = function() {
    return (new Date().toFormat('YYYY-MM-DD HH24:MI:SS - '));
};

exports.arrayObjectIndexOf = function(myArray, searchTerm) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id === searchTerm) return i;
    }
    return -1;
};