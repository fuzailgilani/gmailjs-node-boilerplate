"use strict";

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
function getTrackingGIF(account, eventDetails) {

  var imgURL = "https://ssl.google-analytics.com/collect?"
    + "v=1"
    + "&tid=" + account
    + "&cid=" + guid()
    + "&t=event"
    + "&ec=email"
    + "&ea=open"
    + "&el=" + encodeURIComponent(eventDetails);

  return "<img src='" + imgURL + "' width='1' height='1'/>";

}

console.log("Extension loading...");
const jQuery = require("jquery");
const $ = jQuery;
const GmailFactory = require("gmail-js");
const gmail = new GmailFactory.Gmail($);
window.gmail = gmail;

gmail.observe.on("load", () => {
    const userEmail = gmail.get.user_email();
    console.log("Hello, " + userEmail + ". This is your extension talking!");
    let list = gmail.get.visible_emails();
    console.log(list.length);
    console.log(getTrackingGIF("UA-118160763-1","test"));

    gmail.observe.before('send_message', function(url, body, data, xhr){
      var body_params = xhr.xhrParams.body_params;

      //construct event label for Google Analytics event
      let timeSent = new Date().toDateString();
      let eventDetails = "Sent by: " + gmail.get.user_email() + "Subject: " + body_params.subject + " Time sent: " + timeSent + " Email recipients: " + body_params.to;
      console.log(eventDetails);

      //create HTML for tracking GIF to be appended to email body
      let gifHTML = getTrackingGIF("UA-118160763-1", eventDetails);
      console.log(gifHTML);

      //append tracking GIF to email before sending
      body_params.body += gifHTML;
      console.log("sending message, url:", url, 'body', body, 'email_data', data, 'xhr', xhr);
    });
});
