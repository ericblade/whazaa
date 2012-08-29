const dictionary =
	[
        undefined, undefined, undefined, undefined, undefined,
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
        "account","digest","g_notify","method","password","registration","stat","text","user","username","event","latitude","longitude"
    ];

var net = require('net');
var base64 = require('./base64');
var crypto = require('crypto');
var fs = require('fs');
var pack = require('./pack');

function md5(x) {
    return crypto.createHash('md5').update(x).digest("hex");
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

var waapi = {
    
};
util.inherits(waapi, EventEmitter);

var ProtocolTreeNode = function(tag, attributes, children, data) {
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
    this.data = data;
}

ProtocolTreeNode.prototype.toString = function() {
    var out = "<" + this.tag;
    if(this.attributes) {
        for(var x in this.attributes) {
            out += " " + x + '="' + this.attributes[x] + '"';
        }
        out += ">\n";
        if(this.data) {
            out += this.data;
        }
        if(this.children) {
            for(var c in this.children) {
                out += c.toString();
            }
        }
        out += "</" + this.tag + ">\n";
        return out;
    }
}

ProtocolTreeNode.prototype.tagEquals = function(node, string) {
    return node && node.tag && node.tag === string;
}

ProtocolTreeNode.prototype.require = function(node, string) {
    if(!this.tagEquals(node, string)) {
        throw("failed require. node: " + node + " string: " + string);
    }
}

ProtocolTreeNode.prototype.getChild = function(identifier) {
    if(!this.children || this.children.length == 0) {
        return undefined;
    }
    if(typeof identifier === "number") {
        if(this.children.length > identifier) {
            return this.children[identifier];
        } else {
            return undefined;
        }
    }
    for(var c in this.children) {
        if(identifier === this.children[c].tag) {
            return this.children[c];
        }
    }
}

ProtocolTreeNode.prototype.getAttributeValue = function(string) {
    if(!this.attributes) {
        return undefined;
    }
    return this.attributes[string];
}

ProtocolTreeNode.prototype.getAllChildren = function(tag) {
    var ret = [];
    if(!this.children) {
        return ret;
    }
    if(!tag) {
        return this.children;
    }
    for(var c in this.children) {
        if(tag === this.children[c].tag) {
            ret.push(this.children[c]);
        }
    }
    return ret;
}

var treenodetest = new ProtocolTreeNode("tagtest", "testing=true", undefined, "this is a test.");
console.log("treenodetest created: " + treenodetest);