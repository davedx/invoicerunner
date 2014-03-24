if (Meteor.isClient) {
	var validateInput = function (className, formId) {
		var msgError = className.replace(/[-.]/g, ' ');
		var errorClass = "";
		if (formId == "payment-form"){
			errorClass = "payment-errors";	
		} else {
			errorClass = "editAccount-errors";
		}
		console.log("errorClass: " + errorClass);
		if ($(className).val().length == 0) {
			$("form#" + formId).find('p.' + errorClass).text("Please enter your " + msgError + ".").show();
			$('html, body').animate({ scrollTop: 0 }, 0);
			return false;
		} else {
		   $("form#" + formId).find('p.' + errorClass).text("").hide();	
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
			if (!validateInput('.company-name', 'payment-form')) {
				return;
			}
			if (!validateInput('.company-address', 'payment-form')) {
				return;
			}
			if (!validateInput('.card-expiry-month', 'payment-form')) {
				return;
			}
			if (!validateInput('.card-expiry-year', 'payment-form')) {
				return;
			}
			if (!validateInput('.card-holdername', 'payment-form')) {
				return;
			}
			if(!validateInput('.card-number', 'payment-form')) {
				return;
			}
			if(!validateInput('.card-cvc', 'payment-form')) {
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
	
	Template.edit_account.rendered = function() {
		var userDetails = Meteor.call("getUserDetails", {}, function(error, result) {
			if (error) {
				console.log(error.reason);
			} else {
				if (result.company_name.length > 0) {
					$(".company-name").val(result.company_name);
				}
				if (result.company_address.length > 0) {	
					$(".company-address").val(result.company_address);
				}
			}
		});
	};
	
	Template.edit_account.events ({
		'click .editaccount-btn': function(event) {
			
			event.preventDefault();
			
			if (!validateInput('.company-name', 'edit-form')) {
				return;
			}
			
			if (!validateInput('.company-address', 'edit-form')) {
				return;
			}
			Meteor.call(
				'updateAccount', 
				{
					company_name: $(".company-name").val(),
					company_address: $(".company-address").val(),
				}, 
				function (err){
					if(!err) {
						console.log("Success!");
						//Router.go('invoices');
						$("#edit-account-modal").show();
					} else {
						console.error(err);
					}
				}
			);
		},
		'click #to-invoices': function() {
			$('#edit-account-modal').remove();
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
