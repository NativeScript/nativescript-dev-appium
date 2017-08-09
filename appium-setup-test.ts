var wd = require("wd");
require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
export var should = chai.should();

chaiAsPromised.transferPromiseness = wd.transferPromiseness;
