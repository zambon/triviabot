var cfenv = require("cfenv");
var S     = require("string");

var MyCloudant = require("../lib/my_cloudant");
var jService   = require("../lib/jservice");
var phrases    = require("../lib/talkshow_catch_phrases_generator");

var appEnv     = cfenv.getAppEnv();

MyCloudant = new MyCloudant(
  appEnv.getServiceCreds(/cloudant/i).username,
  appEnv.getServiceCreds(/cloudant/i).password
);

jService = new jService();

module.exports = function (robot) {

  var currentTrivia;
  var gameOn = false;
  var started = false;
  var changeQuestionTimer;
  var answerTimer;

  robot.respond(/h[ae]+lp/i, function (msg) {
    msg.send("halp:        help");
    msg.send("leaderboard: Show top ten players");
    msg.send("my score:    Show your current score");
  });

  robot.respond(/start game/i, function(msg) {
    if (started) return;
    started = true;
    startGame(msg);
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
      msg.send("@" + response._id + " " + response.score);
    });
  });

  robot.hear(/.+/i, function(msg) {
    if (!gameOn || !currentTrivia) return;

    var guess = msg.message.text;
    if (guess.toLowerCase() === currentTrivia.answer.toLowerCase()) {
      var user = msg.message.user;

      gameOn = false;

      msg.send("_" + msg.random(phrases.goodJob("*@"+user.name+"*")) + "_");
      MyCloudant.userScored(user);

      setTimeout(function() {
        clearInterval(changeQuestionTimer);
        clearTimeout(answerTimer);
        startGame(msg);
      }, 5000);
    }
  });

  function startGame(msg) {
    gameLoop(msg);
    changeQuestionTimer = setInterval(function() {
      gameLoop(msg);
    }, 60000);
  }

  function gameLoop(msg) {
    gameOn = true;

    jService.randomQuestion(function(trivia) {
      currentTrivia = trivia;

      msg.send("_" + msg.random(phrases.getReady()) + "_");
      msg.send("[" + currentTrivia.category.title + "] *" + S(currentTrivia.question).stripTags().s + "*");

      answerTimer = setTimeout(function() {
        if (gameOn) {
          msg.send("_*Time's up!* The answer was *" + S(currentTrivia.answer).stripTags().s + "*._");
          gameOn = false;
        }
      }, 50000);
    });
  }
}
