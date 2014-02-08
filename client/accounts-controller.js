if (Meteor.isClient) {
	var validateNewAccount = function (event) {
		return;
		var elementClass = $(event.target).attr('class').split(" ");
		var elementName = elementClass[0];
		console.log("name: " + elementName + ", value: " + $(event.target).val()); 
			Meteor.call(
			'validateAccountStripe', 
			{name : elementName, value : $(event.target).val()},
			function (err) {
				if(err) {
					$("#" + elementName + "-error").text(err.reason).removeClass("hide");
				} else {
					$("#" + elementName + "-error").text("").addClass("hide");
				}
			}
		);	  
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
		'blur input': validateNewAccount,
		'blur textarea': validateNewAccount	 
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
