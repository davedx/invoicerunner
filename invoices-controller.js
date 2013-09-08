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
    if(!date) return '';
      return moment(date).format("MMM Do YYYY");
  }

  var inDays = function (date) {
    if(!date) return '';
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
      //Invoices.update(this._id, {$set: {subtotal: event.target.value}});
    },
    'click .btn-save': function (event) {
      $(event.target).prop('disabled', true);
      form={};
      $.each($(event.target).closest('form').serializeArray(), function() {
          form[this.name] = this.value;
      });
      form['approved'] = form['approved'] == 'on' ? true : false;
      Invoices.update(this._id, {$set: form}, function (err) {
        console.log("Result: "+err);
        $(event.target).prop('disabled', false);
      });
      event.preventDefault();
    },
    /*
    'change .approved': function (event) {
      Invoices.update(this._id, {$set: {approved: event.target.checked}});
    },*/
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
    },
    tax_rate: function () {
      //console.log(this); // total = tax * subtotal; tax = total / subtotal
      return parseInt(100 * ((this.total / this.subtotal) - 1));
    },
    total_validates: function (mode) {
      var ds = parseInt(this.total) - (parseInt(this.subtotal) + parseInt(this.tax));
      var ok = ds === 0;
      if(!ok)
        if(mode)
          return 'icon-remove';
        else
          return 'Off by '+ds;
      return '';
    }
  });

  Session.set("widgetSet", false);
  var key = "Aze1xrJhFSb62pRcbCGTNz";

  Template.new_invoice.rendered = function ( ) { 
    if (!Session.get("widgetSet")) {  
      loadPicker(key);
    }
  };

  Template.new_invoice.events({
    'click button' : function () {
      filepicker.pick(function (ink) {

        Meteor.call('createInvoice', {
          url: ink.url,
          filename: ink.filename,
          mimetype: ink.mimetype
        }, function (error, invoice) {
          if (!error) {
            if(confirm("Invoice created. Upload another?")) {
              // redirect back to this page
              Router.go('new-invoice');
            } else {
              // redirect to home
              Router.go('invoices');
            }
          } else {
            console.error(error);
          }
        });
      });
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
    index: function () {

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
        invoicesFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    new: function () {
      this.render('new_invoice');

      this.render({
        invoicesFooter: { to: 'footer', waitOn: false, data: false }
      });
    }
  });
}