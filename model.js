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
		if(!options.email.match(/^(.+@.+)$/)) {
			throw new Meteor.Error(403, "Invalid email");
		}		
	},

		upgradeAccountStripe: function (options) {
			var key = process.env.STRIPE_SECRET;
			var baseUrl = 'https://api.stripe.com/v1/';

			var user = Meteor.user();
			var email = user.emails[0].address;
			var index = options.subscriptionIndex;
			var plans = [
				{ name: 'Professional', price: 19 },
				{ name: 'Small Business', price: 49 },
				{ name: 'Enterprise', price: 99 }
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
			if(options.name.length <= 1 || options.name.length > 60) {
				throw new Meteor.Error(403, "Company name must be between 2 and 60 characters long.");		
			}
			
			if(!this.userId) {
				throw new Meteor.Error(403, "You must be logged in");
			}

			return Companies.insert({
				owner: this.userId,
				name: options.name,
				payment: options.payment
			});
		},
	
		validateDateDue: function (options) {	
			var m = moment(options.value, "YYYY-MM-DD");
			if(!m.isValid()) {
				throw new Meteor.Error(403, "Invalid date. Please format dates as YYYY-MM-DD");	
			}
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
	 
			var currentDate = moment().format('YYYY-MM-DD') ;
					 
			return Invoices.insert({
				owner: this.userId,
				company: 'Company name',
				company_id: 0,
				invoice_number: '0',
				date_due:currentDate,
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
