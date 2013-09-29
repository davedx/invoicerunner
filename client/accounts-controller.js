if (Meteor.isClient) {
  Template.new_account.events({
    'click .submit-btn': function (event) {

      $('.submit-btn').attr("disabled", "disabled");
      var formlang = 'en';
      if (false == paymill.validateCardNumber($('.card-number').val())) {
        $(".payment-errors").text(translation[formlang]["error"]["invalid-card-number"]);
        $(".payment-errors").css("display","inline-block");
        $(".submit-button").removeAttr("disabled");
      }
      if (false == paymill.validateExpiry($('.card-expiry-month').val(), $('.card-expiry-year').val())) {
        $(".payment-errors").text(translation[formlang]["error"]["invalid-card-expiry-date"]);
        $(".payment-errors").css("display","inline-block");
        $(".submit-button").removeAttr("disabled");
      }

      if ($('.card-holdername').val() == '') {
        $(".payment-errors").text(translation[formlang]["error"]["invalid-card-holdername"]);
        $(".payment-errors").css("display","inline-block");
        $(".submit-button").removeAttr("disabled");
      }
      var params = {
        amount_int: 0, // E.g. "15" for 0.15 Eur
        currency: 'EUR', // ISO 4217 e.g. "EUR"
        number: $('.card-number').val(),
        exp_month: $('.card-expiry-month').val(),
        exp_year: $('.card-expiry-year').val(),
        cvc: $('.card-cvc').val(),
        cardholder: $('.card-holdername').val()
      };

      window.PAYMILL_PUBLIC_KEY = '60315688593e60a65c42b6b99aef837c';
      paymill.createToken(params, function (error, result) {
        if (error) {
          console.log("Error: ", error);
          // Shows the error above the form
          $(".payment-errors").text(error.apierror);
          $(".submit-button").removeAttr("disabled");
        } else {
          console.log("OK");
          form={};
          $.each($(event.target).closest('form').serializeArray(), function() {
              form[this.name] = this.value;
          });
          form.ccToken = result.token;
          console.log(form);

          Meteor.call('createAccount', form,
            function (error, invoice) {
              if (!error) {
                console.log("It worked!");
              }
          });
          event.preventDefault();
        }
      });
    }
  });

  AccountsController = RouteController.extend({
    template: 'accounts',

    new: function () {
      this.render('new_account');
      
      //paymill bridge
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://bridge.paymill.com/';
      script.onload = function () {
        console.log("Loaded paymill");
      }

      //Load the script tag
      var head = document.getElementsByTagName('head')[0];
      return head.appendChild(script);
    }
  });
}
