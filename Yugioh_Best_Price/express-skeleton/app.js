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
var jsonfile = require('jsonfile');
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
    var Nom_carte_with_space = sReq.body.testurl;   
    var Nom_carte =Nom_carte_with_space.replace(/ /g, '-');
    console.log(Nom_carte); 
    url = 'http://www.otk-expert.fr/yugioh/cartes/'+Nom_carte;
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
          //Scrapping ID
          var regex = new RegExp (/FR_title((?:.|\n)*?)\"/);
          var nomimage = a.match(regex); 
          Result = nomimage[1].replace(/%20/g, ' ');
          console.log(Result);
          yugioh.Id=Result;

          //Scrapping SRC for image
          var regex = new RegExp (/<img class=\"image\" src=\"((?:.|\n)*?)\"/);
          var nomimage = a.match(regex); 
          Result = nomimage[1];
          console.log(Result);
          var Src=Result;

		      console.log(yugioh.Id);
          console.log(Src);
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
        

             /*Variable a scrap pour le JSON
             var tableau_prix = [];
             var edition = [];
             var etat = [];
             var langue = [];
             var lien = [];
             var rarete = [];
             var nom_vendeur = [];
            */
             //EXTRACTION Price by best agent
             var extract_prix = new RegExp (/<td class=\"center\" nowrap>((?:.|\n)*?)€<\/td><td class=\"center\" nowrap>/g);
             var extract_edition = new RegExp (/<\/a><\/td><td>((?:.|\n)*?)</g);
             var extract_etat = new RegExp (/<\/td><td>((?:.|\n)*?)<\/td><td/g);
             var extract_langue = new RegExp (/here((?:.|\n)*?)here/g); 
             var extract_lien = new RegExp (/- <a href=\"((?:.|\n)*?)\" /g); 
             var extract_rarete = new RegExp (/<\/td><td class=\"center\">((?:.|\n)*?)<\/td><td>/g); 
             var extract_nom_vendeur = new RegExp (/Profil de ((?:.|\n)*?)</g);
             
             var extracted_price = b.match(extract_prix); //OK
             var extracted_edition = b.match(extract_edition); //OK
             var extracted_etat = b.match(extract_etat); //OK
             var extracted_langue = b.match(extract_langue); // A FINIR
             var extracted_lien = b.match(extract_lien);  //OK
             var extracted_rarete = b.match(extract_rarete); //OK
             var extracted_nom_vendeur = b.match(extract_nom_vendeur); // A FINIR

            //A nettoyer pour l'utilisation dans la boucle for
             console.log(extracted_price[1]);
             console.log(extracted_edition[1]);
             console.log("http://www.card-hunter.fr/yugioh"+extracted_lien[1]);
             console.log(extracted_rarete[1]); //Attention ça choppe la langue après
             console.log(extracted_etat[1]); 

            // console.log(extracted_langue[1]);

             //variable pour la boucle de recuperation
             var i=extracted_price.length;
             var k=1;
             var prix_min=1000000;        

             for(k; k<i+1; k++)
             {
             
             //Nettoyage de la data
             //Price
             price = extracted_price[k-1].replace(/<td class="center" nowrap>/, '');
             price_clean = price.replace(/€<\/td><td class="center" nowrap>/, '');
             price_clean2 = Number(price_clean);

             //edition
             edition = extracted_edition[k-1].replace(/<\/a><\/td><td>/, '');
             edition_clean = edition.replace(/</, '');

             //etat
             if(k%2==1)
             {
             j=k;
             etat = extracted_etat[j].replace(/<\/td><td>/, '');
             etat_clean = etat.replace(/<\/td><td/, '');
             j=j-1;
         	 }
             //langue
            // langue = extracted_langue[k-1].replace(/here/, '');
            // langue_clean = langue.replace(/here/, '');
            
             //lien
             lien = extracted_lien[k-1].replace(/- <a href=\"/, '');
             lien_clean = lien.replace(/\"/, '');
             lien_clean2="http://www.card-hunter.fr/yugioh"+lien_clean

             //rarete
             rarete = extracted_rarete[k-1].replace(/<\/td><td class=\"center\">/, '');
             rarete_clean = rarete.replace(/<\/td><td>/, '');

             //vendeur
             vendeur = extracted_nom_vendeur[k-1].replace(/here/, '');
             vendeur_clean = vendeur.replace(/here/, '');

             //Ajout de la data au JSON
             data.prix[k-1]=price_clean2;
             data.edition[k-1]=edition_clean;
             data.etat[k-1]=etat_clean;
             //data.langue[k-1]=langue_clean;
             data.lien[k-1] = lien_clean2;
             data.rarete[k-1] = rarete_clean;
             data.vendeur[k-1] =vendeur_clean;

             //Ajout au JSON(local)
             yugioh.prix =price_clean2;

            if(yugioh.prix<prix_min)
              {
                prix_min=yugioh.prix;
              }
             }
            console.log(prix_min);

            //CETTE PARTIE NE FONCTIONNE PAS A CAUSE DU BLOCAGE FAIT PAR LE SITE 
           /*
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
          }); */
            console.log(data);
            var file = 'data.json';
            jsonfile.writeFile(file, data, function (err) 
            {
  console.error(err)
				})

            sRes.end("Donnée extraite dans le fichier data.json (dans le repertoire de app.js). \n\n Le prix le plus bas est de "+prix_min+" €."); 

         

            });
          });
        });
      });
 });







//Classify the data 
'use strict';
var yugioh = [{
  'Id': '',
  'prix': 0,
}];

var data;


data = {
  'prix':[''],
  'edition':[''],
  'etat': [''],
  //'langue':[''],
  'lien':[''],
  'rarete':[''],
  'vendeur':[''],
  'site':['otk-expert']
};
