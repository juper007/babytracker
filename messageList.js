exports.error = {	
	errorMessage : `Sorry, I can\'t complete the order now. Please try later again.`
}

exports.message = {
	askBabyName : `What is your baby\'s name?`,
	askAgainBabyName : `Please tell your baby\'s name.`,
	babyNameConfirm: template`Your baby\'s name is ${0}, correct?`,
	askBirthday : `When is ${0}\'s birthday?`
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