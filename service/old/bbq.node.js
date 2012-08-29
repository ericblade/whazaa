var https = require('https');

// https://r.whatsapp.net/v1/code.php?cc=1&in=9519993267&to=19519993267&lc=US&lg=en&mcc=000&mnc=000&imsi=0&method=sms

var options = {
    host: "sro.whatsapp.net",
    port: 443,
    path: "/client/iphone/bbq.php?me=9519993267&cc=1&u[]=17079925233&u[]=19519993267",
    //path: "/client/iphone/bbq.php",
    //method: "POST",
    method: "GET",
    headers: {
        "User-Agent": "WhatsApp/2.8.13 S60Version/5.2 Device/C7-00",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/xml"
    }
};

//var post = "me=9519993267&cc=1";
//post += "&u[]=17079925233&u[]=19519993267";

var req = https.request(options, function(res) {
    console.log("statusCode", res.statusCode);
    console.log("headers", res.headers);
    res.on('data', function(d) {
        process.stdout.write(d);
    });
});

//req.write(post);

req.end();
req.on('error', function(e) {
    console.error(e);
});
