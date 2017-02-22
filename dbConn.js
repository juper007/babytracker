'use strict';
var mysql = require('mysql');
var constVal = require('./global-const');
var option = {
	host : 'miniris.c788liamkeqr.us-east-1.rds.amazonaws.com',
	user : 'juper007',
	password : 'Redmond1!',
	database : 'BabyTracker'
};

exports.getUserInfo = function (userId, callback) {	
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('SELECT UserStatus FROM UserInfo Where UserID = ?', [userId] , function (error, results, fields) {		
		var userStatus;
		if (!error)	{
			if (results.length == 0) {
				userStatus = constVal.UserInfoStatus.USERIDMISSING;
			} else {
				userStatus = results[0].UserStatus;
			}	
		}
		callback(error, userStatus);
	});
};

exports.insertUserId = function (userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('INSERT INTO UserInfo (UserId, UserStatus) VALUES (?, 2)', [userId] , function(error, results, fields) {										
		callback(error);
	});	
};

exports.insertBabyName = function (name, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('UPDATE UserInfo SET BabyName = ?, UserStatus = 3 WHERE UserId = ?', [name, userId] , function(error, results, fields) {
		callback(error);
	});	
};

exports.insertBirthday = function (birthday, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('UPDATE UserInfo SET birthday = ?, UserStatus = 4 WHERE UserId = ?', [birthday, userId] , function(error, results, fields) {
		callback(error);
	});	
};

exports.insertZipcode = function (zipcode, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('UPDATE UserInfo SET Zipcode = ?, UserStatus = 0 WHERE UserId = ?', [zipcode, userId] , function(error, results, fields) {
		callback(error);
	});	
};