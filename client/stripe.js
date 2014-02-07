if(Meteor.isClient) {
	window.stripeAPI = (function() {
		return {
			enabled: function() {
				return true;
			},

			upgradeAccount: function() {
				var pubKeyTest = 'pk_test_9jjjjUREHNkG6NIodt9trYT9';
				var pubKeyLive = 'pk_live_wGCdMVYQlIW2WESc0v9Cy63v';

			  Stripe.setPublishableKey(pubKeyLive);
			  var $form = $('#payment-form');
		    Stripe.card.createToken($form, function(status, response) {
					var $form = $('#payment-form');
				  if (response.error) {
				    // Show the errors on the form
				    $form.find('.payment-errors').text(response.error.message);
				    $form.find('.payment-errors').show();
				    $form.find('button').prop('disabled', false);
				  } else {
            form={};
            $.each($form.serializeArray(), function() {
                form[this.name] = this.value;
            });
            form.ccToken = response.id;
            form.subscriptionIndex = $('.subscription').get(0).selectedIndex;
            console.log(form);
            Meteor.call('upgradeAccountStripe', form, function (err, account) {
              if(!err) {
                console.log("Success!");
                Router.go('invoices');
              } else {
                console.error(err);
              }
            });
				  }
		    });
			}
		};
	})();
}