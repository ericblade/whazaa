var api = require('waapi');

var wa = new api.waapi("7079925233", "FE36wfjsdfj");

wa.on('loggedin', function() {
    console.log("Received logged in event");
});
wa.on('connected', function() {
    console.log("wa connected");
});

//console.log("wa = " +JSON.stringify(wa));

//wa.login();

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
  }

//sleep(2000);
