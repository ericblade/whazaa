var Class=exports.Class={create:function(superclass,methods){if(!methods){methods=superclass||{};methods.__proto__=this._base}else{methods.__proto__=superclass.prototype}function clazz(){this.initialize.apply(this,arguments)}methods.constructor=clazz;if(typeof inBuiltinEnv!=='undefined'&&inBuiltinEnv){setPrototype(clazz,methods)}else{clazz.prototype=methods}return clazz},_base:{initialize:function(){},$super:function(fn){var s=this;if(fn._super){return function(){return fn._super.apply(s,arguments)}}else{var n=fn.name;if(!n){throw Err.create(-1,"No method name:"+fn)}for(var p=this.__proto__;p;p=p.__proto__){if(p[n]===fn){for(var p=p.__proto__;p;p=p.__proto__){var f=p[n];if(f){fn._super=f;return function(){return f.apply(s,arguments)}}}break}}throw Err.create(-1,"Method not found: "+n)}}}};

/* PROLOGUE.JS */
// Begin whazaa specific requirements
tls = require('net');

var base64 = {};

base64.encode = function (unencoded) {
  return new Buffer(unencoded || '').toString('base64');
};

base64.decode = function (encoded) {
  return new Buffer(encoded || '', 'base64').toString('utf8');
};

crypto = require('crypto');

function md5(x) {
    return crypto.createHash('md5').update(x).digest("hex");
}

var fs = require('fs');
var servicePath = fs.realpathSync('.');
uuid = require(servicePath+'/uuid.js');

var dummy = this;

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

function pack (format) {
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

/* waAPInew.js */

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

/* serviceAssistant.js */
serviceAssistant = Class.create({
    initialize: function() {
    },
    setup: function() {
        this.connectFuture = typeof Future !== 'undefined' ? new Future() : {};
        this.socket = tls.createConnection(5222, 'bin-short.whatsapp.net');
        this.socket.addListener('connect', this.doLogin.bind(this));
        this.socket.addListener('data', this.processData.bind(this));
        return this.connectFuture;
    },
    doLogin: function() {
        this.out = BinTreeNodeWriter();
        this.out.streamStart(this.connection.domain, this.connection.resource);
        this.sendFeatures
        /*this.step1 = true;
        var init = Buffer("WA\x01\x00\x00\x19\xf8\x05\x01\xa0\x8a\x84\xfc\x11" + "iPhone-2.6.9-5222" + "\x00\x08\xf8\x02\x96\xf8\x01\xf8\x01\x7e\x00\x07\xf8\x05\x0f\x5a\x2a\xbd\xa7", "binary");
        console.log("writing init:", init.length, init, ":", init.toString("ascii"), init);
        this.socket.write(init);
        this.connectFuture = { returnValue: true, connected: true };*/
    },
    processData: function(data) {
        console.log("processData", data);
        if(this.step1) this.processStepOne(data);
        if(this.step2) this.processStepTwo(data);
        if(this.step3) this.processStepThree(data);
        
        //var reader = new binTreeNodeReader(data);
        var dataarr = splitBuffer(data, 0); // split on nulls
        dataarr = dataarr.slice(1, dataarr.length); // remove first 00
        // TODO: I suspect the first 00 is actually a length byte for when it goes over 256 bytes for the whole packet.. things might get fucked up
        // but for now, we're just going to treat the length as an 8-bit. see the Reader node
        console.log("data consists of parts=", dataarr.length);
        for(var x = 0; x < dataarr.length; x++)
        {
            var reader = new BinTreeNodeReader(dataarr[x]);
            if(reader.tag == "message") {
                this.parseMessage(reader);
            }
        }
    },
    parseMessage: function(node) {
        //console.log("parseMessage node=", node.buffer.toString("hex"));
        //console.log("parseMessage remaining=", node.buffer.slice(node.buffer.pointer, node.buffer.length - node.buffer.pointer));
    },
    processStepOne: function(data) {
        this.step1 = false;
        this.step2 = true;
        var response = base64.decode(data.toString("binary").substr(26));
        var arrResp = response.split(",");
        var nonce = arrResp[0];
        nonce = nonce.split('"')[1];
        
        var a1 = "19519993267:s.whatsapp.net:134529771563"; // phonenumber : server : password
        var cnonce = uuid.v4();
        var nc = "00000001";
        
        a1 = pack("H32", md5(a1)) + ":" + nonce + ":" + cnonce;
        var a2 = "AUTHENTICATE:" + "xmpp/s.whatsapp.net";
        var password = md5(a1) + ":" + nonce + ":" + nc + ":" + cnonce +":" + "auth" + ":" + md5(a2);
        password = md5(password);
        var response = 'username="19519993267",realm="s.whatsapp.net",nonce="' + nonce +
                        '",cnonce="' + cnonce + '",nc=' + nc + ',qop=auth,digest-uri="xmpp/s.whatsapp.net",response='+password+',charset=utf-8';
        console.log("login response:", response);
        //var send = Buffer("\x01\x31\xf8\x04\x86\xbd\xa7\xfd\x00\x01\x28" + base64.encode(response), "binary");
        //this.socket.write(send);
    },
    processStepTwo: function(data) {
        this.step2 = false;
        this.step3 = true;
        var send = Buffer(
"\x00\x12\xf8\x05\x74\xa2\xa3\x61\xfc\x0a\x41\x68\x6d\x65\x64\x20\x4d\x6f\x68\x64\x00\x15\xf8\x06\x48\x43\x05\xa2\x3a\xf8\x01\xf8\x04\x7b\xbd\x4d\xf8\x01\xf8\x03\x55\x61\x24\x00\x12\xf8\x08\x48\x43\xfc\x01\x32\xa2\x3a\xa0\x8a\xf8\x01\xf8\x03\x1f\xbd\xb1",
            "binary");
        this.socket.write(send);
    },
    processStepThree: function(data) {
        this.step3 = false;
        console.log("step 3 receive", data.length);
        /*var availablenode = new waTreeNode("presence", { "name": "Eric Blade", "type": "available" });
        console.log("availablenode", availablenode.toString());
        var writer = new binTreeNodeWriter(this.socket);
        console.log("writer", writer);
        writer.write(availablenode);
        */
    }
});

x = new serviceAssistant();
x.setup();