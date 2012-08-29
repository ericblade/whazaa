node-wa
=======

Node.js whatsapp access

Loosely based on the WhatsAPI and Wazapp projects that you can find on github.

Appears to work in all versions of Node from 0.2 to 0.8.  

I don't know much about building node modules properly, so hopefully if anyone else finds this useful, they can
clean up some of the mess.  

Good luck and enjoy.

Here's how I basically make it do something:

var waApi = require('testapi.js').waApi;

var wa = new waApi(userId, password, { debug: true });

It is an EventEmitter that will emit several events when things happen.  You can call different functions within it to 
cause different things to happen.

At this time, if someone sends you custom image data, it'll probably crash out, as it has no idea how to parse it.

Events:

* close: emitted when the connection to the server is closed
* loggedin: emitted when the client is actually logged into the server
* presence: emits { from: "userid-who-sent", type: "[available|unavailable]" } when a user presence is received
* streamError: emits a ProtocolTreeNode describing the received error
* msgReceived: emis { from: "userid-who-received", id: "messageId" } when a message-received message is received (ie, when the system tells you that another user has received a message you sent)
* composing: emitted when we receive notification that a user is typing, contains just the userid who is typing
* paused: emitted when we receive notification that a user has stopped typign, contains just the userid 
* message: emitted when we receive a full message, the entire ProtocolTreeNode is sent
* serverAccept: emits { from: "userid-who-message-was-sent-to", id: "messageId" } when a message is accepted by the server (msgReceived should be emitted when the actual recipient has received the message)
* message: also emitted when we receive something that looks like a message, but we have no idea how to parse it internally

Functions you can call:

* sendTyping(jid) - inform server that you are typing
* sendPaused(jid) - inform server that you are not typing
* getLastOnline(jid) - ask the server to tell us when someone was last seen
* sendAvailable() - inform server we are available
* sendAvailableForChat() - inform server we are available for chat (WA doesn't seem to care about that setting though)
* sendCustomStatus(status) - tell the server of our custom status. Although WA accepts the message, it doesn't seem to propagate, so I'm guessing that they are using some non-standard method of doing this, and this method will need to be changed.
* sendUnavailable() - inform server we are not available
* sendMessageWithBody({ content: "Message Content", to: "userid to send to" }) - send a message


