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
    action: 'customAction'
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

if (Meteor.isClient) {
  Router.configure({
    layout: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading'
  });

  Subscriptions = {
    invoices: Meteor.subscribe('invoices'),
    companies: Meteor.subscribe('companies')
  };

  var longDate = function (date) {
      return moment(date).format("MMM Do YYYY");
  }

  var inDays = function (date) {
    var now = moment();
    var momentDate = moment(date);
    var days_diff = momentDate.diff(now, 'days');
    if(days_diff == 0)
      return ' - Today';
    else if(days_diff == 1)
      return ' - Tomorrow';
    else if(days_diff < 7)
      return ' - In ' + days_diff + ' days';
    return '';
  }

  Template.invoices.events({
    'change .subtotal': function (event) {
      Invoices.update(this._id, {$set: {subtotal: event.target.value}});
    },
    'change .approved': function (event) {
      Invoices.update(this._id, {$set: {approved: event.target.checked}});
    },
    'click .payment-button': function (event, template) {
      var company_id = parseInt(event.target.getAttribute('data-company-id'));
      var invoice_id = this._id;
      $('.btn-paid').data('invoice-id', invoice_id);
      var company = Companies.findOne({id: company_id});
      var invoice = Invoices.findOne({_id: invoice_id});
      var payment = company.payment.replace(/\n/g, '<br>');
      payment += '<br>Invoice number: ' + invoice.invoice_number;
      payment += '<br>Due date: ' + longDate(invoice.date_due);
      payment += '<br><strong>Total amount: ' + invoice.total + '</strong>';
      $('#payment_modal .modal-details').html('<strong>' + company.name + '</strong><br><p>' + payment + '</p>');
      $('#payment_modal').modal();
    },
    'click .btn-paid': function (event) {
      event.preventDefault();
      var invoice_id = $('.btn-paid').data('invoice-id');
      Invoices.update(invoice_id, {$set: {status: 'paid'}});
      $('#payment_modal').modal('hide');
    }
  });

  Template.invoices.helpers({
    date_badge: function (date) {
        var dt = (date - new Date())/86000000;
        //console.log(dt);
        var bt = '';
        if(dt < 1.0) bt = ' badge-important';
        else if(dt < 7.0) bt = ' badge-warning';
        return 'badge' + bt;
    },
    long_date: function (date) {
      return longDate(date);
    },
    in_days: function (date) {
      return inDays(date);
    }
  });

  InvoicesController = RouteController.extend({
    template: 'invoices',

    /*
     * During rendering, wait on the invoices subscription and show the loading
     * template while the subscription is not ready. This can also be a function
     * that returns on subscription handle or an array of subscription handles.
     */

    waitOn: function () {
      return [Subscriptions['invoices'], Subscriptions['companies']];
    },

    /*
     * The data function will be called after the subscrition is ready, at
     * render time.
     */

    data: function () {
      // we can return anything here, but since I don't want to use 'this' in
      // as the each parameter, I'm just returning an object here with a named
      // property.
      return {
        processing: Invoices.find({approved: false}, {sort: [["date_due", "asc"]]}),
        payable: Invoices.find({approved: true, status: 'processing'}, {sort: [["date_due", "asc"]]})
      };
    },

    /*
     * By default the router will call the *run* method which will render the
     * controller's template (or the template with the same name as the route)
     * to the main yield area {{yield}}. But you can provide your own action
     * methods as well.
     */
    customAction: function () {

      /* render customController into the main yield */
      this.render('invoices');

      /*
       * You can call render multiple times. You can even pass an object of
       * template names (keys) to render options (values). Typically, the
       * options object would include a *to* property specifiying the named
       * yield to render to.
       *
       */
      this.render({
        invoicesAside: { to: 'aside', waitOn: false, data: false },
        invoicesFooter: { to: 'footer', waitOn: false, data: false }
      });
    }
  });
}