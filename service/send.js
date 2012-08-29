console.log("*** Loading waapi");

//require.paths.push("./");
//require.paths.push("./node_modules");

var fs = require('fs');
var servicePath = fs.realpathSync('.');
var modulePath = servicePath + '/node_modules';
var waApi = require(modulePath+"/testapi.js").waApi;

var wa = new waApi("19519993267", "134529771563", { debug: true });

wa.addListener('loggedin', function() {
    wa.sendMessageWithBody({ content: "Test Message 1" });    
});
