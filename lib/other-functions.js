Meteor.otherFunctions = {
    validateInput : function (className) {
		var msgError = className.replace(/[-.]/g, ' ');
		if ($(className).val().length == 0) {
			$("form#payment-form").find('p.payment-errors').text("Invalid " + msgError).show();
			$('html, body').animate({ scrollTop: 0 }, 0);
			return false;
		} else {
		   $("form#payment-form").find('p.payment-errors').text("").hide();	
		   return true;				
		}
	}

}
