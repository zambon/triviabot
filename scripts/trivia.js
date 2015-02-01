var cfenv    = require("cfenv");

var appEnv = cfenv.getAppEnv();

console.log("*!&@#^(&!@^#&*!@^#(*&!^(*#&!^@");
console.log(appEnv.getServiceCreds(/cloudant/i).username);
console.log(appEnv.getServiceCreds(/cloudant/i).password);

var MyCloudant = require("../lib/my_cloudant")(
  appEnv.getServiceCreds(/cloudant/i).username,
  appEnv.getServiceCreds(/cloudant/i).password
);

module.exports = function (robot) {

  currentTrivia = {};
  gameOn = false;

  questions = [
    {
      question: "Quem matou Mufasa?",
      answer: "Skar"
    },
    {
      question: "Quem sou eu?",
      answer: "Silvio Santos"
    }
  ];

  robot.respond(/h[ae]+lp/i, function (msg) {
    msg.send("halp: help");
  });

  robot.respond(/start game/i, function(msg) {
    gameLoop(msg);
    setInterval(function() {
      gameLoop(msg);
    }, 20000);
  });

  robot.hear(/.+/i, function(msg) {
    if (!gameOn) return;

    var guess = msg.message.text;
    if (guess.toLowerCase() === currentTrivia.answer.toLowerCase()) {
      var user = msg.message.user;

      gameOn = false;

      msg.send("Answer is correct! Congratulations " + user.name + ".");
    }
  });

  function gameLoop(msg) {
    gameOn = true;

    currentTrivia = MyCloudant.randomQuestion();

    msg.send("New question!");
    msg.send(currentTrivia.question);

    setTimeout(function() {
      if (gameOn) {
        msg.send("Time's up! The answer was " + currentTrivia.answer + ".");
        gameOn = false;
      }
    }, 10000);
  }
}
