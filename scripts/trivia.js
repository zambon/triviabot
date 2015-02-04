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

module.exports = function(robot) {
  var started = false;
  var gameOn  = false;

  var currentTrivia;
  var changeQuestionTimer;
  var answerTimer;

  //
  // Commands
  //
  robot.respond(/h[ae]+lp/i, function(msg) {
    msg.send("*halp*: This help menu");
    msg.send("*start game*: Start a new trivia game");
    msg.send("*stop game*: Stop the current trivia game");
    msg.send("*leaderboard*: Show top ten players");
    msg.send("*my score*: Show your current score");
  });

  robot.respond(/start game/i, function(msg) {
    if (started) return;
    started = true;
    startGame(msg);
  });

  robot.respond(/stop game/i, function(msg) {
    if (!started) return;

    msg.send("Game over! Use the *start game* command to start a new one!");

    started       = false;
    gameOn        = false;
    currentTrivia = null;

    clearInterval(changeQuestionTimer);
    clearTimeout(answerTimer);
  });

  robot.respond(/leaderboard/i, function(msg) {
    MyCloudant.leaderboard(function(leaderboard) {

      var array = [];
      leaderboard.forEach(function(el, idx, arr) {
        array.push((idx + 1) + ") " + el.value + " " + el.key);
      });

      msg.send(array.join("\n"));
    });
  });

  robot.respond(/my score/i, function(msg) {
    MyCloudant.userScore(msg.message.user, function(response) {
      msg.send("@" + response._id + " " + response.score);
    });
  });

  //
  // Answers
  //
  robot.hear(/.+/i, function(msg) {
    if (!gameOn || !currentTrivia) return;

    var guess = msg.message.text;
    if (guess.toLowerCase() === S(currentTrivia.answer).stripTags().s.toLowerCase()) {
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

  //
  // Game loop
  //
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
