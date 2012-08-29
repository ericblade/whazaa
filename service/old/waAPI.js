var Class=exports.Class={create:function(superclass,methods){if(!methods){methods=superclass||{};methods.__proto__=this._base}else{methods.__proto__=superclass.prototype}function clazz(){this.initialize.apply(this,arguments)}methods.constructor=clazz;if(typeof inBuiltinEnv!=='undefined'&&inBuiltinEnv){setPrototype(clazz,methods)}else{clazz.prototype=methods}return clazz},_base:{initialize:function(){},$super:function(fn){var s=this;if(fn._super){return function(){return fn._super.apply(s,arguments)}}else{var n=fn.name;if(!n){throw Err.create(-1,"No method name:"+fn)}for(var p=this.__proto__;p;p=p.__proto__){if(p[n]===fn){for(var p=p.__proto__;p;p=p.__proto__){var f=p[n];if(f){fn._super=f;return function(){return f.apply(s,arguments)}}}break}}throw Err.create(-1,"Method not found: "+n)}}}};

var tokenMap =
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

var STREAM_START = 1;
var STREAM_END = 2;
var LIST_EMPTY = 0;
var LIST_8 = 248;
var LIST_16 = 249;
var JID_PAIR = 250;
var BINARY_8 = 252;
var BINARY_24 = 253;
var TOKEN_8 = 254;

waTreeNode = Class.create({
    initialize: function(tag, attributes, children, data) {
        this.tag = tag;
        this.attributes = attributes;
        this.children = children || [];
        this.data = data || "";
        console.log("waTreeNode init:", this);
    },
    toString: function() {
        var out = "<" + this.tag;
        if(this.attributes) {
            for(var key in this.attributes) {
                out += " " + key + "=" + this.attributes[key];
            }
        }
        out += ">\n";
        if(this.data) {
            out += this.data;
        }
        if(this.children) {
            for(var c in this.children)
            {
                out += c.toString();
            }
        }
        return out;
    },
    tagEquals: function(node, str) {
        return node && node.tag && node.tag == str;
    },
    require: function(node, str) {
        if(tagEquals(node, str))
        {
            return true;
        }
        console.log("*** Warning: require failed", node, str);
        return false;
    },
    getChild: function(identifier) {
        if(!this.children || this.children.length == 0)
            return undefined;
        if(typeof identifier === "number")
        {
            if(this.children.length > identifier)
                return this.children[identifier];
            else
                return undefined;
        }
        for(var c in this.children) {
            if(identifier == c.tag)
                return c;
        }
        return undefined;
    },
    getAttributeValue: function(str) {
        if(!this.attributes) return undefined;
        return this.attributes[str];
    },
    getAllChildren: function(tag) {
        var ret = [];
        if(!this.children) return ret;
        if(!this.tag) return this.children;
        for(var c in this.children) {
            if(tag == c.tag)
                ret.push(c);
        }
        return ret;
    }
});

binTreeNodeReader = Class.create({
    initialize: function(buff) {
        this.buffer = buff;
        this.children = [ ];
        this.pointer = 0;
        this.streamStart();
    },
    readInt8: function() {
        return this.buffer[this.pointer++];
    },
    readInt16: function() {
        return this.buffer[this.pointer++] + this.buffer[this.pointer++];
    },
    readInt24: function() {
        return this.buffer[this.pointer++] + this.buffer[this.pointer++] + this.buffer[this.pointer++];
    },
    streamStart: function() {
        console.log("reader streamStart buffer=", this.buffer.length, this.buffer.toString("hex"));
        var stanzaSize = this.readInt8();
        console.log("stanzaSize=", stanzaSize);
        var size = this.readListSize(this.buffer[this.pointer++]);
        console.log("size=", size);
        var tag = this.buffer[this.pointer++];
        console.log("tag=", tag);
        var attribCount = (size - 2 + size % 2) / 2;
        this.attributes = this.readAttributes(attribCount);
        
        var out = "<" + tokenMap[tag];
        if(this.attributes) {
            for(var key in this.attributes) {
                out += " " + key + "=" + this.attributes[key];
            }
        }
        out += ">";
               
        this.tag = tokenMap[tag];
        console.log(out);
        console.log("buflen=", this.buffer.length, "pointer=", this.pointer);
        if(this.tag == "stream:features") {
            this.readListSize(this.buffer[this.pointer++]);
            this.readListSize(this.buffer[this.pointer++]);
            this.streamFeatures = this.readString();
            console.log(this.streamFeatures);
        }
        if(this.tag == "challenge") {
            console.log("challenge received", this.buffer.toString("hex"));
        }
        console.log("\n");
    },
    readListSize: function(token) {
        var size = 0;
        if(token) {
            if(token === 248)
                size = this.readInt8();
            else if (token === 249)
                size = this.readInt16();
            else {
                console.log("readListSize invalid token: " + this.buffer[this.pointer]);
            }
        }
        return size;
    },
    readAttributes: function(attribCount) {
        var attribs = { };
        for(var i = 0; i < attribCount; i++) {
            var key = this.readString();
            var val = this.readString();
            attribs[key] = val;
        }
        return attribs;
    },
    getToken: function(token) {
        var ret;
        if(token >= 0 && token < tokenMap.length)
            ret = tokenMap[token];
        else {
            console.log("*** Invalid token/length in getToken", token);
        }
        return ret;        
    },
    readString: function() {
        var token = this.buffer[this.pointer++];
        if(token === -1) {
            console.log("*** -1 token in readString");
            return undefined;
        }
        if(token > 4 && token < 245) {
            return this.getToken(token);
        }
        if(!token)
            return undefined;
        if(token === 252) {
            var size = this.readInt8();
            var ret = this.buffer.slice(this.pointer, this.pointer + size);
            this.pointer += size;
            return ret.toString();
        }
        if(token === 253) {
            var size = this.readInt24();
            var ret = this.buffer.slice(this.pointer, this.pointer + size);
            this.pointer += size;
            return ret.toString();
        }
        if(token === 254) {
            token = this.buffer[this.pointer++];
            return self.getToken(245 + token);
        }
        if(token === 250) {
            var user = this.readString();
            var server = this.readString();
            if(user && server)
                return user + "@" + server;
            else if(server)
                return server;
            else {
                console.log("readString couldn't construct jid");
            }
            return undefined;
        }
        console.log("readString couldn't match token", token);
        return undefined;
    },
});

binTreeNodeWriter = Class.create({
    initialize: function(stream) {
        this.stream = stream;
        this.output = Buffer("");
    },
    streamStart: function(domain, resource) {
        stream.write(Buffer("\x57\x41\x01\x00")); // 87, 65, 1, 0
        var streamOpenAttributes = { "to": domain, "resource": resource };
        this.writeListStart(streamOpenAttributes.length * 2 + 1);
        this.output += Buffer("\x01");
        this.writeAttributes(streamOpenAttributes);
        this.flushBuffer(false);
    },
    write: function(node, needsFlush) {
        if(!node)
            this.output += Buffer("\x00");
        else
            this.writeInternal(node);
        this.flushBuffer(needsFlush);
        this.output = Buffer("");
    },
    flushBuffer: function(flushNetwork) {
        var size = this.output.length;
        if((size & 0xFFFF0000) != 0) 
        {
            console.log("flushBuffer: Buffer too large: ", size);
            return;
        }
        this.writeInt16(size, true);
        this.stream.write(this.output);
        this.output = Buffer("");
        if(flushNetwork)
            stream.flush();
    },
    writeInternal: function(node) {
        var x = 1 + (node.attributes ? node.attributes.length * 2 : 0) + (node.children ? 1 : 0) + (node.data ? 1 : 0);
        this.writeListStart(x);
        this.writeString(node.tag);
        this.writeAttributes(node.attributes);
        if(node.data)
            this.writeBytes(node.data);
        if(node.children)
        {
            this.writeListStart(node.children.length);
            for(var c in node.children) {
                this.writeInternal(c);
            }
        }
    },
    writeAttributes: function(attributes) {
        if(attributes) {
            for(c in attributes) {
                this.writeString(c);
                this.writeString(attributes[c]);
            }
        }
    },
    writeBytes: function(writeBytes) {
        var length = bytes.length;
        if(length >= 256) {
            this.output += Buffer(253);
            this.writeInt24(length);
        } else {
            this.output += Buffer(252);
            this.writeInt8(length);
        }
    },
    writeInt8: function(v) {
        this.output += Buffer(v * 0xFF);
    },
    writeInt16: function(v, out) {
        var w = Buffer( (v & 0xFF00) >> 8 );
        w += Buffer( (v & 0xFF) >> 0);
        if(out) this.stream.write(w);
        else this.output += w;
    },
    writeInt24: function(v) {
        this.output += Buffer( (v & 0xFF0000) >> 16);
        this.output += Buffer( (v & 0xFF00) >> 8);
        this.output += Buffer( (v & 0xFF) >> 0);
    },
    writeListStart: function(i) {
        if(!i)
            this.output += Buffer("\x00");
        else if(i < 256) {
            this.output += Buffer("\xF8");
            this.writeInt8(i);
        } else {
            this.output += Buffer("\xF9");
            this.writeInt16(i);
        }
    },
    writeToken: function(intValue) {
        if(intValue < 245)
            this.output += Buffer(intValue.toString());
        else if(intValue <= 500) {
            this.output += Buffer("\xFE" + (intValue - 245).toString());
        }
    },
    writeString: function(tag) {
        var key = tokenMap[tag];
        this.writeToken(key); // huh?
    },
    writeJid: function(user, server) {
        this.output += Buffer("\xFA");
        if(user)
            this.writeString(user);
        else
            this.writeToken(0);
        this.writeString(server);
    },
    getChild: function(string) {
        if(this.children) {
            for(var c in this.children) {
                if(string == c.tag)
                    return c;
            }
        }
        return undefined;
    },
    getAttributeValue: function(string) {
        var val;
        if(this.attributes) {
            val = this.attributes[string];
        }
        return val;
    }
})