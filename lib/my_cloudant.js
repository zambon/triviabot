var Cloudant = require("cloudant");

function MyCloudant(account, password) {
  this.account  = account;
  this.password = password;
  this.usersDb  = "users";
}

MyCloudant.prototype._connect = function(callback) {
  that = this;
  Cloudant({ account: that.account, password: that.password }, function (err, cloudant) {
    if (err) {
      return console.log("Error connecting to Cloudant account %s: %s", that.account, err.message);
    } else {
      callback(that, cloudant);
    }
  });
}

MyCloudant.prototype.leaderboard = function(callback) {
  this._connect(function (that, cloudant) {
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
  this._connect(function (that, cloudant) {
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
