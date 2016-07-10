var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var request = require('nodemon');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// Server frontpage
app.get('/', function (req, res) {
	res.render('index.html');
});
app.get('/cases', function (req, res) {
	res.render('cases.html');
});
// Facebook Webhook
app.get('/webhook', function (req, res) {
	if (req.query['hub.verify_token'] === 'testbot_verify_token') {
			res.send(req.query['hub.challenge']);
	} else {
			res.send('Invalid verify token');
	}
});

// handler receiving messages
app.post('/webhook', function (req, res) {
	var events = req.body.entry[0].messaging;
	for (i = 0; i < events.length; i++) {
		var event = events[i];
		if (event.message && event.message.text) {
				sendInitialMessage(event.sender.id);

		} else if (event.postback) {
				receivedPostback(event);

		}
	}
	res.sendStatus(200);
});

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#received_message
 * 
 */
function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", 
		senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var messageId = message.mid;

	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;

	if (messageText) {

		// If we receive a text message, check to see if it matches any special
		// keywords and send back the corresponding example. Otherwise, just initial default message.
		switch (messageText) {
			case 'keyword_1':
				sendInitialMessage(senderID);
				break;
			
			case 'keyword_2':
				sendInitialMessage(senderID);
				break;

			default:
				sendInitialMessage(senderID);
		}
	} else if (messageAttachments) {
		sendTextMessage(senderID, "Message with attachment received");
	}
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. Read
 * more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#postback
 * 
 */
function receivedPostback(event) {
		var senderID = event.sender.id;
		var recipientID = event.recipient.id;
		var timeOfPostback = event.timestamp;

		// The 'payload' param is a developer-defined field which is set in a postback 
		// button for Structured Messages. 
		var payload = event.postback.payload;
		
		if (payload) {
			// If we receive a payload, check to see if it matches any special
			// keywords and send back the corresponding example. Otherwise, just echo
			// the text we received.
			switch (payload){
				case 'yes_interested':
					sendProductsMessage(senderID);
					break;

				case 'read_basic':
					sendBasicTierMessage(senderID);
					break;

				case 'read_plus':
					sendPlusTierMessage(senderID);
					break;

				case 'read_nlp':
					sendNaturalTierMessage(senderID);
					break;

				case 'farewell':
					sendFarewellMessage(senderID);
					break;

				default:
					sendTextMessage(senderID, payload);
			}
		}
}

/*
 * Send initial message using the Send API.
 *
 */
function sendInitialMessage(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "button",
					text: "Hi, my name is Susana and Iam your automated assistant. Im guessing you are interested in our products. Is that right?",
					buttons:[{
						type: "postback",
						title: "Sure :)",
						payload: "yes_interested"
					},{
						type: "postback",
						title: "mmm... not now",
						payload: "farewell"
					}]
				}
			}
		}
	};  

	callSendAPI(messageData);
}

/*
 * Send a Structured Message with Campaigns landings using the Send API.
 *
 */
function sendProductsMessage(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "Basic Tier",
							subtitle: "Scripted generic chatBot",
							item_url: "http://promocion.clinicaloyola.com.co/blefaroplastia",               
							image_url: "https://s3-sa-east-1.amazonaws.com/cannedhead.clinicaloyola/landing/junio/blefaro_mobile_junio.jpg",
							buttons: [
								{
									type: "web_url",
									url: "http://promocion.clinicaloyola.com.co/blefaroplastia",
									title: "View on Web"
								},{
									type: "postback",
									title: "Read Here",
									payload: "read_basic",
								}
							],
						}, 
						{
							title: "Plus Tier",
							subtitle: "Custom designed scripted chatbot",
							item_url: "http://promocion.clinicaloyola.com/abdominoplastia",               
							image_url: "https://s3-sa-east-1.amazonaws.com/cannedhead.clinicaloyola/landing/junio/abdo_mobile_junio.jpg",
							buttons: [
								{
									type: "web_url",
									url: "http://promocion.clinicaloyola.com/abdominoplastia",
									title: "View on Web"
								},{
									type: "postback",
									title: "Read Here",
									payload: "read_plus",
								}
							]
						},
						{
							title: "NLP Tier",
							subtitle: "Natural Language Processing chatbot",
							item_url: "http://promocion.clinicaloyola.com/implantesdentales",               
							image_url: "https://s3-sa-east-1.amazonaws.com/cannedhead.clinicaloyola/landing/junio/implantes_miniatura.jpg",
							buttons: [
								{
									type: "web_url",
									url: "http://promocion.clinicaloyola.com/implantesdentales",
									title: "View on Web"
								},{
									type: "postback",
									title: "Read Here",
									payload: "read_nlp",
								}
							]
						}
					] // close elements
				} // close payload
			} // close attachment
		} // close message
	};  

	callSendAPI(messageData);
}

/*
 * Send a farewell message using the Send API.
 *
 */
function sendFarewellMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'Thanks for your attention :). Bye!'
    }
  };

  callSendAPI(messageData);
}

/*
 * Send basic plan message using the Send API.
 *
 */
function sendBasicTierMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'The Basic Tier consist of a generic scripted bot. Much like this one, to generate leads and/or introduce your products to your facebook followers.'
    }
  };

  callSendAPI(messageData);
}

/*
 * Send plus plan message using the Send API.
 *
 */
function sendPlusTierMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'The Plus Tier offers an scripted bot. The difference though, is that in this case the script is customized to your needs and requirements.'
    }
  };

  callSendAPI(messageData);
}

/*
 * Send natural plan message using the Send API.
 *
 */
function sendNaturalTierMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'The NLP Tier is to some extend also an scripted bot. The difference relies on the fact that this kind of bot can understand commands that exhibit natural language features, and is not bounded to exact commands and/or buttons.'
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen((process.env.PORT || 3000));