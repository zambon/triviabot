var cfenv      = require("cfenv");
var appEnv     = cfenv.getAppEnv();
var MyCloudant = require("../lib/my_cloudant");

MyCloudant = new MyCloudant(
  appEnv.getServiceCreds(/cloudant/i).username,
  appEnv.getServiceCreds(/cloudant/i).password
);

module.exports = function (robot) {

  var currentTrivia;
  var gameOn = false;
  var started = false;

  robot.respond(/h[ae]+lp/i, function (msg) {
    msg.send("halp: help");
  });

  robot.respond(/start game/i, function(msg) {
    if (started) return;

    started = true;

    gameLoop(msg);
    setInterval(function() {
      gameLoop(msg);
    }, 20000);
  });

  robot.respond(/leaderboard/i, function(msg) {
    MyCloudant.leaderboard(function(leaderboard) {
      var array = [];
      leaderboard.forEach(function(el, idx, arr) {
        array.push((idx + 1) + ") " + el.value + " " + el.key);
      });

      msg.send(array.join('\n'));
    });
  });

  robot.respond(/my score/i, function(msg) {
    MyCloudant.userScore(msg.message.user, function(response) {
      msg.send(response._id + " " + response.score);
    });
  });

  robot.hear(/.+/i, function(msg) {
    if (!gameOn || !currentTrivia) return;

    var guess = msg.message.text;
    if (guess.toLowerCase() === currentTrivia.answer.toLowerCase()) {
      var user = msg.message.user;

      gameOn = false;

      msg.send("Answer is correct! Congratulations " + user.name + ".");
      MyCloudant.userScored(user);
    }
  });

  function gameLoop(msg) {
    gameOn = true;

    MyCloudant.randomQuestion(function(trivia) {
      currentTrivia = trivia;

      msg.send("New question!");
      msg.send(currentTrivia.question);

      setTimeout(function() {
        if (gameOn) {
          msg.send("Time's up! The answer was '" + currentTrivia.answer + "'.");
          gameOn = false;
        }
      }, 10000);
    });
  }
}
