/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
const cheerio = require('cheerio');

var offerURL = '';
var self;
var brandNameGlobal = '';

const APP_ID = 'amzn1.ask.skill.45dcef6c-14ab-4c55-b62c-ac69260ed4d1';

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var getCallbackResult = function() {
    var offers = '';
    var offersArr = [];
    request(offerURL, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                var offersArr = [];
                $('.name').each(function( i , element) {
                    var a = $(this);
                    offersArr.push(a.text().trim());
                });

                var offset = 0;
                if (offersArr.length > 0) {
                    offers = 'Current offers are ' + ' <break time="1s"/> ';
                    
                    for(var i = 0; i < offersArr.length; i++) {
                        if (offersArr[i].includes(".com") || offersArr[i].includes("eBay")) {
                            offset++;
                            continue;
                        }
                        if(i == 5 + offset)
                            break;

                        var temp = offersArr[i].replace(/[\[\]&]+/g, '');
                        temp = temp.toLowerCase();
                        temp = replaceAll(temp, brandNameGlobal, "requested brand's");

                        offers += temp + ' <break time="0.4s"/> ';
                    }
                } else {
                    offers += 'Sorry, I do not have any deals for the brand you requested';
                }
            } else {
                offers = 'Sorry there was an error retrieving offers';
            }

            self.emit(':tell', offers);
        }
    )
}

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetHints');
    },
    'GetHints': function () {
        const speechOutput = "Welcome to deal sniper. I can help you find coupons, offers or deals. Now, go ahead ask me for deals.";
        // Create speech output
        this.emit(':ask', speechOutput);
    },
    'discountOrOffersInfo': function () {
        var url = 'https://www.offers.com/';
        var brandName = this.event.request.intent.slots.BRAND_NAME.value;
        var offers = '';
        self = this;
        
        if(brandName === undefined) {
            offers += 'Sorry, I do not have any deals for the brand you requested';
            self.emit(':tell', offers);
        } else {
            brandName = brandName.toLowerCase();
            brandNameGlobal = brandName;
            brandName = brandName.replace(/\s/g,'')
            brandName = brandName.replace(/[.,\/#!$%\^&\*;:{}=\-_`~'()]/g,"");

            console.log("brandName is " + brandName);

            url += brandName + '/';

            offerURL = url;

            console.log('Getting callback result');
            getCallbackResult((data) => {
                console.log('Data is ' + data);
            });
        }
    }
};



exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
