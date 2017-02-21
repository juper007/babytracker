'use strict';

var Alexa = require('alexa-sdk');
var constVal = require('./global-const');
var dbConn = require('./dbConn');
var message = require('./messageList');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'initIntent' : function () {
    	var userId = this.event.request.session.user.userId; 
    	dbConn.getUserInfo(userId, function(error, UserStatus) {
    		switch (UserStatus) {
    			case constVal.UserInfoStatus.USERIDMISSING:
    				dbConn.insertUserId(UserId, function (error) {
    					if (error) {
    						this.emit(':tell', message.error.errorMessage);		
    					} else {
    						this.emit(':ask', message.message.askBabyName);		
    					}    					
    				});    				
    				break;
    			case constVal.UserInfoStatus.BABYNAMEMISSING:
    				this.emit(':tell', 'Hello World!');
    				break;
    			case constVal.UserInfoStatus.BIRTHDAYMISSING:
    				this.emit(':tell', 'Hello World!');
    				break;
    			case constVal.UserInfoStatus.LOCATIONMISSING:
    				this.emit(':tell', 'Hello World!');
    				break;
    			case constVal.UserInfoStatus.COMPLETED:
    				this.emit(':tell', 'Hello World!');
    				break;
    		}
		});
		
	},
    'LogFormula': function () {
        var name = this.event.request.intent.slots.name.value;
        var amount = parseInt(this.event.request.intent.slots.amount.value);
        var unit = this.event.request.intent.slots.unit.value;
        
        var outputString = "Okay, I logged " + name + " ate " + amount + " " + unit + " of formula.";
        
        this.emit(':tell', outputString);
    }
};