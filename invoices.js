/**
TODO:
DONE - 1. Company information: payment instructions (displayed when 'pay' clicked on)
2. Upload invoice (displays thumbnail next to 'open' button on each invoice) - thumbnail??
3. Archives (just make another status called 'archived' that's not displayed easily)
5. Change currency for invoice AND global settings
6. Change DATE of invoices
7. Ensure user permissions work
8. Write non-logged in static copy/webpages
9. Payment integration (Paymill?)
10. Make CSS look a little less Bootstrap and a little more professional (more subdued colours?)
11. Test and fix any responsive issues (make it kick ass on mobile)
Launch: Google AdWords it up and advertise on LinkedIn, Twitter, G+
****
Checklist for 'minimum' requirements (regulatory examples): http://www.einvoicingbasics.co.uk/selecting-einvoicing/selecting-einvoicing-solutions/
Future features:
1. Financial reports
2. Download/export archives
3. OCR module (2nd tier of pricing plan)
4. Generate and send invoices? (module)
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
}

