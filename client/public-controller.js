if (Meteor.isClient) {

  Template.public_home.events({
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
    }
  });
}