// npm plugins
const Discord = require('discord.js'),
        fs = require('fs'),
        xml2js = require('xml2js');

// json files to load
const cfg_discord = require('./config/discord.json'),
        cfg_pubsub = require('./config/pubsubhubbub.json'),
        videolog = require('./videolog.json');

// Discord Initialization
const client = new Discord.Client();
client.login(cfg_discord.token);

client.once('ready', () => {
    console.log('Tek23 Bot has started.');
});

// PubSubHubbub Initialization
const pubSubHubbub = require("pubsubhubbub"),
    crypto = require("crypto"),
    
    pubsub = pubSubHubbub.createServer({
        callbackUrl: cfg_pubsub.callbackURL,
    }),
    
    topic = cfg_pubsub.topic,
    hub = cfg_pubsub.hub;

pubsub.listen(cfg_pubsub.port);

// PubSubHubbub functions
pubsub.on("subscribe", function(data){
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

pubsub.on("listen", function(){
    console.log("Server listening on port %s", pubsub.port);
    pubsub.subscribe(topic, hub);
});

pubsub.on("feed", function(data){
    const parser = new xml2js.Parser({explicitRoot: false}, {mergeAttrs: true});

    const videoChannel = client.channels.cache.get(channelIdArray.videos);

    console.log("feed incoming.");
    
    parser.parseString(data.feed.toString(), function (err, result) {
        fs.writeFileSync('youtubeFeedData.json', JSON.stringify(result, null, 2));
    });

    if (fs.existsSync('./youtubeFeedData.json')) {
        const youtubeFeedData = require('./youtubeFeedData.json');
        let videoLink = youtubeFeedData['entry'][0]['link'][0]['$']['href'];

        videolog.log.forEach(element => {
            let compare = element.localeCompare(videoLink);
            if (compare = 0) {
                console.log('video is already in the log.')
                return;
            } else {
                videolog.log.push(videoLink);
                videoChannel.send(videoLink);
                console.log('video added to log.');
            }
        });
        pubsub.unsubscribe(topic, hub);

    } else {
        console.log('youtubeFeedData.json not found');
    }
});

// Discord functions
client.on('message', message => {
    switch (message) {
        case cfg_discord.prefix + 'exit':
            pubsub.unsubscribe(topic, hub);
            process.exit();
        default:
            if (message.content.startsWith(cfg_discord.prefix)) {
                message.channel.send("That command was not recognized.")
            } else {
                break;
            }
    }    
});
