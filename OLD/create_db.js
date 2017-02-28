var config = require('./../config'),
    mysql = require('mysql');

var sql = mysql.createConnection({
    host     : config.HOST,
    user     : config.USER,
    password : config.PASS,
    database : config.DB,
    multipleStatements: true
});


