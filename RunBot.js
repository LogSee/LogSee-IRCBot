var ircClient = require('.client.js');
var path = require('path');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json'), 'utf8'));

var server = config.IRC.Server;
var port = config.IRC.Port;
var myNick = config.IRC.BotName;
var fullname = config.IRC.RealName;
var chan = config.IRC.Channel;
var greetmsg = config.IRC.GreetMsg;
var trigger = config.IRC.TriggerChar;

var client = new ircClient(server, port, myNick, fullname);
client.verbosity = 2;
client.debug = false;

client.on('ready', function () {
    client.join(chan);
    client.say(chan, greetmsg)
});

// Handy to see if the config options have been read correctly.
console.log("Connecting to: " + server);
console.log("On port: " + port);
console.log("As Nick: " + myNick);
console.log("My real name is: " + fullname);
console.log("I'm lurking in: " + chan);
console.log("I will be triggered when " + trigger + "Is on the front of the message in the channel");

client.on('PRIVMSG', function (data) {
    var message = 'Oh, ' + data.sender +'you tried to message me, well... I am afraid to say that I am a bot, not a sentient being. So I am just gonna do a typical bot thing and send you your message back. Here it is : ' + data.message;
    if(data.sender !== myNick) client.say(data.sender, message);
  });

client.on('KICK', function (data) {
    var privMessage = 'Im sory but you seem to be some kind of an douche, ' + data.message[0] + ', or else you wouldnt have been kicked by ' + data.sender + ' on ' + data.receiver + ' because of ' + data.message[1];
    var chanMessage = 'Sorry guys, but ' + data.message[0] + ' had to go!';
    client.say(data.message[0], privMessage);
    client.say(data.receiver, chanMessage);
});

client.on('INVITE', function (data) {
    var message = 'Thank you for your invite to ' + data.message + ', ' + data.sender + 'However my home is #Logsee, so I will stick there. Maybe try getting your own bot?';
    client.say(data.message, message);
  });

client.on('CHANMSG', function (data) {
    if (data.message.match(trigger+'ping')) {
        client.say(chan, 'pong')
    }
});

// Connect to irc
  client.connect();
