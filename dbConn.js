'use strict';
var mysql = require('mysql');
var format = require('string-template');
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
	let query = format('SELECT BabyName, Birthday, Zipcode, UserStatus FROM UserInfo Where UserID = "{0}"', userId);
	console.log(query);
	console.log(query);
	connection.query(query, function (error, results, fields) {		
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
	let query = format('INSERT INTO UserInfo (UserId, UserStatus) VALUES ("{0}", 2)', userId);
	console.log(query);
	connection.query(query, function(error, results, fields) {	
		connection.end();
		callback(error);
	});	
};

exports.insertBabyName = function (name, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	let query = format('UPDATE UserInfo SET BabyName = "{0}", UserStatus = 3 WHERE UserId = "{1}"', name, userId);
	console.log(query);
	connection.query(query, function(error, results, fields) {
		connection.end();
		callback(error);
	});	
};

exports.insertBirthday = function (birthday, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	let query = format('UPDATE UserInfo SET birthday = "{0}", UserStatus = 4 WHERE UserId = "{1}"', birthday, userId);
	console.log(query);
	connection.query(query, function(error, results, fields) {
		connection.end();
		callback(error);
	});	
};

exports.insertZipcode = function (zipcode, userId, callback) {
	var connection = mysql.createConnection(option);
	connection.connect();
	let query = format('UPDATE UserInfo as a LEFT JOIN Location as b on a.UserId = "{0}" and b.Zipcode = {1} LEFT JOIN TimeZone as c on b.TimeZone = c.TimeZone SET a.Zipcode = {1}, a.UserStatus = 0, a.CityName = b.CityName, a.State = b.State, a.TimeZone_Id = c.TimeZone_Id;', userId, zipcode);
	console.log(query);
	connection.query(query, function(error, results, fields) {
		connection.end();
		callback(error);
	});		
};