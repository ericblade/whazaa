var https = require('https');

// https://r.whatsapp.net/v1/code.php?cc=1&in=9519993267&to=19519993267&lc=US&lg=en&mcc=000&mnc=000&imsi=0&method=sms

var options = {
    host: "r.whatsapp.net",
    port: 443,
    path: "/v1/exist.php?cc=1&in=19519993267&udid=2baff2e60318eb53fad812612eac4241",
    method: "GET",
    headers: {
        "User-Agent": "WhatsApp/2.8.0 WP7/7.10.7720 Device/Nokia-Lumia_900-1.0",
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
