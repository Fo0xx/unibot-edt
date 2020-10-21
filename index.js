const Discord = require('discord.js');
const { format } = require('path');
const puppeteer = require("puppeteer");
const fs = require('fs');

//Récupérer les valeurs dans le fichier JSON
const { prefix, token, channel_edt } = require('./config.json');

//Définition des jours de la semaine
var laDate = new Date();
var tab_jour = new Array("Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche");

//Définition du nom des fichiers.png
var pathEDT = new Array("1atd1_1", "1atd1_2", "1atd2_1", "1atd2_2", "1atd3_1", "1atd3_2", "2atd1_1", "2atd1_2", "2atd2_1", "2atd2_2", "2atd3_1", "2atd3_2");
//Définition des noms pour l'url d'edt.maner.fr
var pageEDT = new Array("1177", "1179", "1185", "1186", "1189", "1191", "1200", "1201", "1204", "1205", "1208", "1209");

let channelMap = new Object();

//Fonction sleep (à utiliser avec await)
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

//Fonction qui vient de Ronan, le best.
//Fonction qui permet d'écrire dans un fichier, ici le fichier JSON donc.
function ecrireFichier(chemin, donnee) {
	fs.writeFile(chemin, donnee, function (err) {
		if (err) log("erreur dans l'écriture du fichier dans " + chemin);
	});
}

//Fonction qui permet de venir lire un fichier.
function lireFichier(chemin) {
	return new Promise((resolve, fail) => {
		fs.readFile(chemin, function read(err, data) {
			if (err) log("probleme chargement dans " + chemin);
			resolve(data);
		});
	})
}

//Écriture du fichier JSON
function ecrireJSON() {
    let json = new Object();
    json.prefix = prefix;
    json.token = token;
    json.channel_edt = channelMap;
    ecrireFichier('./config.json', JSON.stringify(json, null, '\t'));
}

// Utilisation d'une fonction asynchrone, pour prendre en photo l'edt (utilisation de puppeteer)
const catchEDT = async () => {
	// ouvre internet et prépare la page
	const browser = await puppeteer.launch({
		'args' : [
		  '--no-sandbox',
		  '--disable-setuid-sandbox'
		]
	  });
	const page = await browser.newPage()

	// défini la taille du viewport, pour que le screenshot ait la taille choisi
	await page.setViewport({
		width: 1280,
		height: 780
	})

	//Prise de photo de edt.maner.fr
	for(i = 0;i<pathEDT.length;i++){
		await page.goto(`https://edt.maner.fr/edt/1/${pageEDT[i]}`);
		await sleep(5000);
		await page.screenshot({
			path: `./edt/${pathEDT[i]}.png`,
			fullPage: false
		});
	}

	// ferme le navigateur
	await browser.close();
};

//Fonction qui attends que la fonction de prise de photo ait finit de s'exécuter
async function attCatchEDT(){
	try{
	  let res = await catchEDT();
	  console.log(res);
	}
	catch(err){
		console.log(err);
	}
  }

  //attCatchEDT();

var aujd = new Date();

const client = new Discord.Client();

//Lorsque le bot se connecte à Discord
client.once('ready', () => {
	console.log('Ready !');
	setMap();
	client.user.setStatus('idle');
	client.user.setActivity("faire un CM !", {type: 1});
});

function setMap(){
    channelMap.a1td1 = channel_edt.a1td1;
    channelMap.a1td2 = channel_edt.a1td2;
	channelMap.a1td3 = channel_edt.a1td3;
	channelMap.a2td1 = channel_edt.a2td1;
    channelMap.a2td2 = channel_edt.a2td2;
	channelMap.a2td3 = channel_edt.a2td3;
}

function verifierHeure(){
	let maDate = new Date();
	let str = "" + maDate;
	let tab = str.split(" ");
	let journee = tab[0];
	if(tab[4] === "03:00:00" && journee === "Mon"){
		catchEDT();
	}
	else if(tab[4] === "03:30:00" && journee === "Mon"){
		sendEdt();
	}
}

function sendEdt(){
	//Année 1 TD 1
	client.channels.cache.get(channelMap["a1td1"]).send({ files: ["./edt/1atd1_1.png"] });
	client.channels.cache.get(channelMap["a1td1"]).send({ files: ["./edt/1atd1_2.png"] });
	//Année 1 TD 2
	client.channels.cache.get(channelMap["a1td2"]).send({ files: ["./edt/1atd2_1.png"] });
	client.channels.cache.get(channelMap["a1td2"]).send({ files: ["./edt/1atd2_2.png"] });
	//Année 1 TD 3
	client.channels.cache.get(channelMap["a1td3"]).send({ files: ["./edt/1atd3_1.png"] });
	client.channels.cache.get(channelMap["a1td3"]).send({ files: ["./edt/1atd3_2.png"] });
	//Année 2 TD 1
	client.channels.cache.get(channelMap["a2td1"]).send({ files: ["./edt/2atd1_1.png"] });
	client.channels.cache.get(channelMap["a2td1"]).send({ files: ["./edt/2atd1_2.png"] });
	//Année 2 TD 2
	client.channels.cache.get(channelMap["a2td2"]).send({ files: ["./edt/2atd2_1.png"] });
	client.channels.cache.get(channelMap["a2td2"]).send({ files: ["./edt/2atd2_2.png"] });
	//Année 2 TD 3
	client.channels.cache.get(channelMap["a2td3"]).send({ files: ["./edt/2atd3_1.png"] });
	client.channels.cache.get(channelMap["a2td3"]).send({ files: ["./edt/2atd3_2.png"] });
}

setInterval(verifierHeure, 1000);

client.on('message', function (message) {

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	switch(command){
        case "commandesecrète ;)":
            edtCommande(message, args);
            break;
    }
});

function edtCommande(message, args){
    switch(args[0]){
        case 'commandecachée ;)':
            edtSetCommande(message, args);
            break;  
    }
}

function edtSetCommande(message, args){
    if(channelMap[args[1]] == null){
		console.log("null");
        let valeur = "\n__Veuillez choisir parmi :__\n";
        for(let numClass in channelMap){
			valeur += "`" + numClass + "`, ";
		}
		valeur = valeur.substring(0, valeur.length -2);
		console.log(valeur);
        message.channel.send({embed: {
            color: 3447003,
            fields: [{
                name: "**Argument invalide !**",
                value: /*"\n__Veuillez choisir parmi :__\n" + */valeur,
            }
            ],
            timestamp: new Date(),
            footer: {
            icon_url: client.user.avatarURL(),
            text: client.user.username,
            }
        }
        });
        return;
    }
	channelMap[args[1]] = message.channel.id.toString();
	console.log(channelMap);
    ecrireJSON();
    message.channel.send(`Le channel ` + message.guild.channels.cache.get(message.channel.id.toString()).toString() + ` a été choisi pour le ${args[1]} !`);
}

client.login(token);
