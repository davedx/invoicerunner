Invoices = new Meteor.Collection('invoices');
Companies = new Meteor.Collection('companies');
/**
TODO:
1. Company information: payment instructions (displayed when 'pay' clicked on)
2. Upload invoice (displays thumbnail next to 'open' button on each invoice)
3. Archives
4. Financial reports
****
Checklist for 'minimum' requirements (regulatory examples): http://www.einvoicingbasics.co.uk/selecting-einvoicing/selecting-einvoicing-solutions/

**/
Router.map(function () {
  this.route('home', {
    path: '/'
  });

  this.route('invoices', {
    controller: 'InvoicesController',
    action: 'index'
  });

  this.route('new-invoice', {
    controller: 'InvoicesController',
    action: 'new'
  });
});

if (Meteor.isServer) {
  var seed = function () {
    var genDate = function (i) {
      var d = new Date();
      return d.setDate(d.getDate()+i);
    }
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
  };

  Meteor.startup(seed);

  Meteor.publish('invoices', function () {
    return(Invoices.find());
  });

  Meteor.publish('companies', function () {
    return(Companies.find());
  });
}

