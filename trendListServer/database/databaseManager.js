"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");

var DatabaseManager = (function () {

    //Manager for handling database knowledge, logic and connections
    function DatabaseManager() {
        // Reference to DatabaseManager "this", for use in child functions
        var self = this;
        //Call the constructor of the EventEmitter passing in the DatabaseManager
        events.EventEmitter.call(self);
        //Holds the database connection 
        self.databaseConnection = null;
        //Holds the database library, used for interfacing with the 
        self.databaseLibrary = null;
        //Drop database flag
        self.dropDatabase = null;
        //Force sync flag
        self.forceSync = null;
        //Holds the database models
        self.models = [];
    }

    //DatabaseManager inherits the methods of the eventEmitter
    util.inherits(DatabaseManager, events.EventEmitter);

    //Setup databaseManager, get library, and connection
    DatabaseManager.prototype.init = function (dropDatabase, forceSync) {
        // Reference to DatabaseManager "this", for use in child functions
        var self = this;
        //Get database library
        if (self.databaseLibrary === null) {
            //Local enviroment - SQLite
            self.databaseLibrary = require("sequelize-sqlite").sequelize;

            // //Hosted enviroment - Appfog / MySQL
            // self.databaseLibrary = require("sequelize-mysql").sequelize;
        }
        //Get database connection
        if (self.databaseConnection === null) {
            //Local enviroment - SQLite
            self.databaseConnection = new self.databaseLibrary("database", null, null, {
                dialect: "sqlite",
                storage: "database/trendList.sqlite"
            });

            // //Hosted enviroment - Appfog / MySQL
            // var serviceDetails = JSON.parse(process.env.VCAP_SERVICES);
            // var mySqlService = serviceDetails["mysql-5.1"][0]["credentials"];
            // self.databaseConnection = new self.databaseLibrary(mySqlService.name, mySqlService.username, mySqlService.password, {
            //  host: mySqlService.host,
            //  port: mySqlService.port,
            //  dialect: 'mysql'
            // });
        }

        self.dropDatabase = dropDatabase;
        self.forceSync = forceSync;

        //Emit event to signal function logic is completed
        console.log("databaseManager-initialized");
        self.emit("databaseManager-initialized");
    };

    //Logic before database deployment
    DatabaseManager.prototype.predeployment = function () {
        // Reference to DatabaseManager "this", for use in child functions
        var self = this;
        //Get model definitions
        self.models.push(require("../models/countryModel"));
        self.models.push(require("../models/trendModel"));

        //Emit event to signal function logic is completed
        console.log("databaseManager-predeployed");
        self.emit("databaseManager-predeployed");
    };

    //Database deployment
    DatabaseManager.prototype.deploy = function () {
        // Reference to DatabaseManager "this", for use in child functions
        //Maintain counts to measure completion0
        var self = this, index, model, dropCount = 0, syncCount = 0;

        //Check the progress on the database table sync
        function syncTableCompleteCheck() {
            syncCount = syncCount + 1;
            if (syncCount === self.models.length) {
                //Emit event to signal function logic is completed
                console.log("databaseManager-deployed");
                self.emit("databaseManager-deployed");
            }
        }

        //Create database tables
        function syncTables() {
            for (index = 0; index < self.models.length; index++) {
                model = self.models[index];
                model.sync({force: self.forceSync}).success(syncTableCompleteCheck());
            }
        }

        //Check the progress of the database table drop
        function dropTableCompleteCheck() {
            dropCount = dropCount + 1;
            if (dropCount === self.models.length) {
                syncTables();
            }
        }

        //Drop tables
        function dropTables() {
            for (index = 0; index < self.models.length; index++) {
                model = self.models[index];
                model.drop().success(dropTableCompleteCheck());
            }
        }

        if (self.dropDatabase) {
            dropTables();
        } else {
            syncTables();
        }
    };

    //Logic after database deployment
    DatabaseManager.prototype.postdeployment = function () {
        // Reference to DatabaseManager "this", for use in child functions
        var self = this;
        //Seed database with data
        //Emit event to signal function logic is completed
        console.log("databaseManager-postdeployed");
        self.emit("databaseManager-postdeployed");
    };

    return DatabaseManager;
}());

//Holds the singleton instance of the DatabaseManager
DatabaseManager.instance = null;

//Method for retreiving an instance of the DatabaseManager
//Ensures that there can be only one instance of the DatabaseManager
DatabaseManager.getInstance = function () {
    if (DatabaseManager.instance === null) {
        DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
};

//Exports the singleton instance of the DatabaseManager
module.exports = DatabaseManager.getInstance();