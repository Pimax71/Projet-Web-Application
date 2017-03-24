//Include des modules utiles
var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var https = require('https');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var index = require('./routes/index');
var users = require('./routes/users');
var bodyParser = require('body-parser');

//Afin d'utiliser le body parser
app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

//Utilisation du repertoire views ou sont stockés les fichiers .ejs
app.use("/views", express.static( __dirname + '/views'));
//FOR CSS 
app.use(express.static( __dirname + '/public'));

console.log("Hi ! Go on http://localhost:8000/ to continue");
//Global variable
var info = [];
var info2 = [];
var info3 = [];
var a = "";
var b = "";
var c = "";
var url="";
//Ecoute du port 8000 de localhost
app.listen(8000);
//All console log are for test
//Get the page
  app.get('/', function(request,response)
  {
    response.render("index.ejs");
  });

//Post the data if url is right
  app.post('/', function(sReq, sRes)
  {    
    Nom_carte = sReq.body.testurl;   
    console.log(Nom_carte); 
    url = 'http://www.otk-expert.fr/yugioh/cartes/'+Nom_carte;
    if(url!="")
    {
      http.get(url, function(res) 
      {
   	    res.setEncoding('utf8');
   	    res.on('data', 
   		  function(data) 
   		   {
   				 info.push(data);
   		   });

	      res.on('error', console.error);
        res.on('end', function() 
        {
    	   a=info.join('');
        
          var regex = new RegExp (/FR_title((?:.|\n)*?)\"/);
          var nomimage = a.match(regex); 
          Result = nomimage[1].replace(/%20/g, ' ');
          console.log(Result);
          yugioh.Id=Result;

		      console.log(yugioh.Id);

			    var url_card_hunter="http://www.card-hunter.fr/class-hunter/api/hunter_info.php?game=1&mode=5&id="+yugioh.Id;
          
          console.log(url_card_hunter);
          http.get(url_card_hunter, function(res2) 
          {
            res2.setEncoding('utf8');
            res2.on('data', function(data) 
            {
              info2.push(data);
            });
           res2.on('error', console.error);
           res2.on('end', function() 
            {
              b=info2.join('');
        
             //EXTRACTION Price by best agent
             var regex = new RegExp (/<td class=\"center\" nowrap>((?:.|\n)*?)€<\/td><td class=\"center\" nowrap>/g);
             var nomimage = b.match(regex); 
             var i=nomimage.length;
             var a=1;
             var prix_min=1000000;
             for(a; a<i; a++)
             {
             Result = nomimage[a].replace(/<td class="center" nowrap>/, '');
             ResultAdvanced = Result.replace(/€<\/td><td class="center" nowrap>/, '');
             ResultAdvanced2 = Number(ResultAdvanced);
             yugioh.prix =ResultAdvanced2;

            if(yugioh.prix<prix_min)
              {
                prix_min=yugioh.prix;
              }
             }
            console.log(prix_min);

            //CETTE PARTIE NE FONCTIONNE PAS A CAUSE DU BLOCAGE FAIT PAR LE SITE 
            var Nom_carte_market = Nom_carte.replace(/-/g, '+');
            console.log(Nom_carte_market);
            var url_card_market="https://en.yugiohcardmarket.eu/Cards/"+Nom_carte_market;
          
         
          console.log(url_card_market);
          https.get(url_card_market, function(res3) 
          {
            res3.setEncoding('utf8');
            res3.on('data', function(data) 
            {
              info3.push(data);
            });
           res3.on('error', console.error);
           res3.on('end', function() 
            {
              c=info3.join('');
              console.log(c);
             var regex = new RegExp (/<span itemprop=\"lowPrice\">((?:.|\n)*?)<\/span>/g);
             var nomimage = c.match(regex); 
             Result_card_market = nomimage[1];

            console.log(Result_card_market);
            sRes.end("Le prix le plus bas sur le site card market est de "+Result_card_market +" € .");           
            });
          });

            sRes.end("Le prix le plus bas sur le site OTK est de "+prix_min +" € ."); 
            });
          });
        });
      });
    }
 });







//Classify the data 
'use strict';
var yugioh = [{
  'Id': '',
  'prix': 0,
}];


