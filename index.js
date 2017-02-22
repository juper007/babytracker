'use strict';

const Alexa = require('alexa-sdk');
const format = require('string-template');

const globalVal = require('./global-const');
const dbConn = require('./dbConn');
const message = require('./messageList');


exports.handler = function(event, context, callback){
    const alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.65e04a45-0576-415e-961a-34921aa523e5';    
    //alexa.dynamoDBTableName = 'BabyTracker';    
    alexa.registerHandlers(Handlers, babyNameHandlers, BirthdayHandlers, ZipCodeHandlers);    
    alexa.execute();    
};

const Handlers = {
    'initIntent' : function () {        
    	const userId = this.event.session.user.userId;
        var parent = this;
    	dbConn.getUserInfo(userId, function(error, UserStatus) {            
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                switch (UserStatus) {                        
                    case globalVal.UserInfoStatus.USERIDMISSING:                        
                        parent.emit('insertUserId');
                        break;
                    case globalVal.UserInfoStatus.BABYNAMEMISSING:                        
                        parent.handler.state = globalVal.states.BABYNAMEMODE;
                        parent.emitWithState('askBabyNameIntent');
                        break;
                    case globalVal.UserInfoStatus.BIRTHDAYMISSING:                        
                        parent.handler.state = globalVal.states.BIRTHDAYMODE;
                        parent.emitWithState('askBirthdayIntent');
                        break;
                    case globalVal.UserInfoStatus.ZIPCODEMISSING:                        
                        parent.handler.state = globalVal.states.ZIPCODEMODE;
                        parent.emitWithState('askZipCodeIntent');
                        break;
                    case globalVal.UserInfoStatus.COMPLETED:                        
                        parent.emit(':tell', message.message.registryComplete);
                        break;
                }    
            }
		});
	},
    'insertUserId' : function() {
        const userId = this.event.session.user.userId;
        var parent = this;
        dbConn.insertUserId(userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = globalVal.states.BABYNAMEMODE;
                parent.emitWithState('askBabyNameIntent');
            }                       
        });                 
    },
    'LogFormula': function () {
        const name = this.event.request.intent.slots.name.value;
        const amount = parseInt(this.event.request.intent.slots.amount.value);
        const unit = this.event.request.intent.slots.unit.value;
        
        const outputString = "Okay, I logged " + name + " ate " + amount + " " + unit + " of formula.";
        
        this.emit(':tell', outputString);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    }
};

const babyNameHandlers = Alexa.CreateStateHandler(globalVal.states.BABYNAMEMODE, {
    'askBabyNameIntent' : function() {
        this.emit(':ask', message.message.askBabyName);
    },
    'babyNameIntent' : function() {
        const name = this.event.request.intent.slots.name.value;        
        this.attributes['babyName'] = name;
        this.emit(':ask', format(message.message.babyNameConfirm, [name]));
    },
    'AMAZON.YesIntent' : function() {
        const name = this.attributes['babyName'];
        const userId = this.event.session.user.userId;
        var parent = this;
        dbConn.insertBabyName(name, userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = globalVal.states.BIRTHDAYMODE;
                parent.emitWithState('askBirthdayIntent');
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        this.emit('Unhandled');
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainBabyName);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    }
});


const BirthdayHandlers = Alexa.CreateStateHandler(globalVal.states.BIRTHDAYMODE, {
    'askBirthdayIntent' : function() {
        const name = this.attributes['babyName'];
        this.emit(':ask', format(message.message.askBirthday, [name]));       
    },
    'birthdayIntent' : function() {
        const birthday = this.event.request.intent.slots.date.value;
        const name = this.attributes['babyName'];
        this.attributes['birthday'] = birthday;
        this.emit(':ask', format(message.message.birthdayConfirm,[name, birthday]));
    },
    'AMAZON.YesIntent' : function() {
        const name = this.attributes['babyName'];
        const birthday = this.attributes['birthday'];
        const userId = this.event.session.user.userId;
        var parent = this;
        dbConn.insertBirthday(birthday, userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = globalVal.states.ZIPCODEMODE;
                parent.emitWith(':ask', message.message.askZipCode);       
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        this.emit('Unhandled');
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainBirthday);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    }
});


const ZipCodeHandlers = Alexa.CreateStateHandler(globalVal.states.ZIPCODEMODE, {
    'askZipCodeIntent' : function() {        
        this.emit(':ask', message.message.askZipCode);       
    },
    'zipcodeIntent' : function() {
        const zipcode = this.event.request.intent.slots.zipcode.value;                
        this.attributes['zipcode'] = zipcode;
        this.emit(':ask', format(message.message.zipCodeConfirm, [zipcode]));
    },
    'AMAZON.YesIntent' : function() {
        const userId = this.event.session.user.userId;
        const zipcode = this.attributes['zipcode'];
        var parent = this;
        dbConn.insertZipcode(zipcode, userId, function (error) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {                
                parent.emit(':tell', message.message.registryComplete);       
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        this.emit('Unhandled');
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainZipcode);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    }
});