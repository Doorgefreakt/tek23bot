// npm plugins
const Discord = require('discord.js'),
        fs = require('fs'),
        xml2js = require('xml2js'),
        mysql = require('mysql');

// json files to load
const { prefix, token, channelIds }= require('./config/discord.json');
const cfg_pubhub = require('./config/pubsubhubbub.json'),
        cfg_mysql = require('./config/mysql.json');

// MySQL Initialization
let con = mysql.createConnection({
    user: cfg_mysql.user,
    password: cfg_mysql.password,
    host: cfg_mysql.host,
    port: cfg_mysql.port,
    database: cfg_mysql.database
});

// Discord Initialization
const client = new Discord.Client();
client.login(`${token}`);

client.once('ready', () => {
    console.log('Tek23 Bot has started.');
});

// PubSubHubbub Initialization
const pubSubHubbub = require("pubsubhubbub"),
    crypto = require("crypto"),
    
    pubsub = pubSubHubbub.createServer({
        callbackUrl: cfg_pubhub.callbackURL,
    }),
    
    topic = cfg_pubhub.topic,
    hub = cfg_pubhub.hub;

pubsub.listen(cfg_pubhub.port);

// PubSubHubbub functions
pubsub.on("subscribe", function(data){
    console.log("Subscribed "+ topic);
    console.log("to " + hub);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribed " + topic);
    console.log("from " + hub);
});

pubsub.on("error", function(error){
    console.log("Error");
    console.log(error);
});

pubsub.on("listen", function(){
    console.log("Server listening on port %s", cfg_pubhub.port);
    pubsub.subscribe(topic, hub);
});

pubsub.on("feed", function(data){
    const parser = new xml2js.Parser({explicitRoot: false}, {mergeAttrs: true});
    const videoChannel = client.channels.cache.get(channelIds[0].videos);
    
    parser.parseString(data.feed.toString(), function (err, result) {
        fs.writeFileSync('./log/feed/youtubeFeedData.json', JSON.stringify(result, null, 2));
    });

    if (fs.existsSync('./log/feed/youtubeFeedData.json')) {
        const youtubeFeedData = require('./log/feed/youtubeFeedData.json');
        const videoLink = youtubeFeedData['entry'][0]['link'][0]['$']['href'];
        if (youtubeDataHandler(videoLink) == true) {
            console.log("Link not found, added to database.");
            videoChannel.send(videoLink);
        } else {
            console.log("Link found in database.")
        }
    } else {
        console.log('youtubeFeedData.json not found');
    }
});

// Discord functions
client.on('message', message => {
    switch (message.content) {
                // FIX THIS, doesnt recognise prefix
        case `${prefix}exit`:
            console.log("Tek23 will now shut down");
            pubsub.unsubscribe(topic, hub);
            process.exit();
        default:
            if (message.content.startsWith(prefix)) {
                message.channel.send("That command was not recognized.")
            } else {
                break;
            }
    }    
});

// General functions
function getTime(format) {
    const lowerFormat = format.toLowerCase();
    let now = new Date();
    switch (lowerFormat) {
        case "time":
            return now.format('HH:MM:SS');
        case "date":
            return now.format('dd/mm/yyyy');
        case "datetime":
            return now.format('HH:MM - dd/mm/yyyy');
        default:
            return now.format();
    }
}

function youtubeDataHandler(link) {
    const youtubeFeedData = require('./log/feed/youtubeFeedData.json');
    const videoLink = youtubeFeedData['entry'][0]['link'][0]['$']['href'];
    const videoTitle = youtubeFeedData['entry'][0]['title'][0];
    const videoTime = youtubeFeedData['updated'][0];
    const findLinkSQL = `SELECT id FROM videologs WHERE link = '${videoLink}'`;
    const addVideoSQL = `INSERT INTO videologs (time, title, link) VALUES ('${videoTime}', '${videoTitle}', '${videoLink}')`;

    con.connect(function(err) {
        if (err) throw err;
        con.query(findLinkSQL, function (err, result, fields) {
            if (err) throw err;
            if (result.length == 0) {
                con.query(addVideoSQL, function (err, result) {
                    if (err) throw err;
                    return true;
                });
            
            } else {
                return false;
            }
        });
    });
}