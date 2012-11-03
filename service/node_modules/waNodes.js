var fs = require('fs');

var log = {
    log: function(str) {
        var d = new Date();
        var dt = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
        fs.open('/tmp/main.log', 'a', function(err, file) {
            fs.write(file, dt + ":" + str);
        });
    },
    stream: function(str) {
        var d = new Date();
        var dt = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
        fs.open('/tmp/stream.log', 'a', function(err, file) {
            if(!err) {
                fs.write(file, dt + ":" + str);
            } else {
                console.log(err);
            }
        });
    }
};

var EventEmitter = require('events').EventEmitter;

if(process.version == "v0.2.3") {
    util = {};
    util.inherits = require('sys').inherits;
} else {
    util = require('util');
}

/* ProtocolTreeNode -- just a basic representation of a XML node */

var ProtocolTreeNode = function(tag, attributes, children, data) {
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
    this.data = data;
}

ProtocolTreeNode.prototype.toString = function(indent) {
    var out = indent ? "    " : "";
    out += "<" + this.tag;
    if(this.attributes) {
        for(var x in this.attributes) {
            out += " " + x + '="' + this.attributes[x] + '"';
        }
    }
    out += ">\n";
    if(this.data) {
        out += (indent ? "        " : "    ") + this.data + "\n";
    }
    if(this.children) {
        for(var c in this.children) {
            out += this.children[c].toString({ indent: true });
        }
    }
    out += (indent ? "    " : "") + "</" + this.tag + ">\n";
    return out;
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
    return undefined;
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

/* BinTreeNodeReader -- give it an input stream, and it should be able to read data into something we can process */

var BinTreeNodeReader = function(inputstream, dictionary, opt) {
    this.debug = opt ? opt.debug : false;
    this.tokenMap = dictionary;
    this.rawIn = inputstream;
    this.inn = new Buffer(0);
    this.buf = new Buffer(1024);
    this.bufSize = 0;
    this.readSize = 1;
    this.innPointer = 0;
}

util.inherits(BinTreeNodeReader, EventEmitter);

BinTreeNodeReader.prototype.streamStart = function() {
    this.rawIn.addListener('data', function dataReceived(data) {
        this.inn = data;
        if(!this.streamStarted) {
            var stanzaSize = this.readInt16();
            var tag = this.readInt8();
            var size = this.readListSize(tag);
            tag = this.inn[this.innPointer++];
            if(tag != 1) {
                throw("Expecting tag 1 (STREAM_START) received " + tag + ": " + this.getToken(tag));
            }
            var attribCount = (size - 2 + size % 2) / 2;
            var attributes = this.readAttributes(attribCount);
            this.streamStarted = true;
        }
        for(var x = this.innPointer; x < this.inn.length; x++) {
            var next = this.nextTree();
            x = this.innPointer;
        }
        this.innPointer = 0;
        this.inn = new Buffer("");
    }.bind(this));
}

BinTreeNodeReader.prototype.nextTree = function() {
    var stanzaSize = this.readInt16();
    return this.nextTreeInternal();
}

BinTreeNodeReader.prototype.nextTreeInternal = function() {
    var node;
    var b = this.readInt8();
    var size = this.readInt8();
    
    b = this.readInt8();
    if(b == 2) {
        console.log("** Stream closed, received tag 2");
        log.log("** Stream closed, received tag 2");
        log.stream("** Stream closed, received tag 2");
        return undefined;
    }
    var tag = this.readString(b);
    if(size == 0 || !tag) {
        throw("nextTree sees 0 list or null tag");
    }
    var attribCount = (size - 2 + size % 2) / 2;
    attribs = this.readAttributes(attribCount);
    if(size % 2 == 1) {
        node = new ProtocolTreeNode(tag, attribs);
    }
    if(!node) {
        b = this.readInt8();
        if(this.isListTag(b)) {
            node = new ProtocolTreeNode(tag, attribs, this.readList(b));
        }
        if(!node) {
            node = new ProtocolTreeNode(tag, attribs, undefined, this.readString(b));
        }
    }
    
    switch(node.tag) {
        case "challenge":
            this.emit('challenge', node);
            break;
        case "success":
            this.emit('loggedin', node);
            break;
        case "received": // received is a sub of message, do not pass it on
        case "notify": // received is a sub of message, do nto pass it on
        case "request": // request is a sub of message, do not pass it on
        case "media": // media is a sub of message, do not pass it on
        case "category": // category is a sub of presence, perhaps others? who knows
        case "ping": // ping is a sub of iq
            break;
        case "query": // query xmlns=jabber:iq:last is handled as part of an iq
            if(node.getAttributeValue("xmlns") != "jabber:iq:last") {
                this.emit('stanza', node);
            } else {
                break;
            }
        case "iq":
            this.emit('iq', node);
            break;
        case "presence":
            this.emit('presence', node);
            break;
        case "message":
            this.emit('message', node);
            break;
        case "stream:error":
            this.emit('streamError', node);
            break;
        default:
            this.emit('stanza', node);
            break;
    }
    log.stream("incoming:\n" + node);
    return node;
}

BinTreeNodeReader.prototype.isListTag = function(b) {
    return b == 248 || b == 0 || b == 249;
}

BinTreeNodeReader.prototype.readList = function(token) {
    var size = this.readListSize(token);
    var listx = [];
    for(var i = 0; i < size; i ++) {
        listx.push(this.nextTreeInternal());
    }
    return listx;
}

BinTreeNodeReader.prototype.readInt8 = function() {
    return this.inn[this.innPointer++];
}

BinTreeNodeReader.prototype.readInt16 = function() {
    //return this.readInt8() + this.readInt8();
    var a = this.readInt8();
    var b = this.readInt8();
    return (a << 8) + b;
}

BinTreeNodeReader.prototype.readInt24 = function() {
    var a = this.readInt8();
    var b = this.readInt8();
    var c = this.readInt8();
    //console.log("readInt24: " + a + "," + b + "," + c + "=" + (a+b+c));
    //console.log("shift: " + ((a << 16) + (b << 8) + c));
    //return this.readInt8() + this.readInt8() + this.readInt8();
    return (a << 16) + (b << 8) + c;
}

BinTreeNodeReader.prototype.readListSize = function(token) {
    var size = 0;
    if(token == 0) {
        size = 0;
    } else {
        if(token == 248) {
            size = this.readInt8();
        } else {
            if(token == 249) {
                size = this.readInt16();
            } else {
                throw("invalid list size in readListSize token " + token);
            }
        }
    }
    return size;
}

BinTreeNodeReader.prototype.fillBuffer = function(size) {
    this.innPointer += size;
}

BinTreeNodeReader.prototype.readAttributes = function(attribCount) {
    var attribs = { };
    for(var i = 0; i < attribCount; i++) {
        var key = this.readString(this.readInt8());
        var value = this.readString(this.readInt8());
        attribs[key] = value;
    }
    return attribs;
}

BinTreeNodeReader.prototype.getToken = function(token) {
    if(token >= 0 && token < this.tokenMap.length) {
        var ret = this.tokenMap[token];
    } else {
        throw("invalid token/length in getToken " + token);
    }
    return ret;
}

BinTreeNodeReader.prototype.readString = function(token) {
    if(token == -1) {
        throw("-1 token in readString");
    }
    if(token > 0 && token < 245) {
        return this.getToken(token);
    }
    if(token == 0) {
        return undefined;
    }
    if(token == 252) {
        var size8 = this.readInt8();
        var buf8 = this.inn.slice(this.innPointer, this.innPointer + size8);
        this.innPointer += size8;
        return buf8.toString("ascii");
    }
    if(token == 253) {
        try {
            var size24 = this.readInt24();
            var buf24 = this.inn.slice(this.innPointer, this.innPointer + size24);
            console.log("24bit read, size24=" + size24 + " inn.length=" + this.inn.length + " innPointer=" + this.innPointer);
            this.innPointer += size24;
            return buf24.toString("ascii");
        } catch(err) {
            return "Bad Buf24 read, size24=" + size24 + " inn.length=" + this.inn.length + " innPointer=" + this.innPointer;
        }
    }
    if(token == 254) {
        token = this.readInt8();
        return this.getToken(245 + token);
    }
    if(token == 250) {
        var user = this.readString(this.readInt8());
        var server = this.readString(this.readInt8());
        if(user && server) {
            return user + "@" + server;
        } else if(server) {
            return server;
        } else {
            throw("readString couldn't reconstruct jid");
        }
    }
    throw("readString couldn't match token " + token);
}

/* BinTreeNodeWriter -- this should output junk to our output stream */

var BinTreeNodeWriter = function(outputstream, dictionary, opt) {
    this.debug = opt ? opt.debug : false;
    this.realOut = outputstream;
    this.tokenMap = {};
    this.out = new Buffer("");
    for(var i = 0; i < dictionary.length; i++) {
        if(dictionary[i]) {
            this.tokenMap[dictionary[i]] = i;
        }
    }
}

BinTreeNodeWriter.prototype.streamStart = function(domain, resource) {
    //var out = new Buffer("WA\x01\x00", "binary");
    var out = new Buffer("WA\x01\x01", "binary");
    this.realOut.write(out);
    
    var node = new ProtocolTreeNode("stream:stream", { "to": domain, "resource": resource } );
    this.write(node);
}

BinTreeNodeWriter.prototype.writeListStart = function(i) {
    if(i == 0) {
        return new Buffer("\x00");
    } else if(i < 256) {
        return new Buffer("\xf8" + this.writeInt8(i).toString("binary"), "binary");
    } else {
        return new Buffer("\xf9" + this.writeInt16(i).toString("binary"), "binary");
    }
}

BinTreeNodeWriter.prototype.writeJid = function(user, server) {
    var x = Buffer("\xFA" + (user ? this.writeString(user) : this.writeToken(0)).toString("binary") + this.writeString(server).toString("binary"), "binary");
    return x.toString("binary");
}

BinTreeNodeWriter.prototype.writeAttributes = function(attributes) {
    var buf = new Buffer("");
    if(attributes) {
        for(var x in attributes) {
            //console.log("writing attribute " + x + ":" + attributes[x]);
            var key = this.writeString(x);
            var val = this.writeString(attributes[x]);
            buf = new Buffer(buf.toString("binary") + key.toString("binary") + val.toString("binary"), "binary");
        }
    }
    return buf;
}

BinTreeNodeWriter.prototype.writeString = function(tag) {
    //console.log("writeString: " + tag);
    var key = this.tokenMap[tag];
    if(key) {
        return this.writeToken(key);
    } else {
        var atIndex = tag ? tag.indexOf('@') : -1;
        if(atIndex < 1) {
            return this.writeBytes(tag);
        } else {
            var server = tag.substring(atIndex+1, tag.length);
            var user = tag.substring(0, atIndex);
            return this.writeJid(user, server);
        }
    }
}

BinTreeNodeWriter.prototype.writeToken = function(intValue) {
    if(intValue < 245) {
        return this.writeInt8(intValue);
    } else if(intValue <= 500) {
        return new Buffer("\xFE" + this.writeInt8(intValue - 245).toString("binary"), "binary");
    }
}

BinTreeNodeWriter.prototype.writeBytes = function(bytes) {
    var length = bytes ? bytes.length : 0;
    var buf;
    if(length >= 256) {
        buf = new Buffer("\xfd" + this.writeInt24(length).toString("binary"), "binary"); // 253
    } else {
        buf = new Buffer("\xfc" + this.writeInt8(length).toString("binary"), "binary"); // 252
    }
    buf = new Buffer(buf.toString("binary") + bytes, "binary");
    return buf;
}

BinTreeNodeWriter.prototype.write = function(node, needsFlush) {
    if(!node) {
        this.writeInt8(0);
    } else {
        this.writeInternal(node);
    }
    this.flushBuffer();
}

BinTreeNodeWriter.prototype.writeInternal = function(node) {
    if(node.tag == undefined) {
        console.log("writeInternal: *** WTF, node.tag is undefined, node=" + JSON.stringify(node));
    }
    log.stream("outgoing:\n" + node);
    var attlength = 0;
    if(node.attributes) {
        for(var x in node.attributes) {
            if(node.attributes.hasOwnProperty(x))
                attlength++;
        }
    }
    var x = 1 + (node.attributes ? attlength * 2 : 0) + (node.children ? 1 : 0) + (node.data ? 1 : 0);
    
    var liststart = this.writeListStart(x);
    
    var tagstring = this.writeString(node.tag);
    
    var attrib = this.writeAttributes(node.attributes);
     
    this.out = new Buffer(this.out.toString("binary") + liststart.toString("binary") + tagstring.toString("binary") + attrib.toString("binary"), "binary");
    if(node.data) {
        this.out = new Buffer(this.out.toString("binary") + this.writeBytes(node.data).toString("binary"), "binary");
    }
    if(node.children) {
        this.out = new Buffer(this.out.toString("binary") + this.writeListStart(node.children.length).toString("binary"), "binary");
        for(var c in node.children) {
            //console.log("writing internal child " + JSON.stringify(node.children[c]));
            this.writeInternal(node.children[c]);
        }
    }
}

BinTreeNodeWriter.prototype.flushBuffer = function() {
    var size = this.out.length;
    var x = this.writeInt16(size);
    var buf = new Buffer(x.toString("binary") + this.out.toString("binary"), "binary");
    if(this.debug) {
        var out = "";
        for(var i = 0; i < buf.length; i++) {
            out += buf[i] + " ";
        }
        console.log("writing buffer of size " + size);
        console.log(buf.toString("ascii"));
    }
    this.realOut.write(buf, "binary");
    this.out = new Buffer("");
}

BinTreeNodeWriter.prototype.writeInt8 = function(v) {
    return new Buffer("" + String.fromCharCode(v), "binary");
}

BinTreeNodeWriter.prototype.writeInt16 = function(v) {
    return new Buffer(this.writeInt8( (v >> 8) & 0xFF).toString("binary") + this.writeInt8(v & 0xFF).toString("binary"), "binary");
}

BinTreeNodeWriter.prototype.writeInt24 = function(v) {
    return new Buffer(this.writeInt8( (v >> 16) & 0xFF).toString("binary") + this.writeInt8( (v >> 8) & 0xFF).toString("binary") + this.writeInt8(v & 0xFF).toString("binary"), "binary");
}

exports.ProtocolTreeNode = ProtocolTreeNode;
exports.BinTreeNodeReader = BinTreeNodeReader;
exports.BinTreeNodeWriter = BinTreeNodeWriter;
exports.log = log;