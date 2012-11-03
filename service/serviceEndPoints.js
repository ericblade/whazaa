console.log("*** Loading waapi");

require.paths.push("./");
require.paths.push("./node_modules");

var fs = require('fs');
var servicePath = fs.realpathSync('.');
var modulePath = servicePath + '/node_modules';

var waApi = require(modulePath + '/testapi.js').waApi;
var https = require(modulePath + '/gvHttps.js').gvhttps;

var beginSession = Class.create({
    run: function(future, factory) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
		assistant.accountId = args.accountId;
        
        setInterval(function ping() {
            var f = factory.get();
            f.result = { returnValue: true };
        }, 25000);
        //var wa = new waApi("phonenumber", "password", { debug: false });
		var wa = new waApi(args.userId, md5(args.password), { debug: true, displayName: args.displayName });
        assistant.wa = wa;
        console.log("*** Begin Session, wa = " + wa);
        wa.addListener('message', function receiveMessage(msg) {
            console.log("received message from api: ", msg);
            var from = msg.getAttributeValue("from");
            console.log("from: " + from);
            var msgId = msg.getAttributeValue("id");
            console.log("id: " + msgId);
            var msgType = msg.getAttributeValue("type");
            console.log("type: " + msgType);
            var msgTimestamp = msg.getAttributeValue("t"); // TODO: is that actually a timestamp?
            console.log("time?: " + msgTimestamp); // 1345973436
            
            console.log("getting message body");
            var body = msg.getChild("body");
            console.log("message body=" + body);
            var msgText = body && body.data;
            console.log("message text=" + msgText);
						
			var visibleName = "";
			var notifyNode = msg.getChild("notify");
			if(notifyNode) {
				visibleName = notifyNode.getAttributeValue("name");
			}
			
			//if(msgTimestamp) {
				//msgTimestamp *= 100000;
			//}
            
			var dbMsg = {
				_kind: "com.ericblade.whazaa.immessage:1",
				accountId: assistant.accountId,
				// add a second to the timestamp so it appears slightly newer than it actually was, hopefully that will keep messages in the right orders.
				localTimestamp: parseInt(((msgTimestamp * 1000)+100), 10),
				timestamp: parseInt(((msgTimestamp * 1000)+100), 10),
				folder: "inbox",
				status: "successful",
				messageText: msgText,
				from: {
					addr: from
				},
				to: [
					{ addr: "19519993267@s.whatsapp.net" },
				],
				serviceName: "type_whazaa",
				username: "19519993267@s.whatsapp.net"
			};
			DB.put( [ dbMsg ]).then(function(fut) {
				console.log("message put result=" + JSON.stringify(fut.result));
				fut.result = { returnValue: true };
			});
			var i = from.indexOf("@");
			var phoneNumber = "";
			if(i == -1) {
				phoneNumber = from;
				from += "@s.whatsapp.net";
			} else {
				phoneNumber = from.substring(0, i);
			}
			PalmCall.call("palm://com.ericblade.whazaa.service/", "addContact", {
				jid: from,
				phoneNumber: phoneNumber,
				name: visibleName,
			});
            var f2 = factory.get();
            f2.result = { visibleName: visibleName, from: from, msgId: msgId, msgType: msgType, msgTimestamp: msgTimestamp, msgText: msgText, returnValue: true };
        });
		wa.addListener('composing', function composing(from) {
			console.log("*** received composing");
			var f2 = factory.get();
			f2.result = { composing: from, returnValue: true };
		});
		wa.addListener('paused', function paused(from) {
			console.log("*** received pause");
			var f2 = factory.get();
			f2.result = { paused: from, returnValue: true };
		});
		wa.addListener('msgReceived', function receiveReceive(data) {
			console.log("*** received receive");
			var f2 = factory.get();
			f2.result = { received: data, returnValue: true };
		});
		wa.addListener('presence', function receivePresence(data) {
			console.log("*** received presence");
			var f2 = factory.get();
			f2.result = { presence: data, returnValue: true };
		});
		wa.addListener('serverAccept', function receiveAccept(data) {
			console.log("*** received accept");
			var f2 = factory.get();
			f2.result = { accept: data, returnValue: true };
		});
		wa.addListener('loggedin', function loggedIn() {
			var f2 = factory.get();
			f2.result = { loggedin: true, returnValue: true };
		});
		wa.addListener('iqerror', function iqError(data) {
			var f2 = factory.get();
			f2.result = { iqError: data, returnValue: true };
		});
		wa.addListener('iqquerylast', function iqQueryLast(data) {
			var f2 = factory.get();
			f2.result = { queryLast: true, from: data.from, seconds: data.seconds, returnValue: true };
		});
		wa.addListener('notAuthorized', function notAuth() {
			var f2 = factory.get();
			f2.result = { returnValue: false, notAuthorized: true };
		});
		wa.addListener('connectionReplaced', function replaced() {
			var f2 = factory.get();
			f2.result = { returnValue: false, connectionReplaced: true };
		});
		wa.addListener('media', function receivedMedia(data) {
			var f2 = factory.get();
			f2.result = { returnValue: true, media: data };
		});
    }
});

var sendIM = Class.create({
    run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
        console.log("sendIM run");
        if(!assistant.wa) {
            var wa = new waApi("phonenumber", "password");
            assistant.wa = wa;
        }
        assistant.wa.sendMessageWithBody({ to: args.to, content: args.text });
    }
});

var addContact = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
		console.log("addContact run args=" + JSON.stringify(args));
		
		// TODO: we need to somehow make sure that we are passing accountId to all calls!
		if(!assistant.accountId) {
			assistant.accountId = "++I6lW8rL+xdG_hw";
		}
		var c = {
			_kind: "com.ericblade.whazaa.contact:1",
			remoteId: args.jid,
			accountId: assistant.accountId,
			nickname: args.name,
			imBuddy: true,
			phoneNumbers: [],
			ims: [],
			emails: [],
			photos: []
		};
		c.phoneNumbers.push({
			type: "type_mobile",
			value: args.phoneNumber
		});
		c.ims.push({
			serviceName: "type_whazaa",
			type: "type_whazaa",
			label: "type_other",
			value: args.jid
		});
		
		console.log("contact info=" + JSON.stringify(c));
		var dbQuery = {
			from: "com.ericblade.whazaa.contact:1",
			where: [
				{ "prop":"remoteId", "op":"=", "val":c.remoteId }
			]
		};
		DB.find(dbQuery, false, false).then(function(f) {
			if(f.result.results.length == 0) {
				DB.put([ c ]);
				//console.log("add contact " + JSON.stringify(c));
			} else {
				DB.merge([ { "_id":
						  f.result.results[0]["_id"],
						  nickname: c.nickname,
						  phoneNumbers: c.phoneNumbers,
						  ims: c.ims,
						  emails: c.emails,
						  photos: c.photos } ]);
				//console.log("merge contact " + JSON.stringify(c));
			}
			future.result = { returnValue: true };
		});
	}
});

crypto = require('crypto');

function md5(x) {
    return crypto.createHash('md5').update(x).digest("hex");
}

var getRegistrationCode = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;

		var buildHash = "9ad2b9f04958c0bd7a4eef02ca1b62ec65e89138";
		var waVer = "2.8.2";
		var waPlatform = "WP7";
		var waPlatformVer = "7.10.7720";
		var waDevice = "Device/Nokia-Lumia_900-1.0";
		
		var tokenConst = "k7Iy3bWARdNeSL8gYgY6WveX12A1g4uTNXrRzt1H";
		
		var token = md5(tokenConst + buildHash + args["in"]).toLowerCase();
		
		var options = {
			host: "r.whatsapp.net",
			//host: "s.whatsapp.net",
			port: 443,
			path: "/v1/code.php?cc=" + args.cc + "&in=" + args["in"] + "&mcc=000&mnc=000&imsi=0&method=sms&token="+token,
			//			method: "GET",
			headers: {
				"User-Agent": "WhatsApp/" + waVer + " " + waPlatform + "/" + waPlatformVer + " " + waDevice,
				//"User-Agent": "WhatsApp/2.8.0 WP7/7.10.7720 Device/Nokia-Lumia_900-1.0",
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "text/xml",
				"Accept-Language": "en-us",
				"Accept-Encoding": "gzip, deflate",
				"Connection": "keep-alive",
			}
		};
		
		var req = https(options, function(error, resp, body) {
			if(error) {
				future.result = { returnValue: false, error: error };
			} else {
				future.result = { returnValue: true, response: resp, body: body };
			}
		});
	}
});

var registerCode = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
		
		var options = {
			host: "r.whatsapp.net",
			port: 443,
			path: "/v1/register.php?cc=" + args.cc + "&in=" + args["in"] + "&udid=" + md5(args.udid) + "&code=" + args.code,
			method: "GET",
			headers: {
				//"User-Agent": "WhatsApp/2.8.13 S60Version/5.2 Device/C7-00",
				"User-Agent": "WhatsApp/2.8.0 WP7/7.10.7720 Device/Nokia-Lumia_900-1.0",
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "text/xml"
			}
		};
		
		var req = https(options, function(error, resp, body) {
			if(error) {
				future.result = { returnValue: false, error: error };
			} else {
				future.result = { returnValue: true, response: resp, body: body };
			}
		});
	}
});

var serverPing = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
        console.log("sendIM run");
        if(!assistant.wa) {
            var wa = new waApi("phonenumber", "password");
            assistant.wa = wa;
        }
        assistant.wa.sendPing();		
	}
});

var sendTyping = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
        console.log("sendIM run");
        if(!assistant.wa) {
            var wa = new waApi("phonenumber", "password");
            assistant.wa = wa;
        }
		assistant.wa.sendTyping("17079925233@s.whatsapp.net");
	}
});

var sendPaused = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
        console.log("sendIM run");
        if(!assistant.wa) {
            var wa = new waApi("phonenumber", "password");
            assistant.wa = wa;
        }
		assistant.wa.sendPaused("17079925233@s.whatsapp.net");
	}
});

var getLastOnline = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
		console.log("getLastOnline run");
		if(!assistant.wa) {
			var wa = new waApi("phonenumber", "password");
			assistant.wa = wa;
		}
		// TODO: need to grab google's javascript libphonenumber thing to parse shit with
		if(args.jid.indexOf("+") == 0) {
			args.jid = args.jid.substring(1, args.jid.length); 
		}
		if(args.jid.indexOf("(") == -1)
			assistant.wa.getLastOnline(args.jid);
		future.result = { returnValue: true };
	}
});

var setCustomStatus = Class.create({
	run: function(future) {
		var args = this.controller.args;
		var assistant = this.controller.service.assistant;
		console.log("setCustomStatus run");
		if(!assistant.wa) {
			console.log("whatsapp not running");
			future.result = { returnValue: false };
		} else {
			assistant.wa.sendStatusUpdate(args.status);
			future.result = { returnValue: true };
		}
	}
})

var checkCredentials = Class.create({
    run: function(future) {
        console.log("checkCredentials run");
    }
});

var onCreate = Class.create({
    run: function(future) {
        console.log("onCreate run");
    }
});

var onDelete = Class.create({
    run: function(future) {
        console.log("onDelete run");
    }
});

var onCapabilitiesChanged = Class.create({
    run: function(future) {
        console.log("onCapabilitiesChanged run");
    }
});

var onEnabled = Class.create({
    run: function(future) {
        console.log("onEnabled run");
    }
});

var sync = Class.create({
    run: function(future) {
        console.log("sync run");
    }
});

var onCredentialsChanged = Class.create({
    run: function(future) {
        console.log("onCredentialsChanged run");
    }
});

var loginStateChanged = Class.create({
    run: function(future) {
        console.log("loginStateChanged run");
    }
});

var sendCommand = Class.create({
    run: function(future) {
        console.log("sendCommand run");
    }
});
