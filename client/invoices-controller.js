if (Meteor.isClient) {
  Subscriptions = {
    invoices: Meteor.subscribe('invoices'),
    companies: Meteor.subscribe('companies')
  };

  function getPageVar (sVar) {
    return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

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
    'click .btn-save': function (event) {
      $(event.target).prop('disabled', true);
      form={};
      $.each($(event.target).closest('form').serializeArray(), function() {
          form[this.name] = this.value;
      });
      form['approved'] = form['approved'] == 'on' ? true : false;
      var id = this._id;
      Invoices.update(id, {$set: form}, function (err) {
        var msg;
        if(err) {
          msg = 'Error saving invoice. Try again in a moment.';
        } else {
          msg = 'Invoice saved.';
        }
        var feedback = $(event.target).next();
        feedback.html(msg);
        feedback.show().css('opacity', '1.0');
        setTimeout(function () {
          feedback.animate({
            opacity: 0.25,
          }, 500, function () {
            feedback.hide();
          });
        }, 1000);
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

  Template.layout.helpers({
    if: function(conditional, options) {
      var user = Meteor.user();
      if(user && user.profile && user.profile.accountType && user.profile.accountType === 'trial') {
        return options.fn(this);
      }
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
    tab_visible: function (tab) {
      var currTab = getPageVar('tab');
      if(currTab === tab) return '';
      if(tab === 'processing' && !currTab) return '';
      return 'hidden-phone';
    },
    isApproved: function () {
      return this.approved ? 'checked' : '';
    }
  });

  Session.set("widgetSet", false);
  var key = "Aze1xrJhFSb62pRcbCGTNz";

  Template.new_invoice.rendered = function ( ) { 
    //FIXME: seems buggy when navigating to this page
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

    waitOn: function () {
      return [Subscriptions['invoices'], Subscriptions['companies']];
    },

    data: function () {
      return {
        processing: Invoices.find({approved: false}, {sort: [["date_due", "asc"]]}),
        payable: Invoices.find({approved: true, status: 'processing'}, {sort: [["date_due", "asc"]]})
      };
    },

    index: function () {
      this.render('invoices');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    },

    new: function () {
      this.render('new_invoice');

      this.render({
        publicFooter: { to: 'footer', waitOn: false, data: false }
      });
    }
  });
}