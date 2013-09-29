Router.configure({
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

Router.map(function () {

  this.route('invoices', {
    controller: 'InvoicesController',
    layoutTemplate: 'layout',
    action: 'index'
  });

  this.route('new-invoice', {
    controller: 'InvoicesController',
    layoutTemplate: 'layout',
    action: 'new'
  });

  this.route('accounts/new', {
    controller: 'AccountsController',
    layoutTemplate: 'public_layout',
    action: 'new'
  });

  this.route('home', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_home',
    path: '/'
  });

  this.route('pricing', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_pricing'
  });

  this.route('freetrial', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_freetrial'
  });

  this.route('shortlist', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_shortlist'
  });

});

