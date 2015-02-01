var Cloudant = require("cloudant");

function MyCloudant(account, password) {
  this.account  = account;
  this.password = password;
  this.database = "trivias";
}

MyCloudant.prototype.randomQuestion = function(callback) {
  that = this;
  Cloudant({account: that.account, password: that.password}, function (err, cloudant) {
    if (err) {
      return console.log("Error connecting to Cloudant account %s: %s", that.account, err.message);
    }

    cloudant.db.get(that.database, function (err, body) {
      if (err) {
        return console.log("Error fetching database %s: %s", that.database, err.message);
      } else {
        randomIndex = Math.floor(Math.random() * body.doc_count);

        var trivias = cloudant.use(that.database);
        trivias.get(randomIndex, function (err, body) {
          if (err) {
            return console.log("Error fetching trivia with id %s: %s", randomIndex, err.message);
          } else {
            callback(body);
          }
        });
      }
    });
  });
}

module.exports = MyCloudant;
