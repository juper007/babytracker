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
	connection.query('SELECT BabyName, Birthday, Zipcode, UserStatus FROM UserInfo Where UserID = ?', [userId] , function (error, results, fields) {		
		console.log(results);
		connection.end();
		var userInfo = { 
			BabyName : '',
			UserStatus : '',
			birthday : '',
			Zipcode : ''
		};
		if (!error)	{
			if (results.length == 0) {
				userInfo.UserStatus = constVal.UserInfoStatus.USERIDMISSING;
			} else {
				userInfo = results[0];
			}	
		}
		callback(error, userInfo);
	});
};

exports.insertUserId = function (userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('INSERT INTO UserInfo (UserId, UserStatus) VALUES (?, 2)', [userId], function(error, results, fields) {										
		connection.end();
		callback(error);
	});	
};

exports.insertBabyName = function (name, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('UPDATE UserInfo SET BabyName = ?, UserStatus = 3 WHERE UserId = ?', [name, userId], function(error, results, fields) {
		connection.end();
		callback(error);
	});	
};

exports.insertBirthday = function (birthday, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	connection.query('UPDATE UserInfo SET birthday = ?, UserStatus = 4 WHERE UserId = ?', [birthday, userId], function(error, results, fields) {
		connection.end();
		callback(error);
	});	
};

exports.insertZipcode = function (zipcode, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();

	connection.query('UPDATE UserInfo SET Zipcode = ?, UserStatus = 0 WHERE UserId = ?;' +
		'UPDATE UserInfo as a ' +
		'LEFT JOIN Location as b on a.Zipcode = b.Zipcode ' +
    	'LEFT JOIN TimeZone as c on b.TimeZone = c.TimeZone ' +
		'set a.CityName = b.CityName, a.State = b.State, a.TimeZone_Id = c.TimeZone_Id;', [zipcode, userId], function(error, results, fields) {
		connection.end();
		callback(error);
	});	
};