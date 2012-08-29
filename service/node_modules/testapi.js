const dictionary =
	[
        undefined, "stream:stream", "/stream:stream", undefined, undefined,
        "1", "1.0", "ack", "action", "active", "add", "all", "allow", "apple", "audio", "auth", "author", "available",
        "bad-request", "base64", "Bell.caf", "bind", "body", "Boing.caf",
        "cancel", "category", "challenge", "chat", "clean", "code", "composing", "config", "conflict", "contacts", "create", "creation",
        "default", "delay", "delete", "delivered", "deny", "DIGEST-MD5", "DIGEST-MD5-1", "dirty",
        "en", "enable", "encoding", "error", "expiration", "expired",
        "failure", "false", "favorites", "feature", "field", "free", "from",
        "g.us", "get", "Glass.caf", "google", "group", "groups", "g_sound",
        "Harp.caf", "http://etherx.jabber.org/streams", "http://jabber.org/protocol/chatstates",
        "id", "image", "img", "inactive", "internal-server-error", "iq", "item", "item-not-found",
        "jabber:client", "jabber:iq:last", "jabber:iq:privacy", "jabber:x:delay", "jabber:x:event", "jid", "jid-malformed",
        "kind",
        "leave", "leave-all", "list", "location",
        "max_groups", "max_participants", "max_subject", "mechanism", "mechanisms", "media", "message", "message_acks", "missing", "modify",
        "name", "not-acceptable", "not-allowed", "not-authorized", "notify",
        "Offline Storage", "order", "owner", "owning",
        "paid", "participant", "participants", "participating", "particpants", "paused", "picture", "ping", "PLAIN", "platform", "presence",
        "preview", "probe", "prop", "props", "p_o", "p_t",
        "query",
        "raw", "receipt", "receipt_acks", "received", "relay", "remove", "Replaced by new connection", "request", "resource", "resource-constraint",
        "response", "result", "retry", "rim",
        "s.whatsapp.net", "seconds", "server", "session", "set", "show", "sid", "sound", "stamp", "starttls", "status", "stream:error",
        "stream:features", "subject", "subscribe", "success", "system-shutdown", "s_o", "s_t",
        "t", "TimePassing.caf", "timestamp", "to", "Tri-tone.caf", "type",
        "unavailable", "uri", "url", "urn:ietf:params:xml:ns:xmpp-bind", "urn:ietf:params:xml:ns:xmpp-sasl", "urn:ietf:params:xml:ns:xmpp-session",
        "urn:ietf:params:xml:ns:xmpp-stanzas", "urn:ietf:params:xml:ns:xmpp-streams", "urn:xmpp:delay", "urn:xmpp:ping", "urn:xmpp:receipts",
        "urn:xmpp:whatsapp", "urn:xmpp:whatsapp:dirty", "urn:xmpp:whatsapp:mms", "urn:xmpp:whatsapp:push",
        "value", "vcard", "version", "video",
        "w", "w:g", "w:p:r", "wait",
        "x", "xml-not-well-formed", "xml:lang", "xmlns", "xmlns:stream", "Xylophone.caf",
        "account","digest","g_notify","method","password","registration","stat","text","user","username","event","latitude","longitude",
        "true", "after", "before", "broadcast", "count", "features", "first", "index", "invalid-mechanism", undefined, // 205-214
        "max", "offline", "proceed", "required", "sync", "elapsed", "ip", "microsoft", "mute", "nokia", "off", "pin", // 215-226
        "pop_mean_time", "pop_plus_minus", "port", "reason", "server-error", "silent", "timeout", "lc", "lg", "bad-protocol", // 227-236
        "none", "remote-server-timeout", "service-unavailable", /*"w:p"*/undefined, "w:profile:picture", "notification", // 237-242        
    ];

var net = require('net');
var base64 = require('./base64');
var crypto = require('crypto');
var fs = require('fs');
//var pack = require('./pack');
var uuid = require('./uuid');

function md5(x) {
    return crypto.createHash('md5').update(x).digest("hex");
}
function bytesToHex(bytes) {
    /*var ret = Buffer(bytes.length * 2); // hmmm
    var i = 0;
    for(var c = 0; c < bytes.length; c++) {
        var ub = bytes[c];
        if(ub < 0) {
            ub += 256;
        }
        ret[i] = forDigit(ub >> 4);
        i += 1;
        ret[i] = forDigit(ub % 16);
        i += 1;
    }
    return ret;*/
    return bytes.toString("hex");
}

function forDigit(b) {
    if(b < 10) {
        return (48 + b);
    } else {
        return (97 + b - 10);
    }
}

function hex2str(hex) {
    var str = '';
    for(var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function _hex(in_int)
{
    console.log("_hex", in_int, in_int.toString(16));
    return in_int.toString(16);
}

function splitBuffer(buf, char) {
    var arr = [], p = 0;
    for(var i = 0; i <= buf.length; i++) {
        if(buf[i] !== char) continue;
        if(i === 0) {
            p = 0;
            i = 0;
        }
        arr.push(buf.slice(p, i));
        p = i + 1;
    }
    arr.push(buf.slice(p));
    return arr;
}

function array_shift (inputArr) {
    // Pops an element off the beginning of the array  
    // 
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/array_shift
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Martijn Wieringa
    // %        note 1: Currently does not handle objects
    // *     example 1: array_shift(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: 'Kevin'
    var props = false,
        shift = undefined,
        pr = '',
        allDigits = /^\d$/,
        int_ct = -1,
        _checkToUpIndices = function (arr, ct, key) {
            // Deal with situation, e.g., if encounter index 4 and try to set it to 0, but 0 exists later in loop (need to
            // increment all subsequent (skipping current key, since we need its value below) until find unused)
            if (arr[ct] !== undefined) {
                var tmp = ct;
                ct += 1;
                if (ct === key) {
                    ct += 1;
                }
                ct = _checkToUpIndices(arr, ct, key);
                arr[ct] = arr[tmp];
                delete arr[tmp];
            }
            return ct;
        };
 
 
    if (inputArr.length === 0) {
        return null;
    }
    if (inputArr.length > 0) {
        return inputArr.shift();
    }
}

var EventEmitter = require('events').EventEmitter;

if(process.version == "v0.2.3") {
    util = {};
    util.inherits = require('sys').inherits;
} else {
    util = require('util');
}

var nodes = require('./waNodes');
var ProtocolTreeNode = nodes.ProtocolTreeNode;
var BinTreeNodeWriter = nodes.BinTreeNodeWriter;
var BinTreeNodeReader = nodes.BinTreeNodeReader;

var waApi = function(username, password, opt) {
    this.debug = opt ? opt.debug : false;
    this.iqId = 0;
    console.log("*** constructing waApi for " + username + ": " + password);
    this.loginInfo = {
        username: username,
        password: password,
        resource: "iPhone-2.8.2-5222", // Symbian-2.6.61-443
        domain: "s.whatsapp.net",
        displayName: opt.displayName || "Whazaa!"
    };
    this.socket = net.createConnection(5222, 'bin-short.whatsapp.net');
    this.writer = new BinTreeNodeWriter(this.socket, dictionary, { debug: this.debug });
    this.reader = new BinTreeNodeReader(this.socket, dictionary, { debug: this.debug });
    
    this.socket.addListener('connect', function socketConnected() {
        console.log("*** socket connected");
        this.reader.streamStart();
        this.writer.streamStart(this.loginInfo.domain, this.loginInfo.resource);
        
        var toWrite = new ProtocolTreeNode("stream:features", undefined, [new ProtocolTreeNode("receipt_acks")]);
        console.log("writing features:" + toWrite);
        this.writer.write(toWrite);
        
        var node = new ProtocolTreeNode("auth", { "mechanism":"DIGEST-MD5-1","xmlns":"urn:ietf:params:xml:ns:xmpp-sasl" });
        console.log("sending auth:" + node);
        this.writer.write(node);
    }.bind(this));
    
    this.socket.addListener('close', function socketClosed(x) {
        console.log("***************** SOCKET CLOSED ******************* " + JSON.stringify(x));
        //if(!this.noReconnect)
        //    this.socket.connect(5222, 'bin-short.whatsapp.net');
        this.emit('close');
    }.bind(this));
    
    this.socket.addListener('error', function socketError(err) {
        console.log("***************** SOCKET ERROR ********************" + JSON.stringify(err));
        this.noReconnect = true;
    }.bind(this));
    
    this.reader.addListener('stanza', function handleStanza(node) {
        if(node.tag == "failure" && node.getAttributeValue("xmlns") == "urn:ietf:params:xml:ns:xmpp-sasl" && node.getChild("not-authorized"))
        {
            console.log("**** ACCESS NOT AUTHORIZED");
            this.emit('notAuthorized');
            this.noReconnect = true;
            this.socket.end();
        }
        if(node.tag == "error" && node.getAttributeValue("code") == "404" && node.getAttributeValue("type") == "cancel")
        {
            //<error code="404" type="cancel"> are children of <iq type="error", and I think we can safely ignore them as long as we emit the error.. ??
            return;
        }
        if(node.tag == "item-not-found" && node.getAttributeValue("xmlns") == "urn:ietf:params:xml:ns:xmpp-stanzas") {
            // same as above
            return;
        }
        console.log("received stanza: " + node);
    }.bind(this));
    
    this.reader.addListener('challenge', function handleChallenge(node) {
        console.log("**** Decoding Challenge");
        var challenge = base64.base64.decode(node.data.toString("binary"));
        console.log("*** Challenge = " + challenge);
                
        var i = challenge.indexOf('nonce="');
        i += 'nonce="'.length;
        var j = challenge.indexOf('"', i);
        var nonce = challenge.substring(i, j);
        console.log("nonce=" + nonce);
        var cnonce = uuid.v4();
        console.log("cnonce=" + cnonce);
        var nc = "00000001";
        console.log("nc=" + nc);
        var digest_uri = "xmpp/" + this.loginInfo.domain;
        console.log("digest_uri=" + digest_uri);
        var qop="auth";
        var realm = this.loginInfo.domain;

        var a1 = this.loginInfo.username + ":" + this.loginInfo.domain + ":" + this.loginInfo.password;
        a1 = pack('H32', md5(a1)) + ":" + nonce + ":" + cnonce;
        var a2 = "AUTHENTICATE:" + "xmpp/" + this.loginInfo.domain;
        var password = md5(a1) + ":" + nonce + ":" + nc + ":" + cnonce + ":" + qop + ":" + md5(a2);
        console.log("password prior to encoding:" + password);
        password = md5(password);
        console.log("password post encoding: " + password);
        var bigger_response = 'username="' + this.loginInfo.username + '",'
                    + 'realm="' + realm + '",'
                    + 'nonce="' + nonce + '",'
                    + 'cnonce="' + cnonce + '",'
                    + 'nc=' + nc + ','
                    + 'qop=' + qop + ','
                    + 'digest-uri="' + digest_uri + '",'
                    + 'response=' + password + ','
                    + 'charset=utf-8';
        console.log("response=" + bigger_response);
        
        var node = new ProtocolTreeNode("response", { "xmlns": "urn:ietf:params:xml:ns:xmpp-sasl" }, undefined, base64.base64.encode(bigger_response));
        console.log("Responding with node: " + node);
        this.writer.write(node);
        
        this.sendClientConfig('', '', false, '');
        this.sendAvailable();
        this.sendAvailableForChat();
        //this.sendCustomStatus("GO OPEN WEBOS!");
        
    }.bind(this));
    
    this.reader.addListener('loggedin', function loggedIn(data) {
        console.log("*** Successfully logged in.  Account status: " + data.getAttributeValue("status"));
        console.log("*** Creation Timestamp: " + data.getAttributeValue("creation"));
        console.log("*** Expiration Timestamp: " + data.getAttributeValue("expiration"));
        this.emit('loggedin');
    }.bind(this));
    
    this.reader.addListener('iq', function receivedIq(data) {
        //console.log("received iq: " + data);
        var iqType = data.getAttributeValue("type");
        var idx = data.getAttributeValue("id");
        var jid = data.getAttributeValue("from");
        
        if(!iqType) {
            throw("received iq with no type, data=" + data);
        }
        switch(iqType) {
            case "get":
                var childNode = data.getChild(0);
                if(childNode.tag === "ping") {
                    this.handlePing(idx);
                }
                break;
            case "error":
/*
<iq from="+9597896522@s.whatsapp.net" id="last_14" type="error">
    <error code="404" type="cancel">
    <item-not-found xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">
    </item-not-found>
    </error>
</iq>
*/              this.emit('iqerror', data);
                break;
            case "result":
                var queryNode = data.getChild("query");
                if(queryNode && queryNode.getAttributeValue("xmlns") === "jabber:iq:last") {
                    this.emit('iqquerylast', { from: jid, seconds: queryNode.getAttributeValue("seconds") });
                    break;
                }
                // intentional fall thru for now
                //break;
            case "set":
                // intentional fall thru for now
                //break;
            default:
                console.log("received iq type: " +iqType + ": " + data);
                break;
        }
    }.bind(this));
    
    this.reader.addListener('presence', function receivedPresence(data) {
        console.log("received presence: " + data);
        this.emit('presence', { from: data.getAttributeValue("from"), type: data.getAttributeValue("type") });
    }.bind(this));
    
    this.reader.addListener('streamError', function streamError(data) {
        var childNode1 = data.getChild("text");
        if(!childNode1) {
            console.log("**** Stream Error data: " + data);
        } else {
            console.log("**** Stream Error: " + childNode1.data);
        }
        console.log("******************************** STREAM ERROR NOT AUTO RECONNECTING ******************************");
        this.noReconnect = true;
    }.bind(this));
    
    this.reader.addListener('message', function handleMessage(messageNode) {
        console.log("**** Holy shit! A MESSAGE!");
        var media = messageNode.getChild("media");
        var emitMessage = true;
        if(media) {
            console.log("*** Hmm. It has some media attached.  What should I do?!?!?");
            console.log(media)
        }
        var msgId = messageNode.getAttributeValue("id");
        var attributeT = messageNode.getAttributeValue("t");
        var fromAttribute = messageNode.getAttributeValue("from");
        var author = messageNode.getAttributeValue("author");
        var typeAttribute = messageNode.getAttributeValue("type");
        var visibleName = "";
        
        if(typeAttribute === "error") {
            console.log("*** My God, it's full of Errors.");
            console.log(messageNode);
        } else if(typeAttribute == "subject") {
            var receiptRequested = false;
            var requestNodes = messageNode.getAllChildren("request");
            for(var requestNode in requestNodes) {
                if(requestNodes[requestNode].getAttributeValue("xmlns") == "urn:xmpp:receipts") {
                    receiptRequested = true;
                    break;
                }
            }
            var bodyNode = messageNode.getChild("body");
            var newSubject = bodyNode ? bodyNode.data : undefined;
            console.log("*** Subject received: " + newSubject);
            if(receiptRequested) {
                this.sendSubjectReceived(fromAttribute, msgId);
            }
        } else if(typeAttribute == "chat") {
            var duplicate = false;
            var wantsReceipt = false;
            var messageChildren = messageNode.children || [];
            for(var childNode in messageChildren) {
                switch(messageChildren[childNode].tag) {
                    case "received":
                        console.log("*** " + fromAttribute + " received message " + msgId);
                        this.emit('msgReceived', { from: fromAttribute, id: msgId });
                        this.sendDeliveredReceiptAck(fromAttribute, msgId);
                        emitMessage = false;
                        break;
                    case "composing":
                        console.log("*** " + fromAttribute + " is typing");
                        this.emit('composing', fromAttribute);
                        emitMessage = false;
                        break;
                    case "paused":
                        console.log("*** " + fromAttribute + " stopped typing");
                        this.emit('paused', fromAttribute);
                        emitMessage = false;
                        break;
                    case "body":
                        if(msgId) {
                            var msgdata = messageChildren[childNode].data;
                            // TODO: apparently we should check to see if this is a duplicate message using some kind of key based on fromAttribute and msgId
                            // see waxmpp.py:556 for some of the sordid details
                            console.log("*** " + fromAttribute + " says: " + msgdata);
                        }
                        this.emit('message', messageNode);
                        emitMessage = false;
                        break;
                    case "request":
                        console.log("*** " + fromAttribute + " requests return receipt");
                        this.sendMessageReceived(fromAttribute, msgId);
                        emitMessage = false;
                        break;
                    case "notify":
                        console.log("*** " + fromAttribute + " sets notify_name=" + messageChildren[childNode].getAttributeValue("name"));
                        visibleName = messageChildren[childNode].getAttributeValue("name");
                        break;
                    case "server":
                        console.log("*** Server says it has accepted message " + msgId);
                        this.emit('serverAccept', { from: fromAttribute, id: msgId });
                        emitMessage = false;
                        break;
                    case "x": // why did someone called a stanza name "x"? what does that even -mean-?
                        var xmlns = messageChildren[childNode].getAttributeValue("xmlns");
                        if(xmlns === "jabber:x:event" && msgId) {
                            console.log("*** Message " + msgId + " sent to " + fromAttribute);
                        } else if(xmlns === "jabber:x:delay") {
                            // uh.. what do we do here?
                        }
                        emitMessage = false;
                        break;
                    case "delay":
                        break;
                    default:
                        if(!msgId || ! (messageChildren[childNode].tag == "received"))
                        {
                            break;
                        }
                        // TODO: I think we're supposed to handle sending return receipts here, as per waxmpp.py:600 or so
                        console.log("*** I don't know what to do. Message Data=" + messageChildren[childNode]);
                        break;
                }
            }
        }
        //console.log(messageNode);
        if(emitMessage) {
            console.log("emitting message back to service");
            this.emit('message', messageNode);
        }
    }.bind(this));
}

util.inherits(waApi, EventEmitter);

waApi.prototype.handlePing = function(idx) {
    var iqNode = new ProtocolTreeNode("iq", { "type": "result", "to": this.loginInfo.domain, "id": idx });
    console.log("received ping " + idx + ", sending Pong " + iqNode);
    this.writer.write(iqNode);
}

// TODO: use sendTyping
waApi.prototype.sendTyping = function(jid) {
    console.log("*** Typing");
    var composing = new ProtocolTreeNode("composing", { "xmlns": "http://jabber.org/protocol/chatstates" });
    var message = new ProtocolTreeNode("message", { "to": jid, "type": "chat" }, [ composing ]);
    this.writer.write(message);
}

// TODO: use sendPaused
waApi.prototype.sendPaused = function(jid) {
    console.log("*** Paused");
    var composing = new ProtocolTreeNode("paused", { "xmlns": "http://jabber.org/protocol/chatstates" });
    var message = new ProtocolTreeNode("message", { "to": jid, "type": "chat" }, [ composing ]);
    this.writer.write(message);
}

waApi.prototype.getSubjectMessage = function(to, msgId, child) {
    var messageNode = new ProtocolTreeNode("message", { "to": to, "type": "subject", "id": msgId }, [ child ]);
    return messageNode;
}

waApi.prototype.sendSubjectReceived = function(to, msgId) {
    var receivedNode = new ProtocolTreeNode("received", { "xmlns": "urn:xmpp:receipts" });
    var messageNode = this.getSubjectMessage(to, msgId, receivedNode);
    this.writer.write(messageNode);
}

// TODO: use sendMessageReceived
waApi.prototype.sendMessageReceived = function(to, msgid) {
    var receivedNode = new ProtocolTreeNode("received", { "xmlns": "urn:xmpp:receipts" });
    var messageNode = new ProtocolTreeNode("message", { "to": to, "type": "chat", "id": msgid }, [ receivedNode ]);
    this.writer.write(messageNode);
}

// TODO: use sendDeliveredReceiptAck
waApi.prototype.sendDeliveredReceiptAck = function(to, msgId) {
    this.writer.write(this.getReceiptAck(to, msgId, "delivered"));
}

// TODO: use sendVisibileReceiptAck
waApi.prototype.sendVisibleReceiptAck = function(to, msgId) {
    this.writer.write(this.getReceiptAck(to, msgId, "visible"));
}

waApi.prototype.getReceiptAck = function(to, msgId, receiptType) {
    var ackNode = new ProtocolTreeNode("ack", { "xmlns": "urn:xmpp:receipts", "type": receiptType });
    var messageNode = new ProtocolTreeNode("message", { "to": to, "type": "chat", "id": msgId }, [ ackNode ]);
    return messageNode;
}

waApi.prototype.makeId = function(prefix) {
    this.iqId++;
    var idx = "";
    //if(this.verbose) {
        idx += prefix + this.iqId; 
    //} else {
    //    idx = this.iqId.toString(16);
    //}
    return idx;
}

// TODO: use getLastOnline
waApi.prototype.getLastOnline = function(jid) {
    this.sendSubscribe(jid);
    var idx = this.makeId("last_");
    var query = new ProtocolTreeNode("query", { "xmlns":"jabber:iq:last" });
    var iqNode = new ProtocolTreeNode("iq", { "id": idx, "type": "get", "to": jid }, [query]);
    this.writer.write(iqNode);
}

// TODO: use sendIq?
waApi.prototype.sendIq = function() {
    var node = new ProtocolTreeNode("iq", { "to": "g.us", "type": "get", "id": Date.now() + "-0" }, undefined, 'expired');
    this.writer.write(node);
    node = new ProtocolTreeNode("iq", { "to": "s.whatsapp.net", "type": "set", "id": Date.now() + "-1" }, undefined, 'expired');
    this.writer.write(node);
}

waApi.prototype.sendAvailableForChat = function() {
    var showNode = new ProtocolTreeNode("show", undefined, undefined, "chat");
    var presenceNode = new ProtocolTreeNode("presence", { "name": this.loginInfo.displayName || "" });
    this.writer.write(presenceNode);
}

waApi.prototype.sendAvailable = function() {
    var presenceNode = new ProtocolTreeNode("presence", { "type": "available" });
    this.writer.write(presenceNode);
}

// TODO: This does not appear to work. Perhaps WA is not using the standard method?
waApi.prototype.sendCustomStatus = function(status) {
    var showNode = new ProtocolTreeNode("show", undefined, undefined, "chat");
    var statusNode = new ProtocolTreeNode("status", undefined, undefined, status);
    var presenceNode = new ProtocolTreeNode("presence", { "from": this.loginInfo.username+"@s.whatsapp.net", "xml:lang": "en" }, [ showNode, statusNode] );
    this.writer.write(presenceNode);
}

// TODO: use sendUnavailable
waApi.prototype.sendUnavailable = function(status) {
    var presenceNode = new ProtocolTreeNode("presence", { "type": "unavailable" });
    this.writer.write(presenceNode);
}

// TODO: use sendSubscribe
waApi.prototype.sendSubscribe = function(to) {
    var presenceNode = new ProtocolTreeNode("presence", { "type": "subscribe", "to": to });
    this.writer.write(presenceNode);
}

waApi.prototype.sendMessageWithBody = function(fmsg) {
    var bodyNode = new ProtocolTreeNode("body", undefined, undefined, fmsg.content);
    this.writer.write(this.getMessageNode(fmsg, bodyNode));
    this.msgId++;
}

// TODO: use sendClientConfig
waApi.prototype.sendClientConfig = function(sound, pushID, preview, platform) {
    var idx = this.makeId("config_");
    var configNode = new ProtocolTreeNode("config", { "xmlns": "urn:xmpp:whatsapp:push", "sound": sound, "id": pushID, "preview": preview ? "1" : "0", "platform": platform });
    var iqNode = new ProtocolTreeNode("iq", { "id": idx, "type": "set", "to": this.loginInfo.domain }, [ configNode ]);
    this.writer.write(iqNode);
}

waApi.prototype.getMessageNode = function(fmsg, child) {
    var requestNode = undefined;
    var serverNode = new ProtocolTreeNode("server");
    var xNode = new ProtocolTreeNode("x", { "xmlns":"jabber:x:event" }, [ serverNode ]);
    var childCount = (requestNode ? 1 : 0) + 2;
    var messageChildren = [];
    var i = 0;
    if(requestNode) {
        messageChildren[i] = requestNode;
        i++;
    }
    messageChildren[i] = xNode;
    i++;
    messageChildren[i] = child;
    i++;
    //var key = fmsg.key; // eval(fmsg.key) ???
    var key = { id: Math.round(Date.now() / 1000) + "-1" };
    //var key = { id: "123456789-3" };
    var messageNode = new ProtocolTreeNode("message", { "to": fmsg.to, "type": "chat", "id": key.id }, messageChildren);
    return messageNode;
}

//var wa = new waApi("17079925233", "134529771563");
//var wa = new waApi("19519993267", "134529771563");
exports.waApi = waApi;

/*
 var ProtocolTreeNode = require('./waNodes.js').ProtocolTreeNode;

var treenodetest = new ProtocolTreeNode("html", undefined,
    [
        new ProtocolTreeNode("head", undefined,
            [
                new ProtocolTreeNode("title", undefined, undefined, "Test Title"),
                new ProtocolTreeNode("script", { src: "/home/script.js" },
                    [
                        new ProtocolTreeNode("noscript", undefined, undefined, "No Script Text")
                    ]
                ),
            ]
        ),
        new ProtocolTreeNode("body", undefined, undefined, "Test Body"),
    ],
    undefined, undefined);
        
console.log("treenodetest created:\n" + treenodetest);
*/

function pack(format) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tim de Koning (http://www.kingsquare.nl)
    // +      parts by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   bugfixed by: Tim de Koning (http://www.kingsquare.nl)
    // %        note 1: Float encoding by: Jonas Raoni Soares Silva
    // %        note 2: Home: http://www.kingsquare.nl/blog/12-12-2009/13507444
    // %        note 3: Feedback: phpjs-pack@kingsquare.nl
    // %        note 4: 'machine dependent byte order and size' aren't
    // %        note 4: applicable for JavaScript; pack works as on a 32bit,
    // %        note 4: little endian machine
    // *     example 1: pack('nvc*', 0x1234, 0x5678, 65, 66);
    // *     returns 1: '4xVAB'
    var formatPointer = 0,
        argumentPointer = 1,
        result = '',
        argument = '',
        i = 0,
        r = [],
        instruction, quantifier, word, precisionBits, exponentBits, extraNullCount;

    // vars used by float encoding
    var bias, minExp, maxExp, minUnnormExp, status, exp, len, bin, signal, n, intPart, floatPart, lastBit, rounded, j, k, tmpResult;

    while (formatPointer < format.length) {
        instruction = format[formatPointer];
        quantifier = '';
        formatPointer++;
        while ((formatPointer < format.length) && (format[formatPointer].match(/[\d\*]/) !== null)) {
            quantifier += format[formatPointer];
            formatPointer++;
        }
        if (quantifier === '') {
            quantifier = '1';
        }

        // Now pack variables: 'quantifier' times 'instruction'
        switch (instruction) {
        case 'a':
            // NUL-padded string
        case 'A':
            // SPACE-padded string
            if (typeof arguments[argumentPointer] === 'undefined') {
                throw new Error('Warning:  pack() Type ' + instruction + ': not enough arguments');
            } else {
                argument = String(arguments[argumentPointer]);
            }
            if (quantifier === '*') {
                quantifier = argument.length;
            }
            for (i = 0; i < quantifier; i++) {
                if (typeof argument[i] === 'undefined') {
                    if (instruction === 'a') {
                        result += String.fromCharCode(0);
                    } else {
                        result += ' ';
                    }
                } else {
                    result += argument[i];
                }
            }
            argumentPointer++;
            break;
        case 'h':
            // Hex string, low nibble first
        case 'H':
            // Hex string, high nibble first
            if (typeof arguments[argumentPointer] === 'undefined') {
                throw new Error('Warning: pack() Type ' + instruction + ': not enough arguments');
            } else {
                argument = arguments[argumentPointer];
            }
            if (quantifier === '*') {
                quantifier = argument.length;
            }
            if (quantifier > argument.length) {
                throw new Error('Warning: pack() Type ' + instruction + ': not enough characters in string');
            }
            for (i = 0; i < quantifier; i += 2) {
                // Always get per 2 bytes...
                word = argument[i];
                if (((i + 1) >= quantifier) || typeof(argument[i + 1]) === 'undefined') {
                    word += '0';
                } else {
                    word += argument[i + 1];
                }
                // The fastest way to reverse?
                if (instruction === 'h') {
                    word = word[1] + word[0];
                }
                result += String.fromCharCode(parseInt(word, 16));
            }
            argumentPointer++;
            break;

        case 'c':
            // signed char
        case 'C':
            // unsigned char
            // c and C is the same in pack
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer]);
                argumentPointer++;
            }
            break;

        case 's':
            // signed short (always 16 bit, machine byte order)
        case 'S':
            // unsigned short (always 16 bit, machine byte order)
        case 'v':
            // s and S is the same in pack
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                argumentPointer++;
            }
            break;

        case 'n':
            // unsigned short (always 16 bit, big endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                argumentPointer++;
            }
            break;

        case 'i':
            // signed integer (machine dependent size and byte order)
        case 'I':
            // unsigned integer (machine dependent size and byte order)
        case 'l':
            // signed long (always 32 bit, machine byte order)
        case 'L':
            // unsigned long (always 32 bit, machine byte order)
        case 'V':
            // unsigned long (always 32 bit, little endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF);
                argumentPointer++;
            }

            break;
        case 'N':
            // unsigned long (always 32 bit, big endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                argumentPointer++;
            }
            break;

        case 'f':
            // float (machine dependent size and representation)
        case 'd':
            // double (machine dependent size and representation)
            // version based on IEEE754
            precisionBits = 23;
            exponentBits = 8;
            if (instruction === 'd') {
                precisionBits = 52;
                exponentBits = 11;
            }

            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }
            for (i = 0; i < quantifier; i++) {
                argument = arguments[argumentPointer];
                bias = Math.pow(2, exponentBits - 1) - 1;
                minExp = -bias + 1;
                maxExp = bias;
                minUnnormExp = minExp - precisionBits;
                status = isNaN(n = parseFloat(argument)) || n === -Infinity || n === +Infinity ? n : 0;
                exp = 0;
                len = 2 * bias + 1 + precisionBits + 3;
                bin = new Array(len);
                signal = (n = status !== 0 ? 0 : n) < 0;
                n = Math.abs(n);
                intPart = Math.floor(n);
                floatPart = n - intPart;

                for (k = len; k;) {
                    bin[--k] = 0;
                }
                for (k = bias + 2; intPart && k;) {
                    bin[--k] = intPart % 2;
                    intPart = Math.floor(intPart / 2);
                }
                for (k = bias + 1; floatPart > 0 && k; --floatPart) {
                    (bin[++k] = ((floatPart *= 2) >= 1) - 0);
                }
                for (k = -1; ++k < len && !bin[k];) {}

                if (bin[(lastBit = precisionBits - 1 + (k = (exp = bias + 1 - k) >= minExp && exp <= maxExp ? k + 1 : bias + 1 - (exp = minExp - 1))) + 1]) {
                    if (!(rounded = bin[lastBit])) {
                        for (j = lastBit + 2; !rounded && j < len; rounded = bin[j++]) {}
                    }
                    for (j = lastBit + 1; rounded && --j >= 0;
                    (bin[j] = !bin[j] - 0) && (rounded = 0)) {}
                }

                for (k = k - 2 < 0 ? -1 : k - 3; ++k < len && !bin[k];) {}

                if ((exp = bias + 1 - k) >= minExp && exp <= maxExp) {
                    ++k;
                } else {
                    if (exp < minExp) {
                        if (exp !== bias + 1 - len && exp < minUnnormExp) { /*"encodeFloat::float underflow" */
                        }
                        k = bias + 1 - (exp = minExp - 1);
                    }
                }

                if (intPart || status !== 0) {
                    exp = maxExp + 1;
                    k = bias + 2;
                    if (status === -Infinity) {
                        signal = 1;
                    } else if (isNaN(status)) {
                        bin[k] = 1;
                    }
                }

                n = Math.abs(exp + bias);
                tmpResult = '';

                for (j = exponentBits + 1; --j;) {
                    tmpResult = (n % 2) + tmpResult;
                    n = n >>= 1;
                }

                n = 0;
                j = 0;
                k = (tmpResult = (signal ? '1' : '0') + tmpResult + bin.slice(k, k + precisionBits).join('')).length;
                r = [];

                for (; k;) {
                    n += (1 << j) * tmpResult.charAt(--k);
                    if (j === 7) {
                        r[r.length] = String.fromCharCode(n);
                        n = 0;
                    }
                    j = (j + 1) % 8;
                }

                r[r.length] = n ? String.fromCharCode(n) : '';
                result += r.join('');
                argumentPointer++;
            }
            break;

        case 'x':
            // NUL byte
            if (quantifier === '*') {
                throw new Error('Warning: pack(): Type x: \'*\' ignored');
            }
            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(0);
            }
            break;

        case 'X':
            // Back up one byte
            if (quantifier === '*') {
                throw new Error('Warning: pack(): Type X: \'*\' ignored');
            }
            for (i = 0; i < quantifier; i++) {
                if (result.length === 0) {
                    throw new Error('Warning: pack(): Type X:' + ' outside of string');
                } else {
                    result = result.substring(0, result.length - 1);
                }
            }
            break;

        case '@':
            // NUL-fill to absolute position
            if (quantifier === '*') {
                throw new Error('Warning: pack(): Type X: \'*\' ignored');
            }
            if (quantifier > result.length) {
                extraNullCount = quantifier - result.length;
                for (i = 0; i < extraNullCount; i++) {
                    result += String.fromCharCode(0);
                }
            }
            if (quantifier < result.length) {
                result = result.substring(0, quantifier);
            }
            break;

        default:
            throw new Error('Warning:  pack() Type ' + instruction + ': unknown format code');
        }
    }
    if (argumentPointer < arguments.length) {
        throw new Error('Warning: pack(): ' + (arguments.length - argumentPointer) + ' arguments unused');
    }

    return result;
}
