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
    alexa.registerHandlers(Handlers, babyNameHandlers, BirthdayHandlers, ZipCodeHandlers);
    alexa.execute();
};

function timeConvert(time, offset) {
    return dateFormat(time.setHours(time.getHours() + offset), 'yyyy-mm-dd hh:MM:ss');
}

const Handlers = {
    'initIntent' : function () {
        console.log("initIntent fired");
    	const userId = this.event.session.user.userId;
        const parent = this;
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
                        console.log("Change Baby Name Mode");
                        parent.emitWithState('askBabyNameIntent');
                        break;
                    case globalVal.UserInfoStatus.BIRTHDAYMISSING:
                        parent.handler.state = globalVal.states.BIRTHDAYMODE;
                        console.log("Change Birthday Mode");
                        parent.emitWithState('askBirthdayIntent');
                        break;
                    case globalVal.UserInfoStatus.ZIPCODEMISSING:
                        parent.handler.state = globalVal.states.ZIPCODEMODE;
                        console.log("Change Zipcode Mode");
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
        const parent = this;
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
        const userId = this.event.session.user.userId;
        const name = this.event.request.intent.slots.name.value;
        const amount = parseInt(this.event.request.intent.slots.amount.value);
        const unit = this.event.request.intent.slots.unit.value;
        const time = dateFormat(new Date(this.event.request.timestamp), 'yyyy-mm-dd hh:MM:ss');        
        const parent = this;        
        dbConn.addFormula(userId, time, amount, unit, function(error, result) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);
            } else {
                if (result.affectedRows > 0) {
                    const outputString = "Okay, I logged " + name + " ate " + amount + " " + unit + " of formula.";
                    parent.emit(':tell', outputString);
                }                
                else {
                    parent.emit(':tell', 'You need to register first. Please ask Baby tracker to start to tracking.');
                }
            }
        });
    },
    'LastFormula': function () {
        const userId = this.event.session.user.userId;
        const name = this.event.request.intent.slots.name.value;        
        const currentTime = new Date(this.event.request.timestamp);
        const parent = this;                
        dbConn.getLastFormula(userId, function(error, formulaInfo) {
            if (error) {
                parent.emit(':tell', message.error.errorMessage);
            } else {
                if (formulaInfo.UserStatus == 0) {
                    if (formulaInfo.TimeStamp == null) {
                        parent.emit(':tell', name + ' never ate formula yet.');
                    } else {
                        const timeDiff = Math.floor((currentTime - new Date(formulaInfo.TimeStamp)) / 1000);
                        const durationDay = Math.floor(timeDiff / (24 * 60 * 60));
                        const durationHour = Math.floor(timeDiff / (60 * 60));
                        const durationMin = Math.floor(timeDiff / 60);

                        let convertedTime = timeConvert(formulaInfo.TimeStamp, formulaInfo.Offset);

                        let timeDurationString = '';
                        if (durationDay > 0) timeDurationString = timeDurationString + durationDay + ' days ';
                        if (durationHour > 0) timeDurationString = timeDurationString + durationHour + ' hours ';
                        timeDurationString = timeDurationString + durationMin + ' minutes ago';
                        const outputString = format("The last time {0} ate formulas was {1}, about {2}.", name, convertedTime, timeDurationString);
                        parent.emit(':tell', outputString);
                    }                    
                } else {
                    parent.emit(':tell', 'You need to register first. Please ask Baby tracker to start to tracking.');
                }
            }
        });        
    },
    'Unhandled': function() {        
        this.emit(':ask', message.message.errorMessage);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');        
    },
    'AMAZON.CancelIntent': function() {
        this.handler.state = '';
        console.log('session Canceled!');
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
        const parent = this;
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
    },
    'AMAZON.CancelIntent': function () {
        this.handler.state = '';
        console.log('session Canceled!');
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
        const parent = this;
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
    },
    'AMAZON.CancelIntent': function () {
        this.handler.state = '';
        console.log('session Canceled!');
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
        const parent = this;
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
    },
    'AMAZON.CancelIntent': function (){
        this.handler.state = '';
        console.log('session Canceled!');
    }
});