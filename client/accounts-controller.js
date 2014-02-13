if (Meteor.isClient) {
	
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
			
			if (!Meteor.otherFunctions.validateInput('.company-name')) {
				return;
			}
			if (!Meteor.otherFunctions.validateInput('.company-address')) {
				return;
			}
			if (!Meteor.otherFunctions.validateInput('.card-expiry-month')) {
				return;
			}
			if (!Meteor.otherFunctions.validateInput('.card-expiry-year')) {
				return;
			}
			if (!Meteor.otherFunctions.validateInput('.card-holdername')) {
				return;
			}
			$('.newaccount-btn').attr("disabled", "disabled");

			stripeAPI.upgradeAccount();
		},	
		'blur input.company-name': function(event) {
				Meteor.otherFunctions.validateInput('.company-name');
		},
		'blur textarea.company-address': function(event) {
				Meteor.otherFunctions.validateInput('.company-address');
		},
		'blur input.card-expiry-month': function(event) {
				Meteor.otherFunctions.validateInput('.card-expiry-month');
		},
		'blur input.card-expiry-year': function(event) {
				Meteor.otherFunctions.validateInput('.card-expiry-year');
		},	
		'blur input.card-holdername': function(event) {
				Meteor.otherFunctions.validateInput('.card-holdername');
		}, 
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
