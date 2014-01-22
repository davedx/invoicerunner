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

  var daysDiff = function (date) {
    if(!date) return '';
    var now = moment();
    var momentDate = moment(date);
    var days_diff = momentDate.diff(now, 'days');
    return days_diff;
  }

  var inDays = function (date) {
    var days_diff = daysDiff(date);
    if(days_diff === '')
      return '';
    if(days_diff == 0)
      return ' - Today';
    else if(days_diff == 1)
      return ' - Tomorrow';
    else if(days_diff < 0)
      return 'Overdue by ' + (-days_diff) + ' days';
    else if(days_diff < 7)
      return ' - In ' + days_diff + ' days';
    return '';
  }

  Template.invoices.events({
    'click .currency-select a': function (event) {
      var newCurrency = event.target.innerHTML;
      $('.currency_name_' + this._id).html(newCurrency);
      event.preventDefault();
    },
    'click .btn-save': function (event) {
      $(event.target).prop('disabled', true);
      form={};
      $.each($(event.target).closest('form').serializeArray(), function() {
          form[this.name] = this.value;
      });
      form['approved'] = form['approved'] == 'on' ? true : false;
      form['currency'] = $('.currency_name_' + this._id).html();
	
      var id = this._id;
	 
			Meteor.call('updateInvoice', id, form, function (err, invoice) {
				var msg;
				if(err) {
					//msg = 'Error saving invoice. Try again in a moment.';
					msg = err.reason;
				}	else {
					msg = 'Invoice saved.';
				}
			 
				var feedback = $(event.target).next();
				feedback.html(msg);
				feedback.show();
				feedback.css('opacity', '1.0');
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
    'click .payment-button': function (event, template) {
      event.preventDefault();
      var company_id = parseInt(event.target.getAttribute('data-company-id'));
      var company_name = event.target.getAttribute('data-company-name');
      var invoice_id = this._id;
      $('.btn-paid').data('invoice-id', invoice_id);
      var company = Companies.findOne({name: company_name});
      if(!company) {
        $('#add-company-name').html(company_name);
        $('#add_company_modal').modal();
      } else {
        var invoice = Invoices.findOne({_id: invoice_id});
        var payment = company.payment.replace(/\n/g, '<br>');
        payment += '<br>Invoice number: ' + invoice.invoice_number;
        payment += '<br>Due date: ' + longDate(invoice.date_due);
        payment += '<br><strong>Total amount: ' + invoice.currency + ' ' + invoice.total + '</strong>';
        $('#payment_modal .modal-details').html('<strong>' + company.name + '</strong><br><p>' + payment + '</p>');
        $('#payment_modal').modal();
      }
    },
		'click .btn-save-payment': function (event) {
			var payment_method = $('#add-company-payment-method').val();
			var company_name = $('#add-company-name').html();
		
			Meteor.call('createCompany', {
        name: company_name,
        payment: payment_method
      }, function (error, company) {
        if (error) {
          console.error(error);
        }
      });

      $('#add_company_modal').modal('hide');
    },
    'click .btn-paid': function (event) {
      event.preventDefault();
      var invoice_id = $('.btn-paid').data('invoice-id');
      Invoices.update(invoice_id, {$set: {status: 'paid'}});
      $('#payment_modal').modal('hide');
    },
	'click a.view-invoice': function (event) {	
		var invoiceModal = $("#view-invoice-modal");
		if(invoiceModal.is(':visible')){
			invoiceModal.hide();
			invoiceModal.css("top","5%");
			document.getElementById('invoice').src = "";
		}else {			
			if(this.url.length>0){
				document.getElementById('invoice').src = this.url;
				invoiceModal.show();
				var position=invoiceModal.position();
				var top=parseInt(position.top) + $(document).scrollTop();
				invoiceModal.css("top",top);
				
				// get height of the modal content
				var contentHeight = invoiceModal.height() - $("#view-invoice-modal-header").outerHeight() - 15*2;
				// enlarge modal content and iframe
				$("#view-invoice-modal-body").height(contentHeight);
				$("#invoice").height(contentHeight);
				
				//get width of the modal content
				var contentWidth = $("#view-invoice-modal").width() - 15*2;
				// enlarge modal content and iframe
				$("#view-invoice-modal-body").width(contentWidth);
				$("#invoice").width(contentWidth);
			}			
		}		
		event.preventDefault();
    },
	'click #view-invoice-modal-close' : function (event) {
		var invoiceModal = $("#view-invoice-modal");
		if(invoiceModal.is(':visible')){
			invoiceModal.hide();
			invoiceModal.css("top","5%");
			document.getElementById("invoice").src = "";
		}
	},	
	'click .company': function(event) {
		if ($(event.target).val() == "Company name") {
			$(event.target).val("");
		};			
	},
	'blur .company': function(event) {
		if ($(event.target).val() == "") {
			$(event.target).val("Company name");
		};
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

  Template.invoices.processingNone = function () {
    return Invoices.find({approved: false}).count() === 0;
  };

  Template.invoices.payableNone = function () {
    return Invoices.find({approved: true, status: 'processing'}).count() === 0;
  };

  Template.invoices_paid.paidNone = function () {
    return Invoices.find({status: 'paid'}).count() === 0;
  };

	Handlebars.registerHelper('date_badge', function (date) {
		var days_diff = daysDiff(date);
		var bt = '';
		if(days_diff < 1)
			bt = ' badge-important';
		else if(days_diff < 7)
			bt = ' badge-warning';
		return 'badge' + bt;
	});

	Handlebars.registerHelper('long_date', function (date) {
		return longDate(date);
	});

	Handlebars.registerHelper('in_days', function (date) {
		return inDays(date);
	});

	Template.invoices.helpers({
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

  Template.new_invoice.rendered = function () {
  	$("#upload-invoice-modal").hide();
  	var gotoInvoiceId = Session.get("goto_invoice");
  	if (gotoInvoiceId) {
  		$("#upload-invoice-modal").show();
  	}
  };

  var isTrialAccount = function() {
    var user = Meteor.user();
    if(user && user.profile && user.profile.accountType && user.profile.accountType === 'trial') {
      return true;
    }
    return false;    
  };

  var getInvoicesLimit = function() {
    return isTrialAccount() ? 5 : 0;
  };

  var isMaxInvoices = function() {
    var maxInvoices = getInvoicesLimit();
    var numInvoices = Invoices.find().count();
    if(maxInvoices > 0 && numInvoices >= maxInvoices)
      return true;
    return false;
  };

  Template.new_invoice.notMaxInvoices = function() {
    return !isMaxInvoices();
  };

  Template.new_invoice.maxInvoices = function() {
    return isMaxInvoices();
  };

  Template.new_invoice.isTrial = function() {
    return isTrialAccount();
  };

  Template.new_invoice.helpers({
    'trialRemaining': function() {
      var maxInvoices = getInvoicesLimit();
      var numInvoices = Invoices.find().count();
      if(maxInvoices > 0) {
        return maxInvoices - numInvoices;
      }
      return 0;
    }
  })

  Template.new_invoice.events({
    'click button.upload-btn': function () {
      filepicker.pick(function (ink) {
        Meteor.call('createInvoice', {
          url: ink.url,
          filename: ink.filename,
          mimetype: ink.mimetype
        }, function (error, invoice) {
			if (!error) {
				Session.set('goto_invoice', invoice);
			  } else {
				console.error(error);
			  }
        });
      });
    },
	'click #upload-invoice-modal-close': function() {
		$('#upload-invoice-modal').hide();
		Session.set('goto_invoice',null);
	},
	'click #upload-another-invoice': function() {
		$('#upload-invoice-modal').hide();
		Session.set('goto_invoice',null);
	},
	'click #edit-invoice': function() {
		$('#upload-invoice-modal').remove();
		Router.go('invoices');
	}
});
   
  Template.invoices.rendered = function () {
	$(".popover").remove();
	var gotoInvoiceId = Session.get('goto_invoice');
	if(gotoInvoiceId) {
		var formElement = $(".currency_name_" + gotoInvoiceId).closest("form");
		var height = $(formElement).offset().top;
		height -= $(".navbar").height();
		height -= 24;
		$('html, body').scrollTop(height);
		$(formElement).popover({
			content: "Your invoice has been successfully uploaded. Finish entering the data for this invoice so you can track the date it is due, the purchase order number, and the amounts payable."
		}).popover('show');	
		Session.set('goto_invoice',null);
	}else{
		if($('html, body').scrollTop() > 0) {
			$('html, body').scrollTop(0);
		}
	}
	 $(".company").typeahead({
        source: function() {
			var companies = _.filter(Companies.find({}, {fields: {name :1}}).fetch(), function (company){
				return company.name.length > 0;
			});
			return _.map(companies, function(company) { return company.name; }); 
		},
        items: 5
        }); 
  };

  InvoicesController = RouteController.extend({
    template: 'invoices',

    waitOn: function () {
      return [Subscriptions['invoices'], Subscriptions['companies']];
    },

    data: function () {
      return {
        processing: Invoices.find({approved: false}, {sort: [["date_due", "asc"]]}),
        payable: Invoices.find({approved: true, status: 'processing'}, {sort: [["date_due", "asc"]]}),
        paid: Invoices.find({status: 'paid'}, {sort: [["date_due", "asc"]]})
      };
    },

    index: function () {
      if(Meteor.userId() === null)
        this.render('notLoggedIn');
      else
		this.render('invoices');

      this.render('publicFooter',
        { to: 'footer', waitOn: false, data: false }
      );
    },

    paid: function () {
      if(Meteor.userId() === null)
        this.render('notLoggedIn');
      else
        this.render('invoices_paid');

      this.render('publicFooter',
        { to: 'footer', waitOn: false, data: false }
      );
    },

    new: function () {
      if(Meteor.userId() === null)
        this.render('notLoggedIn');
      else
        this.render('new_invoice');

      this.render('publicFooter',
        { to: 'footer', waitOn: true, data: true }
      );
    }
  });
}
