var cfenv    = require("cfenv");
var Cloudant = require("cloudant");

var appEnv = cfenv.getAppEnv();

function MyCloudant(account, password) {
  this.account  = account;
  this.password = password;
  this.database = "trivias";
}

MyCloudant.prototype.randomQuestion = function() {
  Cloudant({account: this.account, password: this.password}, function (err, cloudant) {

    console.log(this.database);
    console.log(this.account);
    console.log(this.password);
    cloudant.db.get(this.database, function (err, body) {
      console.log("###########################");
      console.log(err);
      console.log(body);
      console.log("###########################");
      if (!err) body;
    });

  });
}

module.exports = MyCloudant;
