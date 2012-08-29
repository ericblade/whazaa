serviceAssistant = Class.create({
    setup: function() {
        console.log("*** serviceAssistant initialization");
        return PalmCall.call("palm://com.palm.db/", "putPermissions", {
            permissions:
                [
                    {
                        "type": "db.kind",
                        "object": "com.ericblade.whazaa.contact:1",
                        "caller": "com.ericblade.*",
                        "operations": {
                            "create": "allow",
                            "update": "allow",
                            "read": "allow",
                            "delete": "allow"
                        }
                    },
                    {
                        "type": "db.kind",
                        "object": "com.ericblade.whazaa.contact:1",
                        "caller": "com.palm.*",
                        "operations": {
                            "create": "allow",
                            "update": "allow",
                            "read": "allow",
                            "delete": "allow"
                        }
                    }    
                ]
        });
    }
});

