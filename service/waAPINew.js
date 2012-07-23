var ProtocolTreeNode = Class.create({
    initialize: function(tag, attributes, children, data) {
        this.tag = tag;
        this.attributes = attributes;
        this.children = children;
        this.data = data;
    },
    toString: function() {
        var out = "<" + this.tag;
        if(this.attributes) {
            for(var x in this.attributes) {
                out += " " + x + "=" + this.attributes[x];
            }
        }
        out += ">\n";
        if(this.data) {
            out += this.data;
        }
        
        if(this.children) {
            for(var c in this.children) {
                out += this.children[c].toString();
            }
        }
        out += "</" + this.tag + ">\n";
    },
    tagEquals: function(node, str) {
        return node && node.tag && node.tag == str;
    },
    require: function(node, str) {
        if(!this.tagEquals(node, str)) {
            throw("Failed require. Node: " + node + " string: " + str);
        }
    },
    getChild: function(identifier) {
        if(!this.children || this.children.length == 0) {
            return undefined;
        }
        if(typeof identifier == "number") {
            if(this.children.length > identifier) {
                return this.children[identifier]
            } else {
                return undefined;
            }
        }
        for(var c in this.children) {
            if(identifier == this.children[c].tag) {
                return c;
            }
        }
        return undefined;
    },
    getAttributeValue: function(str) {
        if(!this.attributes) {
            return undefined;
        }
        return this.attributes[str];
    },
    getAllChildren: function(tag) {
        if(!this.children) {
            return [];
        }
        if(!tag) {
            return this.children;
        }
        var ret = [];
        for(var c in this.children) {
            if(tag == this.children[c].tag) {
                ret.push(c);
            }
        }
        return ret;
    } 
});

var BinTreeNodeReader = Class.create({
    initialize: function(inputstream, dictionary) {
        this.tokenMap = dictionary;
        this.rawIn = inputstream;
        this.inn = Buffer(1024);
        this.buf = Buffer(1024);
        this.bufSize = 0;
        this.readSize = 1;
        this.pointer = 0;
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
        var stanzaSize = this.readInt16();
        this.fillBuffer(stanzaSize);
        var tag = this.inn.read();
        var size = this.readListSize(tag);
        tag = this.inn.read();
        if(tag != 1) {
            throw("streamStart expected tag to be 1 (STREAM_START)");
        }
        var attribCount = (size - 2 + size % 2) / 2;
        var attributes = this.readAttributes(attribCount);
    },
    readListSize: function(token) {
        size = 0;
        if(token === 0) {
            size = 0;
        } else {
            if(token == 248) {
                size = this.readInt8(this.inn);
            } else {
                if(token == 249) {
                    size = this.readInt16(this.inn);
                } else {
                    throw("invalid list size in readListSize: token " + token);
                }
            }
        }
    },
    readAttributes: function(attribCount) {
        var attribs = { };
        for(var i = 0; i < attribCount; i++) {
            var key = this.readString(this.inn.read());
            var value = this.readString(this.inn.read());
            attribs[key] = value;
        }
        return attribs;
    },
    getToken: function(token) {
        if(token >= 0 && token < this.tokenMap.length) {
            ret = this.tokenMap[token];
        } else {
            throw("invalid token/length in getToken " + token);
        }
        return ret;
    },
    readString: function(token) {
        if(token == -1) {
            throw("-1 token in readString");
        }
        if(token > 4 && token < 245) {
            return this.getToken(token);
        }
        if(token == 0) {
            return undefined;
        }
        if(token == 252) {
            var size8 = this.readInt8(this.inn);
            var buf8 = Buffer(size8);
            this.fillArray(buf8, buf8.length, this.inn);
            return buf8.toString();
        }
        if(token == 253) {
            var size24 = this.readInt24(this.inn);
            var buf24 = Buffer(size24);
            this.fillArray(buf24, buf24.length, this.inn);
            return buf24.toString();
        }
        if(token == 254) {
            token = this.inn.read();
            return this.getToken(245 + token);
        }
        if(token == 250) {
            var user = this.readString(this.inn.read());
            var server = this.readString(this.inn.read());
            if(user && server) {
                return user + "@" + server;
            }
            if(server) {
                return server;
            }
            throw("readString couldn't reconstruct jid");
        }
        throw("readString couldn't match token");
    },
    nextTree: function() {
        var stanzaSize = this.readInt16(this.rawIn, 1);
        this.inn.buf = [];
        this.fillBuffer(stanzaSize);
        var ret = this.nextTreeInternal();
        return ret;
    },
    fillBuffer: function(stanzaSize) {
        if(this.buf.length < stanzaSize) {
            var newsize = Math.max(this.buf.length * 3 / 2, stanzaSize); // huh?!
            this.buf = Buffer(newsize);
        }
        this.bufSize = stanzaSize;
        this.fillArray(this.buf, stanzaSize, this.rawIn);
        this.inn = Buffer(this.buf);
    },
    fillArray: function(buf, length, inputstream) {
        var count = 0;
        while(count < length) {
            count += inputstream.read2(buf, count, length-count);
        }
    },
    nextTreeInternal: function() {
        var b = this.inn.read();
        var size = this.readListSize(b);
        b = this.inn.read();
        if(b == 2) {
            return undefined;
        }
        var tag = this.readString(b);
        if(size == 0 || !tag) {
            throw("nextTree sees 0 list or null tag");
        }
        var attribCount = (size - 2 + size % 2) / 2;
        var attribs = this.readAttributes(attribCount);
        if(size % 2 == 1) {
            return new ProtocolTreeNode(tag, attribs);
        }
        b = this.inn.read();
        if(this.isListTag(b)) {
            return new ProtocolTreeNode(tag, attribs, this.readList(b));
        }
        return new ProtocolTreeNode(tag, attribs, undefined, this.readString(b));
    },
    readList: function(token) {
        var size = this.readListSize(token);
        var listx = [];
        for(var i = 0; i < size; i++) {
            listx.push(this.nextTreeInternal());
        }
        return listx;
    },
    isListTag: function(b) {
        return (b == 248 || b == 0 || b == 249)
    }
});

var BinTreeNodeWriter = Class.create({
    STREAM_START:1,
    STREAM_END:2,
    LIST_EMPTY:0,
    LIST_8:248,
    LIST_16:249,
    JID_PAIR:250,
    BINARY_8:252,
    BINARY_24:253,
    TOKEN_8:254,
    tokenMap:{},
    
    initialize: function(o, dictionary) {
        this.realOut = o;
        this.tokenMap = {};
        this.out = Buffer();
        for(var i = 0; i < dictionary.length; i++) {
            if(dictionary[i]) {
                this.tokenMap[dictionary[i]] = i;
            }
        }
    },
    streamStart: function(domain, resource) {
        this.realOut.write(87);
        this.realOut.write(65);
        this.realOut.write(1);
        this.realOut.write(0);
        var streamOpenAttributes = { to: domain, resource: resource };
        this.writeListStart(streamOpenAttributes.length * 2 + 1); // HUH?
        this.out.write(1);
        this.writeAttributes(streamOpenAttributes);
        this.flushBuffer(false);
    },
    write: function(node, needsFlush) {
        if(!node) {
            this.out.write(0);
        } else {
            this.writeInternal(node);
        }
        this.flushBuffer(!!needsFlush);
        this.out.buf = [];
    },
    flushBuffer: function(flushNetwork) {
        var size = this.out.getBuffer().length;
        if(size & 0xFFFF0000 != 0) {
            throw("Buffer Too Large! " + size);
        }
        this.writeInt16(size, this.realOut);
        this.realOut.write(this.out.getBuffer());
        this.out.reset();
        if(flushNetwork) {
            this.realOut.flush();
        }
    },
    writeInternal: function(node) {
        var x = 1 + (!node.attributes ? 0 : node.attributes.length * 2) + (!node.children ? 0 : 1) + (!node.data ? 0 : 1);
        this.writeListStart(1 + (!node.attributes ? 0 : node.attributes.length * 2) + (!node.children ? 0 : 1) + (!node.data ? 0 : 1)); // isn't this same as above line?
        this.writeString(node.tag);
        this.writeAttributes(node.attributes);
        if(node.data) {
            this.writeBytes(node.data);
        }
        if(this.children) {
            this.writeListStart(node.children.length);
            for(var c in node.children) {
                this.writeInternal(node.children[c]);
            }
        }
    },
    writeAttributes: function(attributes) {
        if(attributes) {
            for(var x in attributes) {
                this.writeString(x);
                this.writeString(attributes[x]);
            }
        }
    },
    writeBytes: function(bytes) {
        var length = bytes.length;
        if(length > 255) {
            this.out.write(253);
            this.writeInt24(length);
        } else {
            this.out.write(252);
            this.writeInt8(length);
        }
        for(var b in bytes) {
            this.out.write(b);
        }
    },
    writeInt8: function(v) {
        this.out.write(v & 0xFF);
    },
    writeInt16: function(v, o) {
        if(!o) o = this.out;
        o.write( (v & 0xFF00) >> 8);
        o.write( (v & 0xFF) >> 0);
    },
    writeInt24: function(v) {
        this.out.write( (v & 0xFF0000) >> 16);
        this.out.write( (v & 0xFF00) >> 8);
        this.out.write( (v & 0xFF) >> 0);
    },
    writeListStart: function(i) {
        if(i == 0) {
            this.out.write(0);
        } else if(i < 256) {
            this.out.write(248);
            this.writeInt8(i);
        } else {
            this.out.write(249);
            this.writeInt16(i);
        }
    },
    writeToken: function(intValue) {
        if(intValue < 245) {
            this.out.write(intValue);
        } else if(intValue <= 500) {
            this.out.write(254);
            this.out.write(intValue - 245);
        }
    },
    writeString: function(tag) {
        var key = this.tokenMap[tag];
        if(key) {
            this.writeToken(key);
        } else {
            var atIndex = tag.indexOf('@');
            if(atIndex < 1) {
                throw("atIndex < 1");
            } else {
                var server = tag.substr(atIndex+1);
                var user = tag.substr(0, atIndex);
                this.writeJid(user, server);
            }
        }
    },
    writeJid: function(user, server) {
        this.out.write(250);
        if(user) {
            this.writeString(user);
        } else {
            this.writeToken(0);
        }
        this.writeString(server);
    },
    getChild: function(str) {
        if(!this.children) {
            return undefined;
        }
        for(var c in this.children) {
            if(str == this.children[c].tag) {
                return this.children[c];
            }
        }
        return undefined;
    },
    getAttributeValue: function(str) {
        if(!this.attributes) {
            return undefined;
        }
        return this.attributes[str];
    }
});

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
