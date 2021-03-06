var gen = require('./tronscan-node-client/src/utils/crypto.js');
const { byte2hexStr, byteArray2hexStr } = require("./tronscan-node-client/src/utils/bytes");
const { hexStr2byteArray } = require("./tronscan-node-client/src/lib/code");
const {encode58, decode58} = require("./tronscan-node-client/src/lib/base58");

const https = require('https'); 
const TronWeb = require('tronweb');

var nodeUrl = "https://api.trongrid.io";
function setNodeUrl(newNodeUrl){
	nodeUrl = newNodeUrl;
}
global.setNodeUrl = setNodeUrl;

const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';

const tronWeb = new TronWeb(
    new TronWeb.providers.HttpProvider(nodeUrl),
    new TronWeb.providers.HttpProvider(nodeUrl),
    new TronWeb.providers.HttpProvider(nodeUrl),
    privateKey
);

function getBalance(address, pk){
	return new Promise(ok => {
		tronWeb.trx.getAccount(address).then(data => {
			print(pk, address, data);
			ok();
		}).catch(err => {
			console.log("ERROR", "getAccount", err.toString())
			ok();
		});
	});
}

var isStop = true;
global.isStop = isStop;

function stop(_stop){
	if(!_stop)
		isData = true;
	isStop = _stop;
}
global.stop = stop;

var alphabet = "0123456789ABCDEF";	
function upStart(start, index = 1){
	if(alphabet.indexOf(start[start.length-1-index]) < alphabet.indexOf("F")){
		start = start.slice(0, -1-index) + alphabet[ alphabet.indexOf(start[start.length-1-index])+1 ];
		for(var i = 0; i < index; i++)
			start += alphabet[0];
		return start;
	} else {
		return upStart(start, index+1);
	}
}	

function generatePK(start = "0000000000000000000000000000000000000000000000000000000000000001") {
	document.getElementById('info').innerHTML = "";
	
	if(isStop){
		document.getElementById("start").value = start;
		return;
	}
	
	if(start == "")
		start = "0000000000000000000000000000000000000000000000000000000000000001";
		
	if(start.match(new RegExp(/[^0-9A-F]/)) != null){
		document.getElementById('info').innerHTML = "Incorrect private key hash, use only 0-9A-F";
		return;
	}
	
	if(start.length != 64){
		document.getElementById('info').innerHTML = "Incorrect private key hash length, need 64 characters";
		return;
	}
		
	address = gen.pkToAddress(start);
	getBalance(address, start).then(() => {
		next_pk = '';
		if(alphabet.indexOf(start[start.length-1]) < alphabet.indexOf("F")){
			next_pk = start.slice(0, -1) + alphabet[ alphabet.indexOf(start[start.length-1])+1 ];
		} else {
			next_pk = upStart(start);
		}
		
		setTimeout( function() { generatePK(next_pk); }, 100);
	});
}
global.generatePK = generatePK;

function print(pk, address, data){
	return new Promise(ok => {
		let balance = parseFloat(data.balance)/1000000;
		if(isNaN(balance)){
			balance = (data.address == undefined) ? "Address wasn't used" : 0;
		}
			
		var table = "table";
		if(balance != "Address wasn't used"){
			table = "table_success";
			balance = "TRX: " + balance;
			document.getElementById('no_addresses').style.visibility = "hidden"; 	
		} 
		
		let assets = '';
		if(data.asset != undefined){
			for(let i = 0; i < data.asset.length; i++){
				if(data.asset[i].value != 0){
					assets += '<br>' + data.asset[i].key + ': ' + data.asset[i].value;
				}
			}
		}

		let assetV2 = '<br>';
		if(data.assetV2 != undefined){
			checkTokens(data.assetV2, assetV2).then(html_assetV2 => {
				updateTable(table, pk, address, balance, assets, html_assetV2);
				ok();
			});
		} else {
			updateTable(table, pk, address, balance, assets);
			ok();
		}
	});
}

function updateTable(table, pk, address, balance, assets = '', assetV2 = ''){
	var checkLogAll = document.getElementById("checkLogAll");
	var t = document.getElementById(table).innerHTML.split("</th></tr>");
	document.getElementById(table).innerHTML = t[0] + "</th></tr><tr><td>"+pk+"</td><td><a href='https://tronscan.org/#/address/"+address+"' target='_blank'>"+address+"</td><td><b>"+balance+"</b>"+assets+assetV2+"</td></tr>";
	if(checkLogAll.checked || table == "table_success")
	 	document.getElementById(table).innerHTML += t[1];
} 

function checkTokens(tokens, assetV2 = '', index = 0){
	return new Promise(ok => {
		if(tokens[index] == undefined){
			ok(assetV2);
		}

		if(tokens[index].value != 0){
			tronWeb.trx.getTokenByID(tokens[index].key).then(data => {
				let amount = tokens[index].value;
				if(data.precision != undefined){
					amount = amount / Math.pow(10, data.precision);
				}

				assetV2 += '<br>' + data.abbr + ' [' + tokens[index].key + ']: ' + amount;
				checkTokens(tokens, assetV2, index+1).then(result => {
					ok(result);
				});
			}).catch(error => {
				console.log("ERROR", "getTokenByID", tokens[index].key);
				checkTokens(tokens, assetV2, index+1).then(result => {
					ok(result);
				});
			});
		} else {
			checkTokens(tokens, assetV2, index+1).then(result => {
				ok(result);
			});
		}
	});
}

function generateRandomPK(){
	document.getElementById('info').innerHTML = "";
	
	if(isStop)
		return;
	
	var pk = "";
	for(var i = 0; i < 64; i++){
		pk += alphabet[getRandomInt(0, alphabet.length-1)];
	}
	address = gen.pkToAddress(pk);
	url = 'https://api.tronscan.org/api/account?address='+address;
	// doRequest(url, address, pk);
	getBalance(address, pk).then(() => {
		setTimeout( function() { generateRandomPK(); }, 100);
	});
}
global.generateRandomPK = generateRandomPK;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPKFromFile(index = 0, PKs){
    if(file_content == undefined){
        document.getElementById('info').innerHTML = "No file selected";
        return;
    }
    document.getElementById('info').innerHTML = "";

    if(isStop)
        return;

    if(PKs == undefined)
        PKs = file_content.split('\n');

    pk = PKs[index];
    if(pk == undefined){
        document.getElementById('info').innerHTML = "All PKs from file was checked";
        return;
    }

    if(pk != ""){
    	address = gen.pkToAddress(pk);
	    getBalance(address, pk).then(() => {
	    	setTimeout( function() { getPKFromFile(index+1, PKs); }, 100);    	
	    });
	    return;
	}

	setTimeout( function() { getPKFromFile(index+1, PKs); }, 100);    	
}
global.getPKFromFile = getPKFromFile;

