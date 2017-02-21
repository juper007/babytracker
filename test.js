'use strict';

const dbConn = require('./dbConn');

dbConn.getUserInfo("aaa", (error, UserStatus) => {
	console.log(UserStatus);
});

