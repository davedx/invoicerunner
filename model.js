Invoices = new Meteor.Collection('invoices');
Companies = new Meteor.Collection('companies');

var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

Invoices.allow({
  insert: function (userId, invoice) {
    return false; // no cowboy inserts -- use createInvoice method
  },
  
  update: function (userId, invoice, fields, modifier) {
   
    if (userId !== invoice.owner)
      return false; // not the owner

    var allowed = ["company", "company_id", "invoice_number", "date_due", "subtotal",
    	"tax", "total", "po_number", "currency", "approved", "status", "url", "filename", "mimetype"];
	
    if (_.difference(fields, allowed).length)
      return false; // tried to write to forbidden field
    
    return true;
  },
  remove: function (userId, invoice) {
  	// don't allow removing of paid or archived invoices
    return invoice.owner === userId && invoice.status === 'processing';
  }
});

if (Meteor.isServer) {

  Meteor.methods({
    addToMailList: function (options) {
      var email = options.email;
      var mckey = '841e25e309b9933d79c8c543b458c88e-us7';
      var baseUrl = 'https://us7.api.mailchimp.com/2.0/';
      var listId = '6ad8ee6eff';
      var mcResult = HTTP.post(baseUrl + 'lists/subscribe', {data: {
        apikey: mckey,
        id: listId,
        email: {
          email: options.email
        }
      }});
      if(mcResult.statusCode !== 200) {
        console.error("Error connecting to MailChimp");
        throw new Meteor.Error(500, 'Mailchimp error');
      }
    },
   validateEmail: function (options) {
	   if(!options.email.match(/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9])+\.([a-zA-Z])+$/)) {
			throw new Meteor.Error(403, "Invalid email");
		}		
	},

    upgradeAccountStripe: function (options) {
      var stripeKeyTest = 'sk_test_rymPpU927JzHGsyn1FImWSOA';
      var stripeKeyLive = 'sk_live_Y12o20xI5mAiKdr1BAhyHz4x';
      var live = false;
      var key = live ? stripeKeyLive : stripeKeyTest;
      var baseUrl = 'https://api.stripe.com/v1/';

      var user = Meteor.user();
      var email = user.emails[0].address;
      var index = options.subscriptionIndex;
      var plans = [
        { name: 'professional', price: 19 },
        { name: 'company', price: 49 },
        { name: 'enterprise', price: 99 }
      ];
      var plan = plans[index];

      console.log("Stripe: creating new customer: "+email);
      var clientResult = HTTP.post(baseUrl + 'customers', {
        auth: key + ':',
        params: {
          card: options.ccToken,
          email: email,
          description: 'Customer for '+email,
          plan: plan.name
        }
      });
      console.log(clientResult);
      if(clientResult.statusCode !== 200) {
        console.error("Error connecting to Stripe");
        throw new Meteor.Error(500, "Stripe error");
      }
      
      // set the account to the correct type
      console.log("Setting account type to: "+plan.name+" for user: "+user._id);
      //console.log(user);

      var foundUser = Meteor.users.findOne(this.userId);
      if(foundUser) {
        Meteor.users.update(this.userId, {
          $set: {
            'profile.accountType': plan.name,
            'profile.companyName': options.company_name,
            'profile.companyAddress': options.company_address,
            'profile.companyCountry': options.company_country,
            'profile.companyTaxNumber': options.company_tax
          }
        });
        console.log("Updated user!");
        return {status: 'ok'};
      } else {
        throw new Error("You are not logged in.");
      }
    },
    
    validateAccountStripe: function (options) {
		switch(options.name) {
		case 'company_name':
			if (!options.value.match(/^[a-z 0-9]{2,60}$/i))
			throw new Meteor.Error(403, "Invalid company name");
			break;
		
        case 'company_address':
			if (!options.value.match(/^[a-z 0-9]{2,60}$/i))
			throw new Meteor.Error(403, "Invalid company address");
			break;
				
        case 'card_number':
		   if (!options.value.match(/^[0-9]{16}$/))
		   throw new Meteor.Error(403, "Invalid card number");
	       break;
	       
	    case 'card_expiry_month':	
		   if (!options.value.match(/^(0?[1-9]|1[012])$/))
		   throw new Meteor.Error(403, "Invalid card expiry month");
	   	   break;   
	   	   
	    case 'card_expiry_year':
		   if (!options.value.match(/^(20(1[4-9]|[2-4][0-9]|50))$/))
		   throw new Meteor.Error(403, "Invalid card expiry year");	
	       break;
	       
	    case 'card_holdername':
		   if (!options.value.match(/^[a-z ]{2,60}$/i))
		   throw new Meteor.Error(403, "Invalid card name");
		   break;
	   }
	  return true; 
	 },

    upgradeAccount: function (options) {
      var paymillKey = 'c807ea7cfc00c6faa443b629656a5834';
      var baseUrl = 'https://api.paymill.com/v2/';

      var user = Meteor.user();
      var email = user.emails[0].address;

      console.log("Paymill: creating new client: "+email);
      var clientResult = HTTP.post(baseUrl + 'clients', {
        auth: paymillKey + ':',
        params: {
          email: email,
          description: 'New client'
        }
      });
      //console.log(clientResult);
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
      //console.log(paymentResult);
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
      //console.log(subResult);
      if(subResult.statusCode !== 200) {
        console.error("Error connecting to Paymill");
        throw new Meteor.Error(500, "Paymill error");
      }
      
      // set the account to the correct type
      var index = options.subscriptionIndex;
      var plans = [
        { name: 'silver', price: 19 },
        { name: 'gold', price: 49 },
        { name: 'platinum', price: 99 }
      ];
      var plan = plans[index];
      console.log("Setting account type to: "+plan.name+" for user: "+user._id);
      //console.log(user);

      var foundUser = Meteor.users.findOne(this.userId);
      if(foundUser) {
        Meteor.users.update(this.userId, {
          $set: {
            'profile.accountType': plan.name,
            'profile.companyName': options.company_name,
            'profile.companyAddress': options.company_address,
            'profile.companyCountry': options.company_country,
            'profile.companyTaxNumber': options.company_tax
          }
        });
        console.log("Updated user!");
        return {status: 'ok'};
      } else {
        throw new Error("You are not logged in.");
      }
    },

    createCompany: function (options) {
/*      check(options, {
        name: NonEmptyString
      });*/
	  	  
	  if (!options.name.match(/^[a-z 0-9]+$/i)) {	
		throw new Meteor.Error(403, "Enter a valid company name!");		
	  }
	  if(!this.userId)
        throw new Meteor.Error(403, "You must be logged in");

      return Companies.insert({
        owner: this.userId,
        name: options.name,
        payment: options.payment
      });
    },
	
	   validateDateDue: function (options) {		 
		 if (!options.value.match(/^(0?[1-9]|[12]+[0-9]|3[01])-(0?[1-9]|1[012])-(20(1[3-9]|[2-4][0-9]|50))$/))
		   throw new Meteor.Error(403, "Invalid date");
		   
		 var dateArray = options.value.split("-");
		 var day = parseInt(dateArray[0]);
		 var month = parseInt(dateArray[1]);
		 var year = parseInt(dateArray[2]);
		
		 if (day == 31 && (month == 4 || month == 6 || month == 9 || month == 11)) // 31 days in months of 30 days
			throw new Meteor.Error(403, "Invalid date");
		 if ((day == 30 || day == 31) && month == 2) 
			throw new Meteor.Error(403, "Invalid date"); // 30/31 days in february
		 if (day == 29 && year%4 != 0)
			throw new Meteor.Error(403, "Invalid date"); // 29 days in february leap year
			
			console.log("date is ok");
		 return true;
	 },    
	
    // options should include: title, description, x, y, public
    createInvoice: function (options) {
      check(options, {
        url: NonEmptyString,
        filename: NonEmptyString,
        mimetype: NonEmptyString
      });
		
	  
      if (!this.userId)
        throw new Meteor.Error(403, "You must be logged in");
    	  
       var d = new Date();
       var month = d.getMonth()+1;
	   var day = d.getDate();

	   var currentDate = (day<10 ? '0' : '') + day + '-' +
		  (month<10 ? '0' : '') + month + '-' +
		  d.getFullYear() ;
        
      return Invoices.insert({
  	  	owner: this.userId,
  	    company: 'Company name',
  	    company_id: 0,
  	    invoice_number: '0',
  	    date_due: currentDate,
  	    subtotal: 0,
  	    tax: 0,
  	    total: 0,
        currency: 'USD',
  	    po_number: '',
  	    approved: false,
  	    status: 'processing',
  	    url: options.url,
  	    filename: options.filename,
  	    mimetype: options.mimetype
  	   });

    },
	
	updateInvoice: function (id, options) {	
	
	 var whitelist = ["company", "invoice_number", "date_due", "subtotal",
    	"tax", "total", "po_number", "currency", "approved"];
	       
	  if (options.company !== undefined && (options.company.length <= 1 || options.company.length > 60))
        throw new Meteor.Error(403, "Invalid company name");
        
	  if (!this.userId)
        throw new Meteor.Error(403, "You must be logged in");  
     
     var finalOptions = {};
     
     for(var key in whitelist) {
		var field = whitelist[key]; 
		if (options[field] !== undefined) {
			finalOptions[field] = options[field];
		}
	 };
	 return Invoices.update(id, {$set: finalOptions});
	}
  });
}
