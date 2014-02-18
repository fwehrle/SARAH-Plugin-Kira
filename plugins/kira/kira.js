exports.action = function(data, callback, config){

	var xmldoc = require('./lib/xmldoc');  /** obligatoire pour lire le fichier xml **/
	config = config.modules.kira;
	var url="";
	var lan_path = '/remote2.htm';
	var http = 'http://';
	var https = 'https://';
	var actionType;
	
		
/************************************************* 
*************** BUILD URL ************************
**************************************************/	

	/** acces module **/
	var fs = require('fs');
	var xmlFile = fs.readFileSync(__dirname+'\\periph.xml');
	var file = new xmldoc.XmlDocument(xmlFile);
	var module = file.childWithAttribute('nom',data.module);

	/***** LAN method *****/
		if (!config.ip_lan){
			console.log("Missing IP");
			return;
		}
		if (!config.port){
			console.log("Missing PORT");
			return;
		}
		
		// periph action
		//exemple : http://192.168.1.13:8080/remote2.htm?button001
		url = http+config.ip_lan+':'+config.port+lan_path;
		url += '?button'+module.attr.number;

		console.log("Sending request to: " + url);

	
	
/************************************************ 
*************** CALL URL ************************
*************************************************/		
  
 	// Send Request
	var request = require('request');
	request({ 'uri' : url }, function (err, response, body){

		if (err || response.statusCode != 200) {
			callback({'tts': "L'action a échoué"});
			return;
		}

		var tts = data.ttsAction;

        if(data.repeat>1){
            console.log("repeating " + data.repeat);
            executeRequest(url, data.repeat-1, 200);
        }else{
            console.log("no repeating");
        }
        // Callback with TTS
        if(data.notts=='true'){
            callback({});
        }else{
            callback({'tts': tts});
        }
	});

    function executeRequest(url, repeat, timeout){
        var i = repeat;
        setTimeout(function () {
            console.log("repeat " + i + " : "+url);
            request({ 'uri' : url }, function (err, response, body){
                //Rien
                if(i>1){
                    executeRequest(url, i-1, timeout)
                }
            });
        }, timeout);
    }
}

