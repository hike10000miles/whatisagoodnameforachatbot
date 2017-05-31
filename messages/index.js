/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);

intents.matches('hello', function(session) {
    session.send('I am here to help you out!');
});

intents.matches('find_city', [
    function(session, args, next) {
        //var country = session.dialogData.country = builder.EntityRecognizer.findEntity(args.entities, 'country').entity;
        var country = builder.EntityRecognizer.findEntity(args.entities, 'country').entity;
        //if(!session.dialogData.country) {
        if(country) {
            builder.Prompts.text(session, "Beautiful country to go, which cities are you thinking?");
        } else {
            next();
        }

        //builder.Prompts.text(session, "Beautiful country to go, which cities are you thinking?");
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.country = reslts.response;
        }
        session.send('Finding flights to ' + results.response);
        session.send("20 flight find!");
    }
]);

intents.matches('find_flight', function(session) {
    //var destination = session.dialogData.destination = builder.EntityRecognizer.findEntity(args.entities, 'destination').entity;
    session.send('finding flight to where ever you want!'); 
});

/*intents.matches('find_city', function(session) {
   session.send('Here are the hotest destination this year: Paris, London, Toronto.'); 
});*/

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

