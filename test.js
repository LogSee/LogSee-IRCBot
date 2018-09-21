var request = require('request');
var cheerio = require('cheerio');
var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
    'Content-Type' : 'application/x-www-form-urlencoded'
 }
 
 var url = "https://duckduckgo.com/?q=vim" ;
 
 request({url:url, headers: headers}, function(error, response, html){
    if (!error) {
        //console.log(html);
        var $ = cheerio.load(html);
        $('#href').text();
        console.log($);
    }

 });