"use strict";

//Get databaseManager for defining model
var databaseManager = require("../database/databaseManager");

//Define model
var CountryModel = databaseManager.databaseConnection.define("Country", {
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
            notEmpty: true,
            isNumeric: true
        }
    }
});

//Export model
module.exports = CountryModel;