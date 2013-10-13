if (Meteor.isServer) {
  var seed = function () {
    var genDate = function (i) {
      var d = new Date();
      return d.setDate(d.getDate()+i);
    }
    var resetData = false;
    if(resetData) {
      Invoices.remove({});
      Companies.remove({});

      Companies.insert({
        id: 1,
        name: 'Red Sky Forge',
        payment: 'Account: 755143728\nName: D W Clayton',
        tax_number: '366274582B01'
      });

      for (var i = 9; i >= 0; i--) {
        Invoices.insert(
          {
            id: i,
            company: 'Red Sky Forge',
            company_id: 1,
            invoice_number: '' + (1000+i),
            date_due: genDate(i),//new Date().setDate('2013-08-'+(1+i)),
            subtotal: 1000,
            tax: 200,
            total: 1200,
            pa_number: 'SS-54012',
            approved: i < 5,
            status: 'processing'
          }
        );
      }
    }
  };

  Meteor.startup(seed);

  Meteor.publish('invoices', function () {
    return Invoices.find({owner: this.userId});
  });

  Meteor.publish('companies', function () {
    return Companies.find({owner: this.userId});
  });

  var user = Meteor.users.findOne({_id: Meteor.userId});
  if(user.emails[0].address === 'davedx@gmail.com') {
    Meteor.publish('allInvoices', function () {
      return Invoices.find();
    });
  }
  
  Meteor.publish('users', function() {
    var user = Meteor.users.findOne({_id: this.userId});
    if(user.emails[0].address === 'davedx@gmail.com') {
      return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
    } else {
      return [];
    }
  });
} else {
  // client side:
  Meteor.startup(function () {
    console.log("Bootstrapping app...");
    Session.set("widgetSet", false);
  });
}
