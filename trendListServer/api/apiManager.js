"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");


var ApiManager = (function () {

    //Manager for handling api setup and routes
    function ApiManager() {
        // Reference to ApiManager "this", for use in child functions
        var self = this;

        //Holds the api server
        self.apiServer = null;

        //Holds the api library
        self.apiLibrary = null;

        //Call the constructor of the EventEmitter passing in the ApiManager
        events.EventEmitter.call(self);
    }

    //ApiManager inherits the methods of the eventEmitter
    util.inherits(ApiManager, events.EventEmitter);

    //Setup apiManager, get library, and create server
    ApiManager.prototype.init = function () {
        // Reference to ApiManager "this", for use in child functions
        var self = this;
        //Get the api library
        if (self.apiLibrary === null) {
            self.apiLibrary = require("restify");
        }
        //Create api server and configure server
        if (self.apiServer === null) {
            self.apiServer = self.apiLibrary.createServer();
            self.apiServer.use(self.apiLibrary.gzipResponse());
        }
        //Emit event to signal function logic is completed
        console.log("apiManager-initialized");
        self.emit("apiManager-initialized");
    };

    //
    ApiManager.prototype.registerRoutes = function () {
        // Reference to ApiManager "this", for use in child functions
        var self = this;

        //Used to handle country requests
        var countryRequestHandler = require("./countryRequestHandler");
        //Setup country request routes
        self.apiServer.get("/country", countryRequestHandler.getAll);
        self.apiServer.get("/country/:id", countryRequestHandler.getById);

        //Emit event to signal function logic is completed
        console.log("apiManager-routesRegistered");
        self.emit("apiManager-routesRegistered");
    };

    //
    ApiManager.prototype.startServer = function () {
        // Reference to ApiManager "this", for use in child functions
        var self = this;

        //Start server listening on port
        //Local enviroment - SQLite
        self.apiServer.listen(8181);

        // //Hosted enviroment - Appfog / MySQL
        // self.apiServer.listen(process.env.VCAP_APP_PORT);

        //Emit event to signal function logic is completed
        console.log("apiManager-serverStarted");
        self.emit("apiManager-serverStarted");
    };

    return ApiManager;
}());

//Holds the singleton instance of the ApiManager
ApiManager.instance = null;

//Method for retreiving an instance of the ApiManager
//Ensures that there can be only one instance of the ApiManager
ApiManager.getInstance = function () {
    if (ApiManager.instance === null) {
        ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
};

//Exports the singleton instance of the ApiManager
module.exports = ApiManager.getInstance();