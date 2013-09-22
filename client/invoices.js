if(Meteor.isClient) {
	//paymill bridge
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://bridge.paymill.com/';
  script.onload = function () {
    console.log("Loaded paymill");
  }

  //Load the script tag
  var head = document.getElementsByTagName('head')[0];
  return head.appendChild(script);
}
