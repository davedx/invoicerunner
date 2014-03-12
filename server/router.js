Router.map(function () {

  this.route('home', {
    where: 'server',
    path: '/',
    action: function() {
      console.log("Returning hello");
      this.response.writeHead(200, {'Content-Type': 'text/html'});
      var public_freetrial = Handlebars.templates['public_freetrial'];
      console.log(public_freetrial);
      var html = Handlebars.templates['public_home']({},
      	{public_freetrial: public_freetrial});
      this.response.end(html);
    }
  });

  // this.route('pricing', {
  //   controller: 'PublicController',
  //   layoutTemplate: 'public_layout',
  //   action: 'public_pricing'
  // });


});
