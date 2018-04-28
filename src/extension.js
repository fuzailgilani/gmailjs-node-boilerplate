"use strict";

// guid()
// randomly generates pseudo-GUID for use in Google Analytics event
//
// input: N/A
// output: String containing randomly generated GUID
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// swapHyperLinks()
// parses through HTML string passed through parameter to find href elements and swap hyperlinks to go through proxy.playposit.com
//
// input: html - string containing HTML to be parsed
// output: String containing modified HTML from parameter
function swapHyperLinks(html) {

  //regex object to be used for non-SSL hyperlinks
  var regex = /href\s*=\s*(['"])(http:\/\/)(.+?)\1/ig;

  //regex object to be used for SSL hyperlinks
  var regexSSL = /href\s*=\s*(['"])(https:\/\/)(.+?)\1/ig;
  var link;


  //it is important that the SSL hyperlinks are replaced first
  //non-SSL hyperlinks will be replaced with an SSL hyperlink to playposit
  //if non-SSL are replaced first, then the SSL regex will replace the modified non-SSL links as well
  while((link = regexSSL.exec(html)) !== null) {
    console.log(link);
    html = html.replace(link[3], "https://proxy.playposit.com/ssl/" + encodeURIComponent(link[3]));
  }
  while((link = regex.exec(html)) !== null) {
    console.log(link);
    html = html.replace(link[3], "https://proxy.playposit.com/http/" + encodeURIComponent(link[3]));
  }

  return html;
}

// getTrackingGIF()
// uses info passed through parameters to construct a 1x1 pixel to be appended onto an email for tracking email opens
//
// input: trackerID - Google Analytics tracker ID
//        eventDetails - event label for GA event, should contain details about sender, recipients, subject, and date sent
// output: HTML defining image element containing tracking GIF for Google Analytics
function getTrackingGIF(trackerID, eventDetails) {

  var imgURL = "https://ssl.google-analytics.com/collect?"
    + "v=1"
    + "&tid=" + trackerID
    + "&cid=" + guid()
    + "&t=event"
    + "&ec=email"
    + "&ea=open"
    + "&el=" + encodeURIComponent(eventDetails);

  return "<img src='" + imgURL + "' width='1' height='1'/>";

}

//set up extension, load required packages
console.log("Extension loading...");
const jQuery = require("jquery");
const $ = jQuery;
const GmailFactory = require("gmail-js");
const gmail = new GmailFactory.Gmail($);
window.gmail = gmail;

//wait for full Gmail interface to load before running extension
gmail.observe.on("load", () => {

    const userEmail = gmail.get.user_email();

    //when user presses send message button, parse and modify email to add tracking gif and replace hyperlinks
    gmail.observe.before('send_message', function(url, body, data, xhr){
      //collect email body data from XHR
      var body_params = xhr.xhrParams.body_params;

      //construct event label for Google Analytics event
      let timeSent = new Date().toDateString();
      let eventDetails = "Sent by: " + userEmail + "Subject: " + body_params.subject + " Time sent: " + timeSent + " Email recipients: " + body_params.to;

      //create HTML for tracking GIF to be appended to email body
      let gifHTML = getTrackingGIF("UA-118160763-1", eventDetails);

      //replace hyperlinks with proxy.playposit.com redirects
      body_params.body = swapHyperLinks(body_params.body);

      //append tracking GIF to email before sending
      body_params.body += gifHTML;
    });
});
