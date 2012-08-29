// <response status="fail-too-recent" result="35"/>
// ^^ length of time you must wait before applying for another code
var https = require('https');

// https://r.whatsapp.net/v1/code.php?cc=1&in=9519993267&to=19519993267&lc=US&lg=en&mcc=000&mnc=000&imsi=0&method=sms

var options = {
    host: "r.whatsapp.net",
    //host: "s.whatsapp.net",
    port: 443,
    path: "/v1/code.php?cc=1&in=7079925233&mcc=000&mnc=000&imsi=0&method=sms&reason=self-send-timeout&code=911",
    //path: "/client/iphone/smsproxy.php?to=17342235060&auth=509&in=7342235060&code=1&udid=1234567890",
    //path: "/client/iphone/smsproxy.php?to=17079925233&in=7342235060&code=1&udid=0e83ff56a12a9cf0c7290cbb08ab6752181fb54b&auth=401",
    //path: "/v1/code.php?cc=1&token=9fe2a4f90b4acff715d1daf84428bddd&to=17079925233&in=7079925233&lg=en&lc=US&mcc=000&mnc=000&imsi=0&method=sms",
    method: "GET",
    headers: {
        "User-Agent": "WhatsApp/2.8.1504 Android/4.0.2 Device/samsung-Galaxy_Nexus",
        //"User-Agent": "WhatsApp/2.1.0 S40Version/04.60 Device/nokiac3-00",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/xml",
        "Accept-Language": "en-us",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
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
