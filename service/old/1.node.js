// PING -- 20f80848388a43fc0f313333393535313030372d70696e67a23af801f80371bdac  H8?Cü?1339551007-ping¢:o?o?q½¬
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

function message(socket, msgid, to, txt)
{
    var long_txt_bool = (txt.length < 256);
    var txt_length = hex2str(_hex(txt.length));
    var to_length = String.fromCharCode(Buffer(to, "utf-8").toString().length);
    var msgid_length = String.fromCharCode(msgid.length);
    
    console.log(long_txt_bool, txt_length, parseInt(txt_length.charCodeAt()), to_length, parseInt(to_length.charCodeAt()), msgid_length, parseInt(msgid_length.charCodeAt()));

    var content = Buffer("\xF8\x08\x5D\xA0\xFA\xFC" + to_length + to + "\x8A\xA2\x1B\x43\xFC" + msgid_length + msgid +
                         "\xF8\x02\xF8\x04\xBA\xBD\x4F\xF8\x01\xF8\x01\x8C\xF8\x02\x16" + (!long_txt_bool ? "\xFD\x00" : "\xFC") +
                         txt_length + txt, "binary");
    var total_length = hex2str(_hex(content.toString("binary").length));
    if(total_length.length == 1) {
        total_length = Buffer("\x00" + total_length);
    } else {
        total_length = Buffer(total_length);
    }
    console.log("total length=", content.length, total_length, total_length.length);
    //var msg = Buffer(content.length + total_length.length);
    //msg.write(total_length);
    //content.copy(msg, total_length.length);
    console.log("sending message", total_length.toString("ascii") + content.toString("ascii"), content.toString("binary"));
    console.log(Buffer(total_length.toString("binary") + content.toString("binary"), "binary").toString("ascii"));
    socket.write(Buffer(total_length.toString("binary") + content.toString("binary"), "binary"));
    //socket.write(msg);
}

var dummy = this;
//dummy.socket = tls.connect(5222, 'bin-short.whatsapp.net', function() {
dummy.socket = tls.createConnection(5222, 'bin-short.whatsapp.net');

dummy.socket.addListener('connect', function() {
    dummy.connected = true;
    console.log("connection to bin-short.whatsapp.net successful");
    var init = 
        Buffer("WA\x01\x00\x00\x19\xf8\x05\x01\xa0\x8a\x84\xfc\x11" + "iPhone-2.6.9-5222" + "\x00\x08\xf8\x02\x96\xf8\x01\xf8\x01\x7e\x00\x07\xf8\x05\x0f\x5a\x2a\xbd\xa7", "binary");
    this.step1 = true;
    dummy.socket.write(init);
    console.log("init string=", init.toString("binary"));
});

dummy.socket.addListener('data', function(data) {
    if(this.step1) {
        //console.log("step1 recv");
        //read(data);
        this.step1 = false;
        var response = base64.decode(data.toString("binary").substr(26));
        console.log("challenge = " + data.toString("binary").substr(26));
        console.log("decoded challenge = " + response);
        this.step2 = true;
        var arrResp = response.split(",");
        var nonce = arrResp[0];
        nonce = nonce.split('"')[1];
        
        // _authenticate
        var a1 = "17079925233:s.whatsapp.net:134529771563"; // phonenumber:server:password/udid
        var cnonce = uuid.v4();
        var nc = "00000001";
        
        a1 = pack("H32", md5(a1)) + ":" + nonce + ":" + cnonce;
        a2 = "AUTHENTICATE:" + "xmpp/s.whatsapp.net";
        var password = md5(a1) + ":" + nonce + ":" + nc + ":" + cnonce + ":" + "auth"/*qop, sent above as well*/ + ":" + md5(a2);
        password = md5(password);
        var response = 'username="17079925233",realm="s.whatsapp.net",nonce="' + nonce +
                        '",cnonce="' + cnonce + '",nc=' + nc + ',qop=auth,digest-uri="xmpp/s.whatsapp.net",response='+password+',charset=utf-8';
        
        console.log("login response:", response);
        var send = Buffer("\x01\x31\xf8\x04\x86\xbd\xa7\xfd\x00\x01\x28" + base64.encode(response), "binary");
        dummy.socket.write(send);
        //console.log("send", send.toString("binary"));
    } else if(this.step2) {
        this.step2 = false;
        //console.log("step2 recv");
        read(data);
        var send = Buffer(
"\x00\x12\xf8\x05\x74\xa2\xa3\x61\xfc\x0a\x41\x68\x6d\x65\x64\x20\x4d\x6f\x68\x64\x00\x15\xf8\x06\x48\x43\x05\xa2\x3a\xf8\x01\xf8\x04\x7b\xbd\x4d\xf8\x01\xf8\x03\x55\x61\x24\x00\x12\xf8\x08\x48\x43\xfc\x01\x32\xa2\x3a\xa0\x8a\xf8\x01\xf8\x03\x1f\xbd\xb1",
            "binary");
        this.step3 = true;
        dummy.socket.write(send);
        //console.log("send", send.toString("binary"));
    } else if(this.step3) {
        this.step3 = false;
        console.log("step 3 receive", data.length);
        read(data);
        //var availablenode = waTreeNode("presence", { "name": "Eric Blade", "type": "available" });
        //var writer = binTreeNodeWriter(dummy.socket);
        //writer.write(availablenode);
        //message(dummy.socket, String(Math.round(new Date().getTime() / 1000) + "-1"), "9519993267", "Test Message");
        message(dummy.socket, String(Math.round(new Date().getTime() / 1000) + "-1"), "19519993267", "Test Message from node.js");
    } else {
        read(data);
    }
});

function read(buff)
{
    //console.log("read", buff.toString("hex"), buff.toString("ascii"));
    var resarray = splitBuffer(buff, 0); //"\x00".charCodeAt(0));
    resarray = resarray.slice(1, resarray.length);
    for(r in resarray)
    {
        //_identify(resarray[r]);
        decodePacket(resarray[r]);
    }
}

function decodePacket(buf)
{
    var nextbyte = 0;
    var packetlength = buf[nextbyte];
    var messagekeys = [];
    var messagevalues = [];
    //console.log("decodePacket");
    //console.log("packetlength=", packetlength);
    nextbyte++;
    var listsize = buf[nextbyte];
    //console.log("list size byte=", listsize);
    nextbyte++;
    if(listsize === 0)
    {
        console.log("*** listsize == 0!!");
    } else if(listsize == 248) {
        // one byte
        listsize = buf[2];
        nextbyte++;
    } else if(listsize == 249) {
        // two bytes
        listsize = buf[nextbyte] + buf[nextbyte + 1];
        nextbyte+=2;
    }
    //console.log("list size=", listsize)
    var tag = tokenMap[buf[nextbyte]];
    //console.log("tag=", tag);
    nextbyte++;
    listsize = ( (listsize - 2) + (listsize % 2) ) / 2;
    var nodetree = { };
    for(var x = 0; x < listsize; x++) {
        //console.log("starting at byte", nextbyte);
        var keyresult = decodeToken(buf, nextbyte);
        nextbyte += keyresult.size;
        messagekeys[x] = keyresult.result;
        
        var valresult = decodeToken(buf, nextbyte)
        nextbyte += valresult.size;
        messagevalues[x] = valresult.result;
        
        //console.log("x=", x, "message key=", keyresult.tokennum, messagekeys[x], "message value=", valresult.tokennum, messagevalues[x]);
        nodetree[messagekeys[x]] = messagevalues[x];
    }
    switch(tag) {
        case "success":
            console.log("Login success, status=", nodetree.status, "account type=", nodetree.kind, "creation time=", nodetree.creation, "expiration=", nodetree.expiration);
            break;
        case "presence":
            console.log("Presence received, status=", nodetree.status);
            if(!nodetree.xmlns || nodetree.xmlns == "urn:xmpp")
            {
                switch(nodetree.type) {
                    case "unavailable":
                        // handle presence unavailable
                        break;
                    case "available":
                    default:
                        // handle presence available
                        break;
                }
            }
            else if(nodetree.xmlns == "w")
            {
                if(nodetree.add) {
                    console.log("GROUP EVENT ADD", nodetree);
                } else if(nodetree.remove) {
                    console.log("GROUP EVENT REMOVE", nodetree);
                } else if(nodetree.status == "dirty") {
                    // do whatever we need to do for dirty status here
                }
            }
            break;
        case "iq":
            console.log("Message received, tree=", nodetree);
            switch(nodetree.type) {
                case "get":
                    if(nodetree.id.indexOf("-ping") != -1) {
                        var idx = nodetree.id.substr(0, nodetree.id.indexOf("-ping"));
                        console.log("received ping idx=", idx);
                        var pingresponse = waTreeNode("iq", { "type": "result", "to": this.domain, "id": idx });
                        var writer = binTreeNodeWriter(dummy.socket);
                        writer.write(pingresponse);
                    }
                    // something about a "query" and "pin" here
                    break;
                case "error":
                    // this is telling us we had a prior transmission error, and we need to kill the request somehow? or something?
                    break;
                case "set":
                    // something about a roster
                    break;
                case "result":
                    // looks like the account stuff should be in one of these packets, not in the "success" packet.. weird
                    break;
            }
            break;
        default:
            console.log("Unknown tag received:", tag);
            break;
    }
}

function decodeToken(buf, nextbyte)
{
    if(buf[nextbyte] == 0) {
        console.log("warning: null token encountered. how?");
        return { size: 1, result: undefined };
    }
    if(buf[nextbyte] == 250) {
        //console.log("decoding jid");
        var user = decodeToken(buf, nextbyte + 1);
        var username = user.result;
        var server = decodeToken(buf, nextbyte + 1 + user.size);
        var servername = server.result;
        //console.log("jid tokens length=" , user.size + server.size);
        return { result: username + "@" + servername, size: user.size + server.size + 1 };
    }
    if(buf[nextbyte] == 252) { // 0xfc
        //console.log("decoding array of size", buf[nextbyte+1]);
        var strsize = buf[nextbyte+1];
        var str = buf.slice(nextbyte + 2, nextbyte + 2 + strsize).toString();
        return { result: str, size: strsize + 2 };
    }
    if(buf[nextbyte] == 253) {
        console.log("decoding array of size", buf[nextbyte+1] + buf[nextbyte+2] + buf[nextbyte+3]);
        return { result: undefined, size: buf[nextbyte+1] + buf[nextbyte+2] + buf[nextbyte+3] };
    }
    if(buf[nextbyte] == 254) {
        console.log("decoding extended token", 245 + buf[nextbyte+1]);
        var res = decodeToken(245 + buf[nextbyte+1]);
        res.size++;
        return res;
    }
    return { result: tokenMap[buf[nextbyte]], tokennum: buf[nextbyte], size: 1 };
}

function _identify(buff)
{
    var msg_identifier = "\x5d\x38\xfa\xfc";
    var server_delivery_identifier = "\x8c";
    var client_delivery_identifier = "\x7f\xbd\xad";
    var last_seen_ident = "\x48\x38\xfa\xfc";
    var last_seen_ident2 = "\x7b\xbd\x4c\x8b";
    var acc_info_iden = "\x99\xbd\xa7\x94";
    
    var str = buff.toString("binary");
    var tempstr = "";
    // msg_identifier
    if(buff[3] == 0x5d && buff[4] == 0x38 && buff[5] == 0xfa && buff[6] == 0xfc) {
        for(var y = 0; y < buff.length; y++)
        {
            tempstr += buff[y].toString(16);
        }
        console.log("hex=", tempstr);        
        if(buff[buff.length-1] == 0x8c)
            console.log("server_delivery_report");
        else if(buff[buff.length-1] == 0xad && buff[buff.length-2] == 0xbd && buff[buff.length-3] == 0x7f)
            console.log("client_delivery_report");
        else {
            console.log("message:", buff.toString("ascii"));
            console.log(parse_received_message(buff));
        }
    } else if(buff[3] == 0x99 && buff[4] == 0xbd && buff[5] == 0xa7 && buff[6] == 0x94) { // acc_info_iden
        console.log("account_info");
        parse_account_info(buff);
    } else if(buff[3] == 0x48 && buff[4] == 0x38 && buff[5] == 0xfa && buff[6] == 0xfc && str.indexOf(last_seen_ident2) !== -1) {
        // last_seen_ident
        for(var x = 0; x < buff.length-3; x++) {
            if(buff[x] == 0x7b && buff[x+1] == 0xbd && buff[x+2] == 0x4c && buff[x+3] == 0x8b) // last_seen_ident2
            {
                console.log("last_seen");
                break;
            }
        }
        // last_seen_ident
    } else {
        for(var y = 0; y < buff.length; y++)
        {
            tempstr += buff[y].toString(16);
        }
        console.log("identify unknown string hex=", tempstr);        
    }
}

function parse_account_info(buff) {
    console.log("parse_account_info", buff.toString("ascii"));
    var account_status = (buff[7] == 0x09) ? "active" : "inactive";
    console.log("account_status", account_status);
    var account_kind = (buff[9] == 0x37) ? "free" : "paid";
    console.log("account_kind", account_kind);
    //var creation_timestamp_len = buff[9].toString();
    //console.log("creation_timestamp_len", creation_timestamp_len);
    var creation_timestamp = buff.slice(13, 23).toString();
    console.log("creation_timestamp", creation_timestamp);
    //var expiration_timestamp_len = buff[13 + creation_timestamp_len].toString().charCodeAt();
    var expiration_timestamp = buff.slice(26, 36).toString();
    console.log("expiration_timestamp", expiration_timestamp);    
}

function parse_received_message(buff) {
    var message = { };
    var msg = buff.toString("utf-8");
    message.length = msg.charCodeAt(0); // overall packet length
    msg = msg.substr(2);
    message.sec_length = msg.charCodeAt(0); // "length of something i don't know exactly what"
    msg = msg.substr(1);
    message.from_number_length = msg.charCodeAt(0); // from number length
    msg = msg.substr(1);
    message.from_number = msg.substr(0, message.from_number_length);
    msg = msg.substr(3);
    message.message_id_length = msg.charCodeAt(0);
    msg = msg.substr(1);
    message.message_id = msg.substr(0, message.message_id_length);
    msg = msg.substr(message.message_id_length);
    msg = msg.substr(4);
    message.timestamp_length = msg.charCodeAt(0);
    msg = msg.substr(1);
    if(msg.substr(0,1) == "\x88") {
        console.log("found retry length");
        msg = msg.substr(4);
    } else {
        console.log("no retry length found");
    }
    msg = msg.substr(9);
    message.sender_name_length = msg.charCodeAt(0);
    msg = msg.substr(1);
    message.sender_name = msg.substr(0, message.sender_name_length);
    msg = msg.substr(0, message.sender_name_length);
    msg = msg.substr(9);
    message.body_txt_length = msg.charCodeAt(0);
    msg = msg.substr(1);
    message.body_txt = msg.substr(0, message.body_txt_length);
    msg = msg.substr(message.body_txt_length);
    msg = msg.substr(9);
    message.time_length = msg.charCodeAt(0);
    msg = msg.substr(1);
    message.time = msg.substr(0, message.time_length);
    console.log("received message:", message);
    return message;
}

dummy.socket.addListener('error', function(error) {
    console.log("error:", error);
});

dummy.socket.addListener('close', function() {
    console.log("Socket Closed!");
});
