Whazaa
======

A webOS 2.x and 3.x service and application for communicating with WhatsApp.

This is not an official WhatsApp application.

This is a clone of my quite messy source tree. I don't really have time to maintain this right now, so I'm giving it to everyone.

There really should be use of a submodule from http://www.github.com/ericblade/node-wa but i don't have time to figure that out right now, sorry.

This currently implements the now deprecated WhatsApp 1.1 protocol.  This does not seem to work on WA anymore,
and needs some help getting it to work with WA 1.2.  This probably won't be too difficult for someone who has 
the time to put into it.

Help for dealing with WhatsApp 1.2:

http://lowlevel-studios.com/whatsapp-protocol-1-2-a-brief-explanation

https://github.com/venomous0x/WhatsAPI/issues/126


Note that there is quite probably a lot of completely dead code in this repository. I've tried to clean up some of it
but during it's development, there were several significant re-writes of code, and some of the older stuff probably
still remains.  If you make changes, and they don't seem to be doing anything, you may want to verify that the code
you're working in is still live.  Please submit changes to remove dead code.

