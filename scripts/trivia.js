module.exports = function (robot) {
  robot.respond(/h[ae]lp/i, function (msg) {
    msg.send("halp: help");
  });
}
