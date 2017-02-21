'use strict';
const mysql = require('mysql');
const constVal = require('./global-const');
const option = {
	host : 'miniris.c788liamkeqr.us-east-1.rds.amazonaws.com',
	user : 'juper007',
	password : 'Redmond1!',
	database : 'BabyTracker'
};

exports.getUserInfo = function (userId, callback) {	
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('SELECT UserStatus FROM UserInfo Where UserID = ?', [userId] , (error, results, fields) => {								
		var userStatus;
		if (!error)	{
			if (results.length == 0) {
				userStatus = constVal.UserInfoStatus.USERIDMISSING;
			} else {
				userStatus = results[0].row.UserStatus;
			}	
		}
		callback(error, userStatus);
	});
};
