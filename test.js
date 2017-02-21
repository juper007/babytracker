'use strict';

const dbConn = require('./dbConn');
var constVal = require('./global-const');
var message = require('./messageList');

var userId = "aaa";

dbConn.getUserInfo(userId, function(error, UserStatus) {
	switch (UserStatus) {
		case constVal.UserInfoStatus.USERIDMISSING:
			dbConn.insertUserId(userId, function (error) {
				if (error) {
					console.log(message.error.errorMessage);
				} else {
					console.log(message.message.askBabyName);
				}
			});
			break;
		case constVal.UserInfoStatus.BABYNAMEMISSING:
			console.log('Hello World!');
			break;
		case constVal.UserInfoStatus.BIRTHDAYMISSING:
			console.log('Hello World!');
			break;
		case constVal.UserInfoStatus.LOCATIONMISSING:
			console.log('Hello World!');
			break;
		case constVal.UserInfoStatus.COMPLETED:
			console.log('Hello World!');
			break;
	}
});

