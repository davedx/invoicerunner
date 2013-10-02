if (Meteor.isClient) {

  Template.public_home.events({
    'click .freetrial-go': function (e) {
      Router.go('freetrial');
    },
    'click .external-link': function (e) {
      console.log("going..");
    }
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

      Accounts.createUser(form, function (err) {
        if(err) {
          console.error("Error creating user: ", err);
        } else {
          Router.go('invoices');
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

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    public_pricing: function () {
      this.render('public_pricing');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    public_freetrial: function () {
      this.render('public_freetrial');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    public_shortlist: function () {
      this.render('public_shortlist');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    public_termsandconditions: function () {
      this.render('public_termsandconditions');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    public_privacypolicy: function () {
      this.render('public_privacypolicy');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    }
  });
}