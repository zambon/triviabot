var Cloudant = require("cloudant");

function MyCloudant(account, password) {
  this.account   = account;
  this.password  = password;
  this.triviasDb = "trivias";
  this.usersDb   = "users";
}

MyCloudant.prototype.randomQuestion = function(callback) {
  that = this;
  Cloudant({account: that.account, password: that.password}, function (err, cloudant) {
    if (err) {
      return console.log("Error connecting to Cloudant account %s: %s", that.account, err.message);
    }

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

MyCloudant.prototype.leaderboard = function(callback) {
  that = this;
  Cloudant({account: that.account, password: that.password}, function (err, cloudant) {
    if (err) {
      return console.log("Error connecting to Cloudant account %s: %s", that.account, err.message);
    }

    var users = cloudant.use(that.usersDb);
    users.view("leaderboard", "top", { limit: 10, descending: true }, function(err, body) {
      if (err) {
        return console.log("Error fetching leaderboard: %s", err.message);
      } else {
        callback(body.rows);
      }
    });
  });
}

MyCloudant.prototype.userScore = function(user, callback) {
  that = this;
  Cloudant({account: that.account, password: that.password}, function (err, cloudant) {
    if (err) {
      return console.log("Error connecting to Cloudant account %s: %s", that.account, err.message);
    }

    var users = cloudant.use(that.usersDb);
    users.get(user.name, function(err, body) {
      if (err) {
        if (err.status_code === 404) {
          callback({_id: user.name, score: 0});
        } else {
          return console.log("Error fetching user score: %s", err.message);
        }
      } else {
        callback(body);
      }
    });
  });
}

module.exports = MyCloudant;
