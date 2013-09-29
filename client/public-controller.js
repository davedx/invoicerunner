if (Meteor.isClient) {

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
    },

    public_pricing: function () {
      this.render('public_pricing');
    },

    public_freetrial: function () {
      this.render('public_freetrial');
    },

    public_shortlist: function () {
      this.render('public_shortlist');
    },

    public_termsandconditions: function () {
      this.render('public_termsandconditions');
    }
  });
}