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

    // A good improvement would be to validate the type of the new
    // value of the field (and if a string, the length.) In the
    // future Meteor will have a schema system to makes that easier.
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
