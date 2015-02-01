var Cloudant = require("cloudant");

function MyCloudant(account, password) {
  this.account   = account;
  this.password  = password;
  this.triviasDb = "trivias";
  this.usersDb   = "users";
}

MyCloudant.prototype._connect = function(callback) {
  that = this;
  Cloudant({ account: that.account, password: that.password }, function (err, cloudant) {
    if (err) {
      console.log("Error connecting to Cloudant account %s: %s", that.account, err.message);
    } else {
      callback(that, cloudant);
    }
  });
}

MyCloudant.prototype.randomQuestion = function(callback) {
  this._connect(function (that, cloudant) {
    cloudant.db.get(that.triviasDb, function (err, body) {
      if (err) {
        return console.log("Error fetching database %s: %s", that.triviasDb, err.message);
      } else {
        randomIndex = Math.floor(Math.random() * body.doc_count);

        var trivias = cloudant.use(that.triviasDb);
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

MyCloudant.prototype.userScored = function(user) {
  this._connect(function (that, cloudant) {
    var users = cloudant.use(that.usersDb);
    users.get(user.name, function (err, body) {
      if (err && err.status_code == 404) {
        users.insert({ score: 1 }, user.name);
      } else if (err) {
        console.log("Error fetching user %s: %s", user.name, err.message);
      } else {
        body.score += 1;
        users.insert(body, user.name);
      }
    });
  });
}

module.exports = MyCloudant;
