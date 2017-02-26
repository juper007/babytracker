'use strict';

const Alexa = require('alexa-sdk');
const format = require('string-template');
const dateFormat = require('dateformat');

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
        console.log("initIntent fired");
    	const userId = this.event.session.user.userId;
        var parent = this;
    	dbConn.getUserInfo(userId, function(error, babyInfo) {
            if (error) {
                console.log("get User Info error.");
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.attributes['babyName'] = babyInfo.BabyName;                
                switch (babyInfo.UserStatus) {                        
                    case globalVal.UserInfoStatus.USERIDMISSING:                        
                        console.log("User Id Missing.");
                        parent.emit('insertUserId');
                        break;
                    case globalVal.UserInfoStatus.BABYNAMEMISSING:                        
                        parent.handler.state = globalVal.states.BABYNAMEMODE;
                        console.log("Chage Baby Name Mode");
                        parent.emitWithState('askBabyNameIntent');
                        break;
                    case globalVal.UserInfoStatus.BIRTHDAYMISSING:                        
                        parent.handler.state = globalVal.states.BIRTHDAYMODE;
                        console.log("Chage Birthday Mode");
                        parent.emitWithState('askBirthdayIntent');
                        break;
                    case globalVal.UserInfoStatus.ZIPCODEMISSING:                        
                        parent.handler.state = globalVal.states.ZIPCODEMODE;
                        console.log("Chage Zipcode Mode");
                        parent.emitWithState('askZipCodeIntent');
                        break;
                    case globalVal.UserInfoStatus.COMPLETED:                        
                        const cardTitle = 'Completed baby register.';
                        const cardContent = 'Thank you for using Baby Traker. You completed to regiter your baby, ' + babyInfo.BabyName + '. \n\n'
                            + 'Member ID: ' + babyInfo.UserInfo_Key + '\n'
                            + 'Baby Name: ' + babyInfo.BabyName + '\n'
                            + 'Birthday : ' + dateFormat(babyInfo.Birthday, 'mmmm d, yyyy') + '\n'
                            + 'Location : ' + babyInfo.CityName + ', ' + babyInfo.State + ' ' + babyInfo.Zipcode + '\n\n'
                            + 'If you the information is not correct, please send e-mail to me with correct information along with your member ID.';

                        parent.emit(':tellWithCard', message.message.registryComplete,cardTitle, cardContent);
                        break;
                }    
            }
		});
	},
    'insertUserId' : function() {
        console.log("insertUserId intent fired.");
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
    'Unhandled': function() {        
        this.emit(':ask', message.message.errorMessage);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    }
};

const babyNameHandlers = Alexa.CreateStateHandler(globalVal.states.BABYNAMEMODE, {
    'askBabyNameIntent' : function() {
        console.log("askBabyNameIntent fired");
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
        this.emit(':ask', message.message.askAgainBabyName);
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainBabyName);
    },
    'SessionEndedRequest': function () {
        this.handler.state = '';
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
                parent.emit(':ask', message.message.askZipCode);       
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        const name = this.attributes['babyName'];
        this.emit(':ask', format(message.message.askAgainBirthday, [name]));
    },
    'Unhandled': function() {
        const name = this.attributes['babyName'];
        this.emit(':ask', format(message.message.askAgainBirthday, [name]));
    },
    'SessionEndedRequest': function () {
        this.handler.state = '';
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
        const babyName = this.attributes['babyName'];
        const birthday = this.attributes['birthday'];
        var parent = this;
        dbConn.insertZipcode(zipcode, userId, function (error, babyInfo) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);       
            } else {
                parent.handler.state = '';

                const cardTitle = 'Completed baby register.';
                const cardContent = 'Thank you for using Baby Traker. You completed to regiter your baby, ' + BabyName + '. \n\n'
                    + 'Member ID: ' + babyInfo.UserInfo_Key + '\n'
                    + 'Baby Name: ' + babyInfo.BabyName + '\n'
                    + 'Birthday : ' + dateFormat(babyInfo.Birthday, 'mmmm d, yyyy') + '\n'
                    + 'Location : ' + babyInfo.CityName + ', ' + babyInfo.State + ' ' + babyInfo.Zipcode + '\n\n'
                    + 'If you the information is not correct, please send e-mail correct information along with your member ID.';

                parent.emit(':tellWithCard', message.message.registryComplete,cardTitle, cardContent);
            }                       
        });
    },
    'AMAZON.NoIntent' : function() {
        this.emit(':ask', message.message.askAgainZipcode);        
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.askAgainZipcode);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    }
});