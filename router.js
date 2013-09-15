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

  this.route('accounts/new', {
    controller: 'AccountsController',
    action: 'new'
  });
});