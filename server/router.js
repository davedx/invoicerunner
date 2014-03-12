Router.map(function () {

  this.route('home', {
    where: 'server',
    path: '/',
    action: function() {
      //console.log("Returning hello");
      this.response.writeHead(200, {'Content-Type': 'text/html'});
      var public_freetrial = Handlebars.templates['public_freetrial'];
      //console.log(public_freetrial);
      var public_home = Handlebars.templates['public_home']({},
      	{public_freetrial: public_freetrial});
      var public_html = Handlebars.templates['public_layout']({},
      	{content: public_home});
      this.response.end(public_html);
    }
  });

  // this.route('pricing', {
  //   controller: 'PublicController',
  //   layoutTemplate: 'public_layout',
  //   action: 'public_pricing'
  // });


});
