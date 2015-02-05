exports.goodJob = function(name) {
  return [
    "The answer is correct! Congratulations " + name + "!",
    "Yaaaaaay! Good job " + name + "!",
    "That's it " + name + "! You're right!",
    "Way to go " + name + "!!",
    name + " nailed it!!",
    "Ceeeeerta resposta, " + name + "!"
  ];
};

exports.closeEnough = function(name) {
  return [
    "Close enough " + name + "...",
    "Well... I guess I'll take that " + name + ".",
    "Not quite " + name + ", but that's OK."
  ];
};

exports.getReady = function() {
  return [
    "New question ahead!",
    "Get ready!",
    "Here comes another one!",
    "Mah oeeee.... Próxima pergunta!",
    "3... 2... 1... GO!"
  ];
};
