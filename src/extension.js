"use strict";

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

function getTrackingGIF(account, email, subject) {

  var imgURL = "https://www.google-analytics.com/collect?"
    + "v=1&t=event"
    + "&tid=" + account
    + "&z="   + Math.round((new Date()).getTime()/1000).toString()
    + "&cid=" + guid()
    + "&ec=email"
    + "&ea=open"
    + "&el=" + encodeURIComponent("sent to: " + email + "; subject: " + subject);

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
});
