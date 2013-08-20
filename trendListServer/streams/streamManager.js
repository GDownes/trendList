"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");
//Used to handle global events
var eventManager = require("../services/eventManager");


var StreamManager = (function () {

    //Manager for handling stream setup and stream handling
    function StreamManager() {
        // Reference to StreamManager "this", for use in child functions
        var self = this;

        //Holds the stream library
        self.streamLibrary = null;

        //Holds the stream server
        self.streamServer = null;

        //Call the constructor of the EventEmitter passing in the StreamManager
        events.EventEmitter.call(self);
    }

    //StreamManager inherits the methods of the eventEmitter
    util.inherits(StreamManager, events.EventEmitter);

    //Setup streamManager, get handler
    StreamManager.prototype.init = function () {
        // Reference to StreamManager "this", for use in child functions
        var self = this;
        //Get the stream library
        if (self.streamLibrary === null) {
            self.streamLibrary = require('socket.io');
        }

        //Emit event to signal function logic is completed
        console.log("streamManager-initialized");
        self.emit("streamManager-initialized");
    };

    //Start the streams listening to the api server
    StreamManager.prototype.startListeningStream = function () {
        // Reference to StreamManager "this", for use in child functions
        //Get the apiManager to access the server
        var self = this, apiManager = require("../api/apiManager");

        //Start the streamLibrary listening to the same port as the api server
        if (self.streamServer === null) {
            self.streamServer = self.streamLibrary.listen(apiManager.apiServer);
        }

        //Emit event to signal function logic is completed
        console.log("streamManager-serverListening");
        self.emit("streamManager-serverListening");
    };

    //Setup the stream events on the streamLibrary
    StreamManager.prototype.streamEventSetup = function () {
        // Reference to StreamManager "this", for use in child functions
        var self = this;

        //Setup country stream handlers
        self.streamServer.sockets.on('connection', function (socket) {
            var countryDAO = require("../dao/countryDAO");
            countryDAO.getAll(function (entites) {
                socket.emit('countriesSent', entites);
            });
        });

        eventManager.eventEmitter.on("countryService-updated", function () {
            var countryDAO = require("../dao/countryDAO");
            countryDAO.getAll(function (entites) {
                self.streamServer.sockets.emit('countriesSent', entites);
            });
        });

        //Emit event to signal function logic is completed
        console.log("streamManager-eventsConfigured");
        self.emit("streamManager-eventsConfigured");
    };

    return StreamManager;
}());

//Holds the singleton instance of the StreamManager
StreamManager.instance = null;

//Method for retreiving an instance of the StreamManager
//Ensures that there can be only one instance of the StreamManager
StreamManager.getInstance = function () {
    if (StreamManager.instance === null) {
        StreamManager.instance = new StreamManager();
    }
    return StreamManager.instance;
};

//Exports the singleton instance of the StreamManager
module.exports = StreamManager.getInstance();