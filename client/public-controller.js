if (Meteor.isClient) {

  Template.public_layout.rendered = function() {
    $('#signup-link').click(function(e) {
      e.preventDefault();
    });
    var scrollToFreeTrial = function() {
      $('html, body').animate({
          scrollTop: $("#freetrialAnchor").offset().top
      }, 600);      
    };
    var parts = window.location.href.split('#');
    if(parts.length > 1 && parts[1] === 'freetrial') {
      scrollToFreeTrial();
    } else {
      $('html, body').scrollTop(0);
    }
    $('.freeTrialLink').click(function() {
      scrollToFreeTrial();
    });
    $('body').addClass('public-body');
    
    if(Meteor.user()) {
		if ($("#editAccount").length == 0) {
			$('#login-buttons-logout').before('<div id="login-buttons-open-change-password" class="login-button"><a href="javascript:void(0)" id="editAccount">Edit account</a></div>');
		}
	}
  };
  
  Template.public_layout.events ({
	  'click #editAccount': function () {
		  Router.go('accounts/edit'); 	 
	   }
  });
  
  Template.public_home.events({
    'click .freetrial-go': function (e) {
      Router.go('freetrial');
    },
  });
  
   var validateEmail = function(callback) {
	   var emailToValidate = $("#verifyEmail").val();	   
	   if (emailToValidate) {
		   Meteor.call('validateEmail', {email: emailToValidate}, function (err) {
			if(err) {
				$("span.error").removeClass("hide");
			} else {
				$("span.error").addClass("hide");
				if(callback) {
				   callback();
				}
			}
		   });
	   }
	}    	
  
  Template.public_home.events({
    'click .freetrial-btn': function (event) {
      event.preventDefault();
      form={};
      $.each($(event.target).closest('form').serializeArray(), function() {
          form[this.name] = this.value;
      });
      form.profile = {
        accountType: 'trial'
      };
  		if(!$('#terms').is(':checked')) {
          alert('Please confirm you have read the terms and conditions.');
          return false;
  		}
  		validateEmail( 	
			function() { 
				Accounts.createUser(form, function (err) {
					if(err) {
						alert("Error creating user: " + err.reason);
						return false;
					} else {
						Router.go('invoices');
					}
				});
			}
		);
    },
    'blur #verifyEmail':validateEmail,
  });

  Template.public_shortlist.events({
    'click .btn-beta-signup': function (event) {
      form={};
      $.each($(event.target).closest('form').serializeArray(), function() {
          form[this.name] = this.value;
      });

      Meteor.call('addToMailList', { email: form.shortlist_email }, function (err) {
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

  PublicController = RouteController.extend({
    template: 'public_home',
    layout: 'public_layout',

    public_home: function () {
      this.render('public_home');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },

    public_pricing: function () {
      this.render('public_pricing');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },

    public_freetrial: function () {
      this.render('public_freetrial');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },
    
    edit_account: function () {
      this.render('edit_account');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },

    public_shortlist: function () {
      this.render('public_shortlist');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },

    public_termsandconditions: function () {
      this.render('public_termsandconditions');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },

    public_privacypolicy: function () {
      this.render('public_privacypolicy');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },
    
    public_support: function () {
      this.render('public_support');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    },
    
    public_cancelaccount: function () {
      this.render('public_cancelaccount');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    }
  });
}
