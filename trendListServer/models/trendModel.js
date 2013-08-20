"use strict";

//Get databaseManager for defining model
var databaseManager = require("../database/databaseManager");

//Define model
var TrendModel = databaseManager.databaseConnection.define("Trend", {
    name: {
        type: databaseManager.databaseLibrary.STRING,
        validate: {
            notNull: true,
            notEmpty: true
        }
    },
    woeid: {
        type: databaseManager.databaseLibrary.STRING,
        validate: {
            notNull: true,
            notEmpty: true
        }
    }

});

//Export model
module.exports = TrendModel;