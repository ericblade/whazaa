var Class=exports.Class={create:function(superclass,methods){if(!methods){methods=superclass||{};methods.__proto__=this._base}else{methods.__proto__=superclass.prototype}function clazz(){this.initialize.apply(this,arguments)}methods.constructor=clazz;if(typeof inBuiltinEnv!=='undefined'&&inBuiltinEnv){setPrototype(clazz,methods)}else{clazz.prototype=methods}return clazz},_base:{initialize:function(){},$super:function(fn){var s=this;if(fn._super){return function(){return fn._super.apply(s,arguments)}}else{var n=fn.name;if(!n){throw Err.create(-1,"No method name:"+fn)}for(var p=this.__proto__;p;p=p.__proto__){if(p[n]===fn){for(var p=p.__proto__;p;p=p.__proto__){var f=p[n];if(f){fn._super=f;return function(){return f.apply(s,arguments)}}}break}}throw Err.create(-1,"Method not found: "+n)}}}};

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

require('./waAPINew.js');

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
        this.step1 = true;
        var init = Buffer("WA\x01\x00\x00\x19\xf8\x05\x01\xa0\x8a\x84\xfc\x11" + "iPhone-2.6.9-5222" + "\x00\x08\xf8\x02\x96\xf8\x01\xf8\x01\x7e\x00\x07\xf8\x05\x0f\x5a\x2a\xbd\xa7", "binary");
        console.log("writing init:", init.length, init, ":", init.toString("ascii"), init);
        this.socket.write(init);
        this.connectFuture = { returnValue: true, connected: true };
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
            var reader = new binTreeNodeReader(dataarr[x]);
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