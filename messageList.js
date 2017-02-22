exports.error = {	
	errorMessage : `Sorry, I can\'t complete the order now. Please try later again.`
}

exports.message = {
	askBabyName : `What is your baby\'s name?`,
	askAgainBabyName : `Please tell your baby\'s name.`,
	babyNameConfirm: template`Your baby\'s name is ${0}, correct?`,
	askBirthday : template`When is ${0}\'s birthday?`,
	birthdayConfirm: template`${0}\'s birthday is ${1}, correct?`,
	askAgainBirthday: `Please tell ${0}\'s birthday.`,
	askZipCode: `What\'s your 5 digit zipcode?`,
	zipCodeConfirm: template`Your zipcode is ${0}, correct?`,
	askAgainZipcode: `Please tell your 5 digit zipcode`,
	registryComplete: `You are all set.`
}

function template(strings, ...keys) {
  return (function(...values) {
    var dict = values[values.length - 1] || {};
    var result = [strings[0]];
    keys.forEach(function(key, i) {
      var value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}