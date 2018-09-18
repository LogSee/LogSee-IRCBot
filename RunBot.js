var ircClient = require('node-irc');
var path = require('path');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json'), 'utf8'));

var server = config.IRC.Server;
var port = config.IRC.Port;
var myNick = config.IRC.BotName;
var fullname = config.IRC.RealName;
var chan = config.IRC.Channel;
var greetmsg = config.IRC.GreetMsg;

var client = new ircClient(server, port, myNick, fullname);
client.verbosity = 2;
client.debug = false;

client.on('ready', function () {
    client.join(chan);
    client.say(chan, greetmsg)
});

console.log("Connecting to: " + server);
console.log("On port: " + port);
console.log("As Nick: " + myNick);
console.log("My real name is: " + fullname);
console.log("I'm lurking in: " + chan);

client.on('PRIVMSG', function (data) {
    var message = 'Hi, ' + data.sender +', nice of you to speak to a bot. I can only repeat what you said: ' + data.message;
    if(data.sender !== myNick) client.say(data.sender, message);
  });

client.connect();
