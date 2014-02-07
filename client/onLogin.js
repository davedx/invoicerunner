if(Meteor.isClient) {
  Meteor.loginWithPassword = _.wrap(Meteor.loginWithPassword, function(login) {
    // Store the original arguments
    var args = _.toArray(arguments).slice(1),
        user = args[0],
        pass = args[1],
        origCallback = args[2];

    // Create a new callback function
    // Could also be defined elsewhere outside of this wrapped function
    var newCallback = function(err) {
      if(!err) {
        Router.go('invoices');
      }
    }

    // Now call the original login function with
    // the original user, pass plus the new callback
    login(user, pass, newCallback);

  });

  Meteor.logout = _.wrap(Meteor.logout, function(logout) {
    logout();
    Router.go('home');
  });
}