/*
 normal message:
 <message from="17079925233@s.whatsapp.net" id="1345326759-13" type="chat" t="1345330448">
    <notify xmlns="urn:xmpp:whatsapp" name="Eric Blade">
    </notify>
    <request xmlns="urn:xmpp:receipts">
    </request>
    <body>
        Jfudididkd
    </body>
    <delay xmlns="urn:xmpp:delay" from="s.whatsapp.net" stamp="2012-08-18T22:54:08Z">
        Offline Storage
    </delay>
    <x xmlns="jabber:x:delay" stamp="20120818T22:54:08">
    </x>
</message>
*/ 
/*
 *Audio message:
  <message from="17079925233@s.whatsapp.net" id="1345326759-9" type="chat" t="1345330188">
    <notify xmlns="urn:xmpp:whatsapp" name="Eric Blade">
    </notify>
    <request xmlns="urn:xmpp:receipts">
    </request>
    <media xmlns="urn:xmpp:whatsapp:mms" type="audio" encoding="raw" url="https://mms302.whatsapp.net/d11/18/15/4/4/44e3247f04cc83037c638b952a2aec6e.amr" file="44e3247f04cc83037c638b952a2aec6e.amr" size="5158">
    </media>
</message>
*/

/*
 * VCard message:
<message from="17079925233@s.whatsapp.net" id="1345326759-11" type="chat" t="1345330340">
    <notify xmlns="urn:xmpp:whatsapp" name="Eric Blade">
    </notify>
    <request xmlns="urn:xmpp:receipts">
    </request>
    <media xmlns="urn:xmpp:whatsapp:mms" type="vcard" encoding="text">
    <vcard name="7346205865@tmomail.net">
        BEGIN:VCARD
VERSION:3.0
N:;;;;
FN:7346205865@tmomail.net
item1.EMAIL;type=INTERNET:7346205865@tmomail.net
item1.X-ABLabel:Other
END:VCARD
    </vcard>
    </media>
</message>
*/

enyo.kind({
	name: "Synergy",
	kind: enyo.VFlexBox,
	flex: 1,
	components: [
		{ name: "getContacts", kind: "PalmService", service: "palm://com.palm.db/", method: "find", onSuccess: "receivedContacts" },
		{ name: "service", kind: "PalmService", service: "palm://com.ericblade.whazaa.service/", subscribe: false },
		{ name: "launcher", kind: "PalmService", service: "palm://com.palm.applicationManager", method: "launch" },
		{ name: "CreateSynergyAccount", kind: "PalmService", service: "palm://com.palm.service.accounts/", method: "createAccount", onSuccess: "synergyAccountCreated", onFailure: "synergyAccountFailed" },
		{ name: "GetSynergyAccount", kind: "PalmService", service: "palm://com.palm.service.accounts/", method: "getAccountInfo", onSuccess: "synergyAccountReceived", onFailure: "synergyAccountInfoFail" },
		{ name: "outboxWatch", kind: "PalmService", service: "palm://com.palm.db/", method: "find", onSuccess: "outboxMessage", onFailure: "watchFail", subscribe: true },
		{ kind: "DbService", dbKind: "com.ericblade.whazaa.immessage", onFailure: "dbFailure", components:
			[
				{ name: "dbDel", method: "del", onSuccess: "delSuccess" },
				{ name: "mergeStatus", method: "merge", onSuccess: "mergeStatusSuccess" },
			]
		},
		{ kind: "AppMenu", components:
			[
				{ caption: "CodeView", onclick: "doCodeView" },
				{ caption: "RegisterView", onclick: "doRegisterView" },
				{ caption: "MessagingView", onclick: "doMessagingView" },
				{ caption: "Import Contacts", onclick: "importContacts" },
				{ caption: "Change Status", onclick: "doStatusView" },
			]
		},
		
		{ name: "MainPane", flex: 1, kind: "Pane", components:
			[
				{ content: "Main View" },
				{ name: "CodeView", kind: "CodeView", onCodeSent: "doRegisterView" },
				{ name: "RegisterView", kind: "RegisterView", onRegisterSuccess: "doMessagingView" },
				{ name: "MessagingView", kind: "MessagingView", onCodeView: "doCodeView" },
				{ name: "StatusView", kind: "StatusView", onMessagingView: "doMessagingView" },
			]
		},
	],
	importContacts: function() {
		this.$.launcher.call({
			id: "com.palm.whazaacontacts",
			params: {
				accountId: localStorage["synergyAccount"]
			}
		});
	},
	receivedContacts: function(x, y, z) {
		enyo.application.contacts = y.results;
	},
	doStatusView: function() {
		this.$.MainPane.selectViewByName("StatusView");
	},
	doCodeView: function() {
		this.$.MainPane.selectViewByName("CodeView");
	},
	doMessagingView: function() {
		this.$.MainPane.selectViewByName("MessagingView");
	},
	createSynergyAccount: function()
	{
		this.$.CreateSynergyAccount.call(
			{
				"templateId": "com.ericblade.whazaa.account",
				"capabilityProviders": [ //{ "id": "com.ericblade.googlevoiceapp.phone", "capability":"PHONE"},
										//{ "id": "com.ericblade.googlevoiceapp.contacts", "capability": "CONTACTS" },
										//{ "id": "com.ericblade.googlevoiceapp.text", "capability":"MESSAGING", "capabilitySubtype": "SMS"},
										{"id": "com.ericblade.whazaa.account.im", "capability":"MESSAGING", "_sync": true }],
				"username": "9519993267",
				"alias": "Whazaa!",
				"credentials": { "common": {"password":"password", "authToken":"authToken"} },
				//"password": "password",
				"config": { "ip": "8.8.8.8" }
			} 
		);	
	},
	querySynergyAccount: function()
	{
		enyo.log("querySynergyAccount");
		this.$.GetSynergyAccount.call({ accountId: localStorage["synergyAccount"] });
	},
	synergyAccountInfoFail: function(inSender, res)
	{
		enyo.log("synergyAccountInfoFail", res);
		this.createSynergyAccount();
	},
	synergyAccountReceived: function(inSender, res)
	{
		enyo.log("synergyAccountReceived", res);
		if(res.result.beingDeleted)
		    this.createSynergyAccount();
		else {
			this.SynergyAccount = res.result["_id"];
			enyo.log("***************** SYNERGY ACCOUNT ID=", this.SynergyAccount);
			this.$.outboxWatch.call({
				"query":
				{
					"from":"com.ericblade.whazaa.immessage:1",
					"where": [
						{ "prop":"folder", "op":"=", "val":"outbox" },
						{ "prop":"status", "op":"=", "val":"pending" }, // TODO: mark these as successful!! or delete them
					]
				},
				"watch": true,
			});
		}
	},
	synergyAccountCreated: function(inSender, res)
	{
		/*  {"result":{"_kind":"com.palm.account:1","templateId":"com.ericblade.googlevoiceapp.account",
			"username":"(configure in GVoice app)","alias":"Google Voice","beingDeleted":false,
			"capabilityProviders":[{"id":"com.ericblade.googlevoiceapp.sms","capability":"PHONE"}],
			"_id":"++Hs9+gGfJF3eKSa"},"returnValue":true} */
		enyo.log("synergyAccountCreated", res);
		this.SynergyAccount = res.result["_id"];
		localStorage["synergyAccount"] = this.SynergyAccount;
		enyo.log("***************** SYNERGY ACCOUNT ID=", this.SynergyAccount);
		this.$.outboxWatch.call({
			"query":
			{
				"from":"com.ericblade.whazaa.immessage:1",
				"where": [
					{ "prop":"folder", "op":"=", "val":"outbox" },
					{ "prop":"status", "op":"=", "val":"pending" }, // TODO: mark these as successful!! or delete them					
				]
			},
			"watch": true,
		});
	},
	synergyAccountFailed: function(inSender, res)
	{
		/*  {"errorText":"Unable to create a duplicate account","errorCode":"DUPLICATE_ACCOUNT","exception":"[object Object]","returnValue":false}, */
		enyo.log("synergyAccountFailed", res);
	},
	outboxMessage: function(inSender, inResponse)
	{
		enyo.log("fired=", inResponse.fired);
		enyo.log("results=", inResponse.results);
		if(inResponse.fired)
		{
			this.$.outboxWatch.call({
				"query":
				{
					"from":"com.ericblade.whazaa.immessage:1",
					"where": [
						{ "prop":"folder", "op":"=", "val":"outbox" },
						{ "prop":"status", "op":"=", "val":"pending" }, // TODO: mark these as successful!! or delete them
					]
				},
				"watch": true,
			});
		} else if(inResponse.results)
		{
			var mergeIDs = [ ];
			for(var x = 0; x < inResponse.results.length; x++)
			{
				mergeIDs.push( { "_id": inResponse.results[x]["_id"], "status":"successful" } );
				if(inResponse.results[x].to[0].addr.indexOf("+") == 0) {
					inResponse.results[x].to[0].addr = inResponse.results[x].to[0].addr.substring(1, inResponse.results[x].to[0].addr.length);
				}
				this.$.service.call({ to: inResponse.results[x].to[0].addr, text: inResponse.results[x].messageText }, { method: "sendIM" });
			}
			this.$.mergeStatus.call( { "objects": mergeIDs } );
		}
		enyo.log("outboxMessage", inResponse);
	},
	
	create: function (inSender, inEvent) {
        this.USESYNERGY = true;
		//this.USESYNERGY = false;
			
		this.inherited(arguments);
		if(window.PalmSystem && this.USESYNERGY)
		{
			if(localStorage["synergyAccount"])
				this.querySynergyAccount();
			else
				this.createSynergyAccount();
		}
		this.$.getContacts.call({
			query: {
				from: "com.ericblade.whazaa.contact:1"
			}
		});
	},
	
	rendered: function() {
		this.inherited(arguments);
		if(!localStorage["waAccountId"]) {
			console.log("Selecting Code View");
			this.$.MainPane.selectViewByName("CodeView");
		} else {
			console.log("Selecting Messaging View");
			this.$.MainPane.selectViewByName("MessagingView");
			//this.$.MessagingView.login();
		}
	},
	doRegisterView: function() {
		this.$.MainPane.selectViewByName("RegisterView");
	}
});

enyo.kind({
	name: "CodeView",
	kind: enyo.VFlexBox,
	components: [
		{ name: "GetCode", kind: "PalmService", service: "palm://com.ericblade.whazaa.service/", method: "getRegistrationCode", onSuccess: "codeSuccess", onFailure: "codeFailure" },
		{ name: "ErrorBox", content: "" },
				{ content: "Country Code (1 for US)" },
				{ name: "ccInput", kind: "Input", hint: "Country Code", value: "1", alwaysLookFocused: true },
				{ content: "Phone Number" },
				{ name: "phoneInput", kind: "Input", hint: "Phone Number", alwaysLookFocused: true },
		{ kind: "Button", caption: "Get Code", onclick: "getCode" },
		{ content: "Tapping Get Code will cause WhatsApp to send a 3 digit code to that phone number via SMS. Enter that code on the next screen. If you do not receive a code, wait 60 seconds before trying again. If the device with that phone number already has WhatsApp, that device will need to re-register to use it again."},
		{ kind: "Button", caption: "I already have a code", onclick: "alreadyHaveCode"},
	],
	events: {
		"onCodeSent": "",
	},
	getCode: function() {
		var params = {
			"cc": this.$.ccInput.getValue(),
			"in": this.$.phoneInput.getValue(),
		};
		this.$.GetCode.call(params);
		enyo.application.cc = this.$.ccInput.getValue();
		enyo.application.phone = this.$.phoneInput.getValue();
		localStorage["waAccountId"] = this.$.ccInput.getValue() + this.$.phoneInput.getValue();
		this.$.ErrorBox.setContent("Requesting Code...");
	},
	alreadyHaveCode: function() {
		enyo.application.cc = this.$.ccInput.getValue();
		enyo.application.phone = this.$.phoneInput.getValue();
		localStorage["waAccountId"] = this.$.ccInput.getValue() + this.$.phoneInput.getValue();
		this.doCodeSent();
	},
	codeSuccess: function(x, y, z) {
		var msg = "";
		y = y.body;
		this.log("x=", x, "y=", JSON.stringify(y), "z=", z);
		var statusstr = '<response status="' /*-too-recent" result="'*/;
		var i = y.indexOf(statusstr);
		if(i !== -1) {
			i += statusstr.length;
			var j = y.indexOf('"', i+1);
			var status = y.substring(i, j);
			msg = "Code status: " + status;
			var k = y.indexOf('result="');
			if(k !== -1) {
				k += 'result="'.length;
				var l = y.indexOf('"', k+1);
			}
			if(k !== -1 && l) {
				var retrytime= y.substring(k, l);
				msg += " Retry time: " + retrytime;
			}
			this.$.ErrorBox.setContent(msg);
			if(status == "success-sent") {
				this.doCodeSent();
			}
		}
	},
	codeFailure: function(x, y, z) {
		this.log("x=", x, "y=", JSON.stringify(y), "z=", z);
	}
});

enyo.kind({
	name: "RegisterView",
	kind: enyo.VFlexBox,
	events: {
		"onRegisterSuccess": "",
	},
	components: [
		{ name: "Register", kind: "PalmService", service: "palm://com.ericblade.whazaa.service/", method: "registerCode", onSuccess: "registerSuccess", onFailure: "registerFailure" },
		{ name: "ErrorBox", content: "" },
				{ content: "Enter Code" },
				{ name: "codeInput", kind: "Input", hint: "Code", alwaysLookFocused: true },
				{ content: "Your Name (for people who don't have you in their contacts)" },
				{ name: "nameInput", kind: "Input", hint: "Your Name", alwaysLookFocused: true },
		{ kind: "Button", caption: "Register Code", onclick: "register" },
		{ content: "Enter the 3-digit code you received via SMS, and your device will be registered to the service." },		
	],
	register: function() {
		this.log();
		var deviceInfo = enyo.fetchDeviceInfo();
		var params = {
			cc: enyo.application.cc,
			"in": enyo.application.phone,
			udid: deviceInfo.serialNumber,
			code: this.$.codeInput.getValue()
		}
		this.$.Register.call(params);
		enyo.application.serial = deviceInfo.serialNumber;
		localStorage["waPassword"] = deviceInfo.serialNumber;
		localStorage["waName"] = this.$.nameInput.getValue() || "Whazaa!";
	},
	registerSuccess: function(x, y, z) {
		var msg = "";
		y = y.body;
		this.log("x=", x, "y=", JSON.stringify(y), "z=", z);
		var statusstr = '<response status="' /*-too-recent" result="'*/;
		var i = y.indexOf(statusstr);
		if(i !== -1) {
			i += statusstr.length;
			var j = y.indexOf('"', i+1);
			var status = y.substring(i, j);
			msg = "Code status: " + status;
			var k = y.indexOf('result="');
			if(k !== -1) {
				k += 'result="'.length;
				var l = y.indexOf('"', k+1);
			}
			if(k !== -1 && l) {
				var retrytime= y.substring(k, l);
				msg += " Retry time: " + retrytime;
			}
			this.$.ErrorBox.setContent(msg);
			if(status == "ok") { // <response status="ok" login="19519993267" result="new">
				this.doRegisterSuccess();
			}
		}
	},
	registerFailure: function(x, y, z) {
		this.log("x=", x, "y=", JSON.stringify(y), "z=", z);
	}	
});

enyo.kind({
	name: "StatusView",
	kind: enyo.VFlexBox,
	events: {
		"onMessagingView": "",
	},
	components: [
		{ name: "setStatus", kind: "PalmService", service: "palm://com.ericblade.whazaa.service/", method: "setCustomStatus", onSuccess: "statusSuccess", onFailure: "statusFailure" },
		{ content: "Enter new status message" },
		{ name: "StatusInput", kind: "Input", hint: "Status" },
		{ kind: "Button", caption: "Submit Update", onclick: "updateStatus" },
	],
	updateStatus: function(inSender, inEvent) {
		this.$.setStatus.call({ status: this.$.StatusInput.getValue() });
		this.doMessagingView();
	}
});

enyo.kind({
	name: "MessagingView",
	kind: enyo.VFlexBox,
	events: {
		"onCodeView": "",
	},
	components: [
		{ name: "start", kind: "PalmService", service: "palm://com.ericblade.whazaa.service/", method: "beginSession", subscribe: true, onSuccess: "sessionSuccess", onFailure: "sessionFailure" },
		{ name: "service", kind: "PalmService", service: "palm://com.ericblade.whazaa.service/", subscribe: false },
		{ name: "NotAuthPopup", kind: "Popup", components:
			[
				{ content: "Server says we are not authorized. Most likely you have signed in on another device. You will need to re-register this device to use it again." },
				{ kind: "Button", caption: "Ok", onclick: "closeAuthPopup" },
			]
		},
		{ name: "ConnectionReplacedPopup", kind: "Popup", components:
			[
				{ content: "Server says our connection has been taken over by another device. We are no longer connected. If you did not login from another location, you may have been hacked."},
				{ kind: "Button", caption: "Ok", onclick: "closeConnectionReplacedPopup" },
			]
		},
		{ kind: "Button", caption: "Subscribe To Service", onclick: "startService" },
				{ name: "RecpInput", kind: "Input", hint: "To" },
				{ name: "MessageInput", kind: "Input", hint: "Enter Message", flex: 1, },
				{ kind: "Button", caption: "Send", onclick: "sendMessage" },
		{ name: "scroller", kind: "FadeScroller", flex: 1, components:
			[
				{ name: "MessageRepeater", kind: "VirtualRepeater", onSetupRow: "setupMessages", onclick: "messageTap", components:
					[
						{ name: "MessageArea" },
					]
				},
			]
		},
	],
	closeConnectionReplacedPopup: function() {
		this.$.ConnectionReplacedPopup.close();
	},
	closeAuthPopup: function() {
		this.$.NotAuthPopup.close();
	},
	create: function() {
		this.inherited(arguments);
		this.messages = [];
	},
	login: function() {
		return;
		this.$.start.call({
			userId: localStorage["waAccountId"],
			password: localStorage["waPassword"],
			accountId: localStorage["synergyAccount"],
			displayName: localStorage["waName"]
		});		
	},
	messageTap: function(inSender, inEvent) {
		if(this.messages[inEvent.rowIndex])
		    this.$.RecpInput.setValue(this.messages[inEvent.rowIndex].from);
	},
	sendPing: function() {
		this.$.service.call({ }, { method: "serverPing" });
	},
	sendMessage: function() {
		this.$.service.call({ to: this.$.RecpInput.getValue(), text: this.$.MessageInput.getValue() }, { method: "sendIM" });
		this.$.MessageInput.setValue("");
	},
	startService: function(inSender, inEvent) {
		this.log(inSender, inEvent);
		this.$.start.call({ userId: localStorage["waAccountId"], password: localStorage["waPassword"], accountId: localStorage["synergyAccount"],
						  displayName: localStorage["waName"] });
	},
	sessionSuccess: function(x, y, z) {
		this.log(x + ", " + JSON.stringify(y) + ", " + z);
		if(y.from) {
			this.messages.push({
				msgId: y.msgId,
				from: y.from,
				type: y.msgType,
				time: y.msgTimestamp,
				text: y.msgText,
				visibleName: y.visibleName
			});
			this.$.MessageRepeater.render();
			this.$.scroller.scrollToBottom();
		}
		if(y.composing) {
			this.messages.push({
				msgId: "none",
				from: y.composing,
				type: "chat",
				time: "none",
				text: "typing"
			});
			this.$.MessageRepeater.render();
			this.$.scroller.scrollToBottom();
		}
		if(y.paused) {
			this.messages.push({
				msgId: "none",
				from: y.paused,
				type: "chat",
				time: "none",
				text: "stopped typing"
			});
			this.$.MessageRepeater.render();
			this.$.scroller.scrollToBottom();
		}
		if(y.received) {
			this.messages.push({
				msgId: y.received.id,
				from: y.received.from,
				type: "chat",
				time: Date.now(),
				text: y.received.from + " received msg " + y.received.id
			});
			this.$.MessageRepeater.render();
			this.$.scroller.scrollToBottom();
		}
		if(y.presence) {
			this.messages.push({
				msgId: "none",
				from: y.presence.from,
				type: "presence",
				time: Date.now(),
				text: y.presence.from + " is now " + y.presence.type
			});
			this.$.MessageRepeater.render();
			this.$.scroller.scrollToBottom();
		}
		if(y.accept) {
			this.messages.push({
				msgId: y.accept.id,
				from: y.accept.from,
				type: "accept",
				time: Date.now(),
				text: "server accepts msg " + y.accept.id + " to " + y.accept.from
			})
		}
		if(y.loggedin) {
			/*this.log("***** App detects login! Spamming contact requests.");
			if(enyo.application.contacts && enyo.application.contacts.length) {
				for(var i = 0; i < enyo.application.contacts.length; i++) {
					var contact = enyo.application.contacts[i];
					if(contact.ims && contact.ims.length > 0) {
						for(k = 0; k < contact.ims.length; k++) {
							var address = contact.ims[k];
							if(address.value.indexOf("@s.whatsapp.net") > -1) {
								console.log("***** Asking for status on " + address.value);
								this.$.service.call({
									jid: address.value
								}, { method: "getLastOnline" });
							}
						}
					}
				}
			}*/
		}
		if(y.queryLast) {
			this.messages.push({
				from: y.from,
				text: y.from + " was last seen " + y.seconds + " seconds ago.",
			});
		}
		// TODO: these returnValue false, why don't they go to the Failure code?
		if(y.notAuthorized) {
			this.doCodeView();
			enyo.nextTick(this.$.NotAuthPopup, this.$.NotAuthPopup.openAtCenter);
		}
		if(y.connectionReplaced) {
			this.$.ConnectionReplacedPopup.openAtCenter();
		}
		if(y.media) {
			this.messages.push({
				from: y.from,
				text: "MEDIA RECEIVED: " + JSON.stringify(y),
			});
		}
	},
	sessionFailure: function(x, y, z) {
		this.log(x + ", " + JSON.stringify(y) + ", " + z);
		if(y.notAuthorized) {
			this.$.NotAuthPopup.openAtCenter();
			this.doCodeView();
		}
		if(y.connectionReplaced) {
			this.$.ConnectionReplacedPopup.openAtCenter();
		}
	},
	setupMessages: function(inSender, inRow) {
		var msg = this.messages && this.messages[inRow];
		if(msg) {
			this.$.MessageArea.setContent("Msg " + msg.msgId + " from " + msg.from + " (" + msg.visibleName + ") at " + msg.time + ": " + msg.text);
			this.$.RecpInput.setValue(msg.from);
			return true;
		}
		return false;
	}
});

