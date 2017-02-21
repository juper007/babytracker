'use strict';

const Alexa = require('alexa-sdk');
const constVal = require('./global-const');
const dbConn = require('./dbConn');

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
    			case constVal.UserStatus.USERIDMISSING
    			case constVal.UserStatus.BABYNAMEMISSING
    			case constVal.UserStatus.BIRTHDAYMISSING
    			case constVal.UserStatus.LOCATIONMISSING
    			case constVal.UserStatus.COMPLETED
    		}
		});
		this.emit(':tell', 'Hello World!');
	},
    'LogFormula': function () {
        var name = this.event.request.intent.slots.name.value;
        var amount = parseInt(this.event.request.intent.slots.amount.value);
        var unit = this.event.request.intent.slots.unit.value;
        
        var outputString = "Okay, I logged " + name + " ate " + amount + " " + unit + " of formula.";
        
        this.emit(':tell', outputString);
    }
};