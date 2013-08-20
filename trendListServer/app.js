"use strict";

//Setup services
//Loaded in dependence order
var setupServices = function () {
    //Get services
    //Get countryService to update countries in database
    var countryService = require("./services/countryService");
    //Get trendService to update trends in database
    var trendService = require("./services/trendService");

    countryService.on("countryService-initialized", function () {
        countryService.start();
    });
    countryService.on("countryService-started", function () {
        trendService.init();
    });

    trendService.on("trendService-initialized", function () {
        trendService.start();
    });

    countryService.init();
};

//Setup managers
//Loaded in dependence order
var setupManagers = function () {
    //Get errorManager to handle application errors
    var errorManager = require("./services/errorManager");
    //Get logManager to log application activity
    var logManager = require("./services/logManager");
    //Get eventManager to handle global application events
    var eventManager = require("./services/eventManager");
    //Get application dataManager to interface with database
    var databaseManager = require("./database/databaseManager");
    //Get apiManager to setup and manage api requests
    var apiManager = require("./api/apiManager");
    //Get streamManager to setup and manage streams
    var streamManager = require("./streams/streamManager");

    errorManager.on("errorManager-initialized", function () {
        logManager.init();
    });

    logManager.on("logManager-initialized", function () {
        eventManager.init();
    });

    eventManager.on("eventManager-initialized", function () {
        databaseManager.init(false, false);
    });

    databaseManager.on("databaseManager-initialized", function () {
        databaseManager.predeployment();
    });
    databaseManager.on("databaseManager-predeployed", function () {
        databaseManager.deploy();
    });
    databaseManager.on("databaseManager-deployed", function () {
        databaseManager.postdeployment();
    });
    databaseManager.on("databaseManager-postdeployed", function () {
        apiManager.init();
    });

    apiManager.on("apiManager-initialized", function () {
        apiManager.registerRoutes();
    });
    apiManager.on("apiManager-routesRegistered", function () {
        apiManager.startServer();
    });
    apiManager.on("apiManager-serverStarted", function () {
        streamManager.init();
    });

    streamManager.on("streamManager-initialized", function () {
        streamManager.startListeningStream();
    });
    streamManager.on("streamManager-serverListening", function () {
        streamManager.streamEventSetup();
    });
    streamManager.on("streamManager-eventsConfigured", function () {
        setupServices();
    });

    errorManager.init();
};

//Start the application loading
setupManagers();





