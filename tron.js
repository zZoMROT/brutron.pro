var gen = require('./tronscan-node-client/src/utils/crypto.js');
const { byte2hexStr, byteArray2hexStr } = require("./tronscan-node-client/src/utils/bytes");
const { hexStr2byteArray } = require("./tronscan-node-client/src/lib/code");
const {encode58, decode58} = require("./tronscan-node-client/src/lib/base58");

const https = require('https'); 

var isStop = true;
global.isStop = isStop;

function stop(_stop){
	isStop = _stop;
}
global.stop = stop;

function doRequest(url, address, pk) {
  https.get(url, (res) => {
  	var data = '';

    if (res.statusCode >= 300 && res.statusCode <= 400 && res.headers.location) {
      doRequest(res.headers.location);
    }
    res.on('data', (d) => {
      data += d;
    });

    res.on('end', () => {
    	data = JSON.parse(data).data[0];
    	if(data == undefined)
    		print(pk, address, "Address wasn't used");
    	else
    		print(pk, address, parseFloat(data.balance)/1000000);
	});

  }).on('error', (e) => {
    console.error(e);
  });
}

var alphabet = "0123456789ABCDEF";	
function upStart(start, index = 1){
	if(start[start.length-1-index] < alphabet.indexOf("F")){
		start = start.slice(0, -1-index) + alphabet[ alphabet.indexOf(start[start.length-1-index])+1 ];
		for(var i = 0; i < index; i++)
			start += alphabet[0];
		return start;
	} else {
		return upStart(start, index+1);
	}
}	

function generatePK(start = "0000000000000000000000000000000000000000000000000000000000000000") {
	document.getElementById('info').innerHTML = "";
	
	if(isStop)
		return;
	
	if(start == "")
		start = "0000000000000000000000000000000000000000000000000000000000000000";
		
	if(start.match(new RegExp(/[^0-9A-F]/)) != null){
		document.getElementById('info').innerHTML = "Incorrect private key hash, use only 0-9A-F";
		return;
	}
	
	if(start.length != 64){
		document.getElementById('info').innerHTML = "Incorrect private key hash length, need 64 characters";
		return;
	}
			
	next_pk = '';
	if(alphabet.indexOf(start[start.length-1]) < alphabet.indexOf("F")){
		next_pk = start.slice(0, -1) + alphabet[ alphabet.indexOf(start[start.length-1])+1 ];
		
		address = gen.pkToAddress(next_pk);
		url = 'https://api.tronscan.org/api/account?address='+address;

		doRequest(url, address, next_pk);
	} else {
		next_pk = upStart(start);
	}

	setTimeout( function() { generatePK(next_pk); }, 50);
}
global.generatePK = generatePK;

function print(pk, address, balance){
	// console.log(pk, address, balance);
	
	var table = "table";
	if(balance != "Address wasn't used" && balance != 0){
		table = "table_success";
		document.getElementById('no_addresses').style.visibility = "hidden"; 	
	} 
	
	var t = document.getElementById(table).innerHTML.split("</th></tr>");
	document.getElementById(table).innerHTML = t[0] + "<tr><td>"+pk+"</td><td><a href='https://tronscan.org/#/address/"+address+"' target='_blank'>"+address+"</td><td>"+balance+"</td></tr>" + t[1];
	
}

