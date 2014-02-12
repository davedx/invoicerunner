if (Meteor.isClient) {
	var validateNewAccount = function (event) {
		var elementName = $(event.target).attr('class').split(" ")[0];
		if($(event.target).val().length == 0) { 
			var msgError = "";
			if($(event.target).is("input"))
				msgError = "Invalid company name";
			else
				msgError= "Invalid address name";
			$("#" + elementName + "-error").text(msgError).removeClass("hide"); 
		} else {
		    $("#" + elementName + "-error").text("").addClass("hide");	
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

			if(!$('#terms').is(':checked')) {
				alert('Please confirm you have read the terms and conditions.');
				event.preventDefault();
				return;
			}
			
			if ($('input.card-expiry-month').val().length == 0) {
				alert('Invalid card expiry month');
				event.preventDefault();
				return;
			}
			if ($('input.card-expiry-year').val().length == 0) {
				alert('Invalid card expiry year');
				event.preventDefault();
				return;
			}
			if ($('input.card-holdername').val().length == 0) {
				alert('Invalid card name');
				event.preventDefault();
				return;
			}

			$('.newaccount-btn').attr("disabled", "disabled");

			stripeAPI.upgradeAccount();
			event.preventDefault();
		},				
		'blur .company-name': validateNewAccount,
		'blur .company-address': validateNewAccount
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
