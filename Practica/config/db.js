"use strict";

const mysql = require('mysql');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'flota_electricos_db',
    connectionLimit: 10
});

module.exports = pool;