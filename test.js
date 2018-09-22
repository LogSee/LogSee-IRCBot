var request = require('request');
var cheerio = require('cheerio');
var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    'Content-Type' : 'application/x-www-form-urlencoded'
 }


 var url = "https://duckduckgo.com/html?q=vim";
 
 request.post({url:url, headers: headers}, function(error, response, html){
    if (html) {
        var chero = cheerio.load(html);
        var foundResult = false; // Stops the each() loop after first result;

        chero('#links').children().each((index, result) => {
            if (result.attribs.class && !result.attribs.class.includes('--ad') && !foundResult) {

                //console.log(index, result);
                var firstlink = chero(result).find('.result__a')[0].attribs.href
                console.log(firstlink);

                foundResult = true;
            }
        })
    }

 });