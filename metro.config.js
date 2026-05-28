const path = require("path");
const { load } = require("@expo/env");

load(path.join(__dirname, "apps"));

module.exports = require("./apps/metro.config.js");
