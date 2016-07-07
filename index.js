var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
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
					sendCampaignsMessage(senderID);
					break;

				case 'yes_survey':
					sendSurveyMessage(senderID);
					break;

				case 'simple_farewell':
					sendFarewellMessage(senderID);
					break;

				case 'thanks_farewell':
					sendThanksMessage(senderID);
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
					text: "Hola hola, apuesto a que estas interesado en nuestras promociones de este mes?",
					buttons:[{
						type: "postback",
						title: "Porsupuesto :)",
						payload: "yes_interested"
					},{
						type: "postback",
						title: "mmm... ahora no",
						payload: "simple_farewell"
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
function sendCampaignsMessage(recipientId) {
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
							title: "Blefaroplastia",
							subtitle: "Por tan sólo $1'780.000",
							item_url: "http://promocion.clinicaloyola.com.co/blefaroplastia",               
							image_url: "https://s3-sa-east-1.amazonaws.com/cannedhead.clinicaloyola/landing/junio/blefaro_mobile_junio.jpg",
							buttons: [
								{
									type: "web_url",
									url: "http://promocion.clinicaloyola.com.co/blefaroplastia",
									title: "Obtener Valoración"
								},{
									type: "postback",
									title: "Chevere, que más?",
									payload: "yes_survey",
								},{
									type: "postback",
									title: "Gracias, chao",
									payload: "simple_farewell",
								}
							],
						}, 
						{
							title: "Abdominoplastia",
							subtitle: "¿Ya estás lista para estas vacaciones?",
							item_url: "http://promocion.clinicaloyola.com/abdominoplastia",               
							image_url: "https://s3-sa-east-1.amazonaws.com/cannedhead.clinicaloyola/landing/junio/abdo_mobile_junio.jpg",
							buttons: [
								{
									type: "web_url",
									url: "http://promocion.clinicaloyola.com/abdominoplastia",
									title: "Obtener Valoración"
								},{
									type: "postback",
									title: "Chevere, que más?",
									payload: "yes_survey",
								},{
									type: "postback",
									title: "Gracias, chao",
									payload: "simple_farewell",
								}
							]
						},
						{
							title: "Implantes Dentales",
							subtitle: "Desde $990.000, Incluye provisional y aditamientos",
							item_url: "http://promocion.clinicaloyola.com/implantesdentales",               
							image_url: "https://s3-sa-east-1.amazonaws.com/cannedhead.clinicaloyola/landing/junio/implantes_miniatura.jpg",
							buttons: [
								{
									type: "web_url",
									url: "http://promocion.clinicaloyola.com/implantesdentales",
									title: "Obtener Valoración"
								},{
									type: "postback",
									title: "Chevere, que más?",
									payload: "yes_survey",
								},{
									type: "postback",
									title: "Gracias, chao",
									payload: "simple_farewell",
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
 * Send survey message using the Send API.
 *
 */
function sendSurveyMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "ehh... sólo me queda preguntarte, ¿que tipo de contenido preferirias ver en la página de Clinica Loyola?",
          buttons:[
            {
              type: "postback",
              title: "Tips de Belleza",
              payload: "thanks_farewell"
            },{
              type: "postback",
              title: "Tips Post-operatorio",
              payload: "thanks_farewell"
            },{
              type: "postback",
              title: "Dietas",
              payload: "thanks_farewell"
            }
          ]
        } // close payload
      } // close attachment
    } // close message
  };  

  callSendAPI(messageData);
}

/*
 * Send a thankfull farewell message using the Send API.
 *
 */
function sendThanksMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'Lo tendremos en cuenta, gracias por tu tiempo y atención :). Recuerda, si deseas ser contactado por un agente puedes inscribir tus datos en una de nuestras promociones.'
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a simple farewell message using the Send API.
 *
 */
function sendFarewellMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'Estamos para servirte, gracias por tu tiempo y atención :). Recuerda, si deseas ser contactado por un agente puedes inscribir tus datos en una de nuestras promociones.'
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