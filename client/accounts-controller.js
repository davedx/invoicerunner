if (Meteor.isClient) {
  Template.new_account_stripe.events({
    'change .subscription': function (event) {
      var plans = [
        { name: 'professional', price: 19 },
        { name: 'company', price: 49 },
        { name: 'enterprise', price: 99 }
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

      $('.newaccount-btn').attr("disabled", "disabled");
      var formlang = 'en';
      var ok = true;
      /*
      if (false == paymill.validateCardNumber($('.card-number').val())) {
        $(".payment-errors").text(translation[formlang]["error"]["invalid-card-number"]);
        $(".payment-errors").css("display","inline-block");
        $(".newaccount-btn").removeAttr("disabled");
        ok = false;
      }
      if (false == paymill.validateExpiry($('.card-expiry-month').val(), $('.card-expiry-year').val())) {
        $(".payment-errors").text(translation[formlang]["error"]["invalid-card-expiry-date"]);
        $(".payment-errors").css("display","inline-block");
        $(".newaccount-btn").removeAttr("disabled");
        ok = false;
      }
      if ($('.card-holdername').val() == '') {
        $(".payment-errors").text(translation[formlang]["error"]["invalid-card-holdername"]);
        $(".payment-errors").css("display","inline-block");
        $(".newaccount-btn").removeAttr("disabled");
        ok = false;
      }
      */
      var params = {
        amount_int: 0, // E.g. "15" for 0.15 Eur
        currency: 'EUR', // ISO 4217 e.g. "EUR"
        number: $('.card-number').val(),
        exp_month: $('.card-expiry-month').val(),
        exp_year: $('.card-expiry-year').val(),
        cvc: $('.card-cvc').val(),
        cardholder: $('.card-holdername').val()
      };
      if(!ok) {
        event.preventDefault();
        return;
      }
      //console.log("Creating paymill token");
      var stripe = true;
      if(stripe) {
        stripeAPI.upgradeAccount();
        event.preventDefault();
      } else {
        window.PAYMILL_PUBLIC_KEY = '60315688593e60a65c42b6b99aef837c';
        paymill.createToken(params, function (error, result) {
          if (error) {
            console.log("Error: ", error);
            // Shows the error above the form
            $(".payment-errors").text(translation[formlang][error][error.apierror]);
            $(".payment-errors").show();
            $(".submit-button").removeAttr("disabled");
            event.preventDefault();
          } else {
            console.log("OK");
            form={};
            $.each($(event.target).closest('form').serializeArray(), function() {
                form[this.name] = this.value;
            });
            form.ccToken = result.token;
            form.subscriptionIndex = $('.subscription').get(0).selectedIndex;
            console.log(form);

            Meteor.call('upgradeAccount', form, function (err, account) {
	        if(!err) {
                console.log("Success!");
                Router.go('invoices');
              } else {
                console.error(err);
              }
            });
            event.preventDefault();
          }
        });
      }
    },				
     'blur input': function (event) {
		console.log("name: " + $(event.target).attr('name') + ", value: " + $(event.target).val()); 
	    Meteor.call('validateAccountStripe', {
		   name : $(event.target).attr('name'), value : $(event.target).val(),
		   },
	   function (err) {
	   var elementName = $(event.target).attr("name");
	   if(err) {
		 $("#" + elementName + "_error").text(err.reason).removeClass("hide");
         
		 } else {
		$("#" + elementName + "_error").text("").addClass("hide");
		}
	  });
  },
	  
	  'blur textarea': function (event) {
		console.log("name: " + $(event.target).attr('name') + ", value: " + $(event.target).val()); 
	    Meteor.call('validateAccountStripe', {
		   name : $(event.target).attr('name'), value : $(event.target).val(),
		   },
	   function (err) {
	   var elementName = $(event.target).attr("name");
	   if(err) {
		 $("#" + elementName + "_error").text(err.reason).removeClass("hide");
		 } else {
		$("#" + elementName + "_error").text("").addClass("hide");
		}
	   });	
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
