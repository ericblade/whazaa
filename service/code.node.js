// <response status="fail-too-recent" result="35"/>
// ^^ length of time you must wait before applying for another code
var https = require('https');

// https://r.whatsapp.net/v1/code.php?cc=1&in=9519993267&to=19519993267&lc=US&lg=en&mcc=000&mnc=000&imsi=0&method=sms

var options = {
    host: "r.whatsapp.net",
    port: 443,
    path: "/v1/code.php?cc=1&in=7079925233&mcc=000&mnc=000&imsi=0&method=sms",
    method: "GET",
    headers: {
        "User-Agent": "WhatsApp/2.6.61 S60Version/5.2 Device/C7-00",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/xml"
    }
};

var req = https.request(options, function(res) {
    console.log("statusCode", res.statusCode);
    console.log("headers", res.headers);
    res.on('data', function(d) {
        process.stdout.write(d);
    });
});
req.end();
req.on('error', function(e) {
    console.error(e);
});
