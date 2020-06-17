const config = require('./config.json');
const secret = require("./client_secret.json");
const Discord = require('discord.js');
const client = new Discord.Client();
const youtubeURL = ""

let pubSubHubbub = require("pubsubhubbub"),
    crypto = require("crypto"),
    
    pubsub = pubSubHubbub.createServer({
        callbackUrl: "http://doorgefreakt.cc:28547",
    }),
    
    topic = "https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC1ZOfRNdrM7T7UEFxNe8Rhg",
    hub = "http://pubsubhubbub.appspot.com/";

pubsub.listen(28547);

pubsub.on("subscribe", function(data){
    console.log("Subscribe");
    console.log(data);

    console.log("Subscribed "+topic);
    console.log("to " + hub);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribed "+topic);
    console.log("from " + hub);
});

pubsub.on("error", function(error){
    console.log("Error");
    console.log(error);
});

pubsub.on("feed", function(data){
    console.log(data)
    console.log(data.feed.toString());

    pubsub.unsubscribe(topic, hub);
});

pubsub.on("listen", function(){
    console.log("Server listening on port %s", pubsub.port);
    pubsub.subscribe(topic, hub);
});

client.once('ready', () => {
    console.log('Tek23 Bot has started.');
});

client.login(config.token);

client.on('message', message => {
    if (message.content === '!unsub') {
        pubSubSubscriber.unsubscribe(topic, hub, callback);
    };
});
