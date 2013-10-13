if (Meteor.isClient) {

  Subscriptions = {
    invoices: Meteor.subscribe('allInvoices'),
    companies: Meteor.subscribe('companies'),
    users: Meteor.subscribe('users')
  };

  Template.admin_users.isAuthed = function () {
    var user = Meteor.user();
    if(user && user.emails && user.emails[0].address === 'davedx@gmail.com')
      return true;
    return false;
  };

  Template.admin_users.helpers({
    get_email: function () {
      return this.emails[0].address;
    },
    get_invoices: function () {
      return Invoices.find({owner: this._id}).count();
    }
  });

  AdminController = RouteController.extend({
    template: 'accounts',

    waitOn: function () {
      return [
        Subscriptions['users'],
        Subscriptions['invoices'],
        Subscriptions['companies']
      ];
    },

    data: function () {
      return {
        users: Meteor.users.find({})
      }
    },

    users: function () {
      var user = Meteor.user();
      if(!user && !Meteor.loggingIn()) {
        return Router.go('home');
      }
      this.render('admin_users');
    }
  });
  
}
