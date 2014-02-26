if (Meteor.isClient) {
	var validateInput = function (className) {
		var msgError = className.replace(/[-.]/g, ' ');
		if ($(className).val().length == 0) {
			$("form#payment-form").find('p.payment-errors').text("Please enter your " + msgError + ".").show();
			$('html, body').animate({ scrollTop: 0 }, 0);
			return false;
		} else {
		   $("form#payment-form").find('p.payment-errors').text("").hide();	
		   return true;				
		}
	}

	Template.new_account_stripe.events({
		'change .subscription': function (event) {
			var plans = [
				{ name: 'Professional', price: 19 },
				{ name: 'Small Business', price: 49 },
				{ name: 'Enterprise', price: 99 }
			];
			var plan = event.target.selectedIndex;
			$('#currentPlan').html(plans[plan].name);
			$('#currentPrice').html(plans[plan].price);
		},
		'click .newaccount-btn': function (event) {
						
			var translation = PaymillTranslations.getAll();
			
            event.preventDefault();

			if(!$('#terms').is(':checked')) {
				alert('Please confirm you have read the terms and conditions.');
				return;
			}
			
			if (!validateInput('.company-name')) {
				return;
			}
			if (!validateInput('.company-address')) {
				return;
			}
			if (!validateInput('.card-expiry-month')) {
				return;
			}
			if (!validateInput('.card-expiry-year')) {
				return;
			}
			if (!validateInput('.card-holdername')) {
				return;
			}
			if(!validateInput('.card-number')) {
				return;
			}
			if(!validateInput('.card-cvc')) {
				return;
			}
			$('.newaccount-btn').attr("disabled", "disabled");

			stripeAPI.upgradeAccount();
		},	
		'click #to-invoices': function() {
			$('#upload-account-modal').remove();
			Router.go('invoices');
		} 
	});
	
	AccountsController = RouteController.extend({
		template: 'accounts',

		new: function () {
			if(!Meteor.user() && !Meteor.loggingIn()) {
				return Router.go('freetrial');
			}

			var template = stripeAPI.enabled() ? 'new_account_stripe' : 'new_account';
			var bridge = stripeAPI.enabled() ? 'https://js.stripe.com/v2/' : 'https://bridge.paymill.com/';
			this.render(template);
			
			// bridge
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = bridge;
			script.onload = function () {
				console.log("Loaded bridge");
			}

			// Load the script tag
			var head = document.getElementsByTagName('head')[0];
			return head.appendChild(script);
		}
	});
}
