'use strict';

var Alexa = require('alexa-sdk');
var constVal = require('./global-const');
var dbConn = require('./dbConn');
var message = require('./messageList');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.65e04a45-0576-415e-961a-34921aa523e5';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'initIntent' : function () {
    	var userId = this.event.session.user.userId;
        var parent = this;
    	dbConn.getUserInfo(userId, function(error, UserStatus) {
    		switch (UserStatus) {
    			case constVal.UserInfoStatus.USERIDMISSING:
    				dbConn.insertUserId(userId, function (error) {
    					if (error) {
    						parent.emit(':tell', message.error.errorMessage);		
    					} else {
    						parent.emit(':ask', message.message.askBabyName);		
    					}    					
    				});    				
    				break;
    			case constVal.UserInfoStatus.BABYNAMEMISSING:
    				parent.emit(':tell', 'Hello World!');
    				break;
    			case constVal.UserInfoStatus.BIRTHDAYMISSING:
    				parent.emit(':tell', 'Hello World!');
    				break;
    			case constVal.UserInfoStatus.LOCATIONMISSING:
    				parent.emit(':tell', 'Hello World!');
    				break;
    			case constVal.UserInfoStatus.COMPLETED:
    				parent.emit(':tell', 'Hello World!');
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