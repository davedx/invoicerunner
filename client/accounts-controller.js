if (Meteor.isClient) {
	var checkLength = function(event) {
	 	if ($(event.target).val().length > 0) {
			$("form#payment-form").find('p.payment-errors').text("").hide();				
			event.preventDefault();				
			return;	
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
			if ($('input.company-name').val().length == 0) {
				$("form#payment-form").find('p.payment-errors').text("Invalid company name").show();
				$('html, body').animate({ scrollTop: 0 }, 0);
				event.preventDefault();				
				return;
			}
			if ($('textarea.company-address').val().length == 0) {
				$("form#payment-form").find('p.payment-errors').text("Invalid company address").show();
				$('html, body').animate({ scrollTop: 0 }, 0);
				event.preventDefault();				
				return;
			}
			if ($('input.card-expiry-month').val().length == 0) {
				$("form#payment-form").find('p.payment-errors').text("Invalid card month").show();
				$('html, body').animate({ scrollTop: 0 }, 0);
				event.preventDefault();				
				return;
			}
			if ($('input.card-expiry-year').val().length == 0) {
				$("form#payment-form").find('p.payment-errors').text("Invalid card year").show();
				$('html, body').animate({ scrollTop: 0 }, 0);
				event.preventDefault();				
				return;
			}
			if ($('input.card-holdername').val().length == 0) {
				$("form#payment-form").find('p.payment-errors').text("Invalid card name").show();
				$('html, body').animate({ scrollTop: 0 }, 0);
				event.preventDefault();				
				return;
			}

			$('.newaccount-btn').attr("disabled", "disabled");

			stripeAPI.upgradeAccount();
			event.preventDefault();
		},	
		'blur input.company-name': checkLength,
		'blur textarea.company-address': checkLength,
		'blur input.card-expiry-month': checkLength,
		'blur input.card-expiry-year': checkLength,	
		'blur input.card-holdername': checkLength	
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
