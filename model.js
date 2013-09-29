Invoices = new Meteor.Collection('invoices');
Companies = new Meteor.Collection('companies');

Invoices.allow({
  insert: function (userId, invoice) {
    return false; // no cowboy inserts -- use createInvoice method
  },
  update: function (userId, invoice, fields, modifier) {
    if (userId !== invoice.owner)
      return false; // not the owner

    var allowed = ["company", "company_id", "invoice_number", "date_due", "subtotal",
    	"tax", "total", "approved", "status", "url", "filename", "mimetype"];

    if (_.difference(fields, allowed).length)
      return false; // tried to write to forbidden field

    return true;
  },
  remove: function (userId, invoice) {
  	// don't allow removing of paid or archived invoices
    return invoice.owner === userId && invoice.status === 'processing';
  }
});

var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

if (Meteor.isServer) {

  Meteor.methods({
    createAccount: function (options) {
      var paymillKey = 'c807ea7cfc00c6faa443b629656a5834';
      
      var baseUrl = 'https://api.paymill.com/v2/';

      console.log("Paymill: creating new client");
      var clientResult = HTTP.post(baseUrl + 'clients', {
        auth: paymillKey + ':',
        params: {
          email: options.email,
          description: 'New client'
        }
      });
      console.log(clientResult);
      if(clientResult.statusCode !== 200) {
        console.error("Error connecting to Paymill");
        throw new Meteor.Error(500, "Paymill error");
      }
      var clientId = clientResult.data.data.id;

      console.log("Paymill: creating new payment for client: "+clientId);
      var paymentResult = HTTP.post(baseUrl + 'payments', {
        auth: paymillKey + ':',
        params: {
          token: options.ccToken,
          client: clientId
        }
      });
      console.log(paymentResult);
      if(paymentResult.statusCode !== 200) {
        console.error("Error connecting to Paymill");
        throw new Meteor.Error(500, "Paymill error");
      }

      console.log("Paymill: making new subscription");
      var paymentId = paymentResult.data.data.id;
      var subResult = HTTP.post(baseUrl + 'subscriptions', {
        auth: paymillKey + ':',
        params: {
          client: clientId,
          offer: options.subscription,
          payment: paymentId
        }
      });
      console.log(subResult);
      if(subResult.statusCode !== 200) {
        console.error("Error connecting to Paymill");
        throw new Meteor.Error(500, "Paymill error");
      }
    }
  });
} else {
  Meteor.methods({
    // options should include: title, description, x, y, public
    createInvoice: function (options) {
      check(options, {
        url: NonEmptyString,
        filename: NonEmptyString,
        mimetype: NonEmptyString
      });

      if (!this.userId)
        throw new Meteor.Error(403, "You must be logged in");

      return Invoices.insert({
  	  	owner: this.userId,
  	    company: 'Company name',
  	    company_id: 0,
  	    invoice_number: '0',
  	    date_due: new Date().setDate('2020-01-01'),
  	    subtotal: 0,
  	    tax: 0,
  	    total: 0,
  	    pa_number: '',
  	    approved: false,
  	    status: 'processing',
  	    url: options.url,
  	    filename: options.filename,
  	    mimetype: options.mimetype
  	   });
    	}
   });
}