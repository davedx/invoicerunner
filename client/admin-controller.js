if (Meteor.isClient) {

/*  Subscriptions = {
    invoices: Meteor.subscribe('invoices'),
    companies: Meteor.subscribe('companies'),
    user: Meteor.subscribe('userData'),
    allUsers: Meteor.subscribe('allUserData')
  };

  Template.admin_users.helpers = ({
    isAuthed: function () {
      var user = Meteor.user();
      console.log(user);
      if(user && user.emails && user.emails[0].address === 'davedx@gmail.com')
        return true;
      return false;
    }
  });

  AdminController = RouteController.extend({
    template: 'accounts',

    users: function () {
      var user = Meteor.user();
      if(!user && !Meteor.loggingIn()) {
        return Router.go('home');
      }

      this.render('admin_users');
    }
  });
  */
}
