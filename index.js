'use strict';

var Alexa = require('alexa-sdk');
var globalVal = require('./global-const');
var dbConn = require('./dbConn');
var message = require('./messageList');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.65e04a45-0576-415e-961a-34921aa523e5';
    alexa.registerHandlers(Handlers, babyNameHandlers);
    alexa.execute();
};


var Handlers = {
    'initIntent' : function () {
    	var userId = this.event.session.user.userId;
        var parent = this;
    	dbConn.getUserInfo(userId, function(error, UserStatus) {
    		switch (UserStatus) {
    			case globalVal.UserInfoStatus.USERIDMISSING:
                    parent.emit('insertUserId');
    				break;
    			case globalVal.UserInfoStatus.BABYNAMEMISSING:
    				parent.emit(':tell', 'Hello World!');
    				break;
    			case globalVal.UserInfoStatus.BIRTHDAYMISSING:
    				parent.emit(':tell', 'Hello World!');
    				break;
    			case globalVal.UserInfoStatus.ZIPCODEMISSING:
    				parent.emit(':tell', 'Hello World!');
    				break;
    			case globalVal.UserInfoStatus.COMPLETED:
    				parent.emit(':tell', 'Hello World!');
    				break;
    		}
		});
	},
    'insertUserId' : function() {
        var userId = this.event.session.user.userId;
        var parent = this;
        dbConn.insertUserId(userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = globalVal.states.BABYNAMEMODE;
                parent.emit(':ask', message.message.askBabyName);       
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

var babyNameHandlers = Alexa.CreateStateHandler(globalVal.states.BABYNAMEMODE, {
    'babyNameIntent' : function() {
        var name = this.event.request.intent.slots.name.value;        
        this.attributes['babyName'] = name;
        this.emit(':ask', message.message.babyNameConfirm(name));
    },
    'AMAZON.YesIntent' : function() {
        var name = this.attributes['babyName'];
        var userId = this.event.session.user.userId;
        var parent = this;
        dbConn.insertBabyName(name, userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = globalVal.states.BIRTHDAYMODE;
                parent.emit(':ask', message.message.askBirthday(name));       
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        this.emit('Unhandled');
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainBabyName);
    }   
});


var BirthdayHandlers = Alexa.CreateStateHandler(globalVal.states.BIRTHDAYMODE, {
    'birthdayIntent' : function() {
        var birthday = new Date(this.event.request.intent.slots.date.value);
        var name = this.attributes['babyName'];
        this.attributes['birthday'] = birthday;
        this.emit(':ask', message.message.birthdayConfirm(name, 
            glovalVal.month[birthday.getUTCMonth()], birthday.getUTCDay(), birthday.getUTCFullYear()));
    },
    'AMAZON.YesIntent' : function() {
        var name = this.attributes['babyName'];
        var birthday = this.attributes['birthday'];
        var userId = this.event.session.user.userId;
        var parent = this;
        dbConn.insertBirthday(birthday, userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = globalVal.states.LOCATIONMODE;
                parent.emit(':ask', message.message.askLocation);       
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        this.emit('Unhandled');
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainBabyName);
    }   
});