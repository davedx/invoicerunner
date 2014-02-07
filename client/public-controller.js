if (Meteor.isClient) {

  Template.public_layout.rendered = function() {
    $('#signup-link').click(function(e) {
      console.log("Signup link clicked");
      e.preventDefault();
    });
    $('body').addClass('public-body');
  };
  
  Template.public_home.events({
    'click .freetrial-go': function (e) {
      Router.go('freetrial');
    },
  });
  
  Template.public_freetrial.events({
    'click .freetrial-btn': function (event) {	
      console.log("submitting form");
      form={};
      $.each($(event.target).closest('form').serializeArray(), function() {
          form[this.name] = this.value;
      });
      form.profile = {
        accountType: 'trial'
      };
      console.log(form);
		if(!$('#terms').is(':checked')) {
        alert('Please confirm you have read the terms and conditions.');
        event.preventDefault();
        return false;
		}	
	  Meteor.call('validateEmail', {email: $("#verifyEmail").val()}, function (err) {
		if(err) {
		  console.log("Invalid email");
		} else {	
        Accounts.createUser(form, function (err) {
          if(err) {
		    console.error("Error creating user: ", err);
          } else {	
            Router.go('invoices');
          }
        });
        }
      });
     event.preventDefault();
     },
    'blur #verifyEmail': function (event) {
	  Meteor.call('validateEmail', {email: $("#verifyEmail").val()}, function (err) {
		if(err) {
			$("span.error").removeClass("hide");
			//console.log(err);
		} else {
			$("span.error").addClass("hide");
		}
	   });	
	  }   
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
    
    public_cancelaccount: function () {
      this.render('public_cancelaccount');

      this.render(
        'publicFooter', { to: 'footer', waitOn: false, data: false }
      );
    }
  });
}
