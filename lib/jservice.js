var request = require("request");

function jService() { }

jService.prototype.randomQuestion = function(callback) {
  request("http://jservice.io/api/random", function(err, res, body) {
    if(err) {
      return console.log("Error fetching question from jService.io");
    } else {
      callback(JSON.parse(body)[0]);
    }
  });
}

module.exports = jService;
