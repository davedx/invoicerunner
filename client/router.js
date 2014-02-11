Router.configure({
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

Router.map(function () {

  this.route('admin', {
    controller: 'AdminController',
    layoutTemplate: 'admin_layout',
    action: 'users'
  });

  this.route('invoices', {
    controller: 'InvoicesController',
    layoutTemplate: 'layout',
    action: 'index'
  });

  this.route('invoices/paid', {
    controller: 'InvoicesController',
    layoutTemplate: 'layout',
    action: 'paid'
  });

  this.route('new-invoice', {
    controller: 'InvoicesController',
    layoutTemplate: 'layout',
    action: 'new'
  });

  this.route('accounts/new', {
    controller: 'AccountsController',
    layoutTemplate: 'layout',
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

  this.route('termsandconditions', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_termsandconditions'
  });

  this.route('privacypolicy', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_privacypolicy'
  });
  
  this.route('support', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_support'
  });
  
  this.route('cancelaccount', {
    controller: 'PublicController',
    layoutTemplate: 'public_layout',
    action: 'public_cancelaccount'
  });

});
