/**
 * Created by root on 14.06.17..
 */

function inspectFile(path){
    //check extension


    //open file


    //load content
}

//creates h.dat if it doesn't exist
function prepareFile(){
	if (!fs.existsSync(fp)) {
		fs.writeFile(fp, '[', (err) => {
			if(err){
				alert("An error ocurred creating the file "+ err.message)
			}
			
			alert("The file has been succesfully saved");
		});
	}
}

function readHistory(){
	prepareFile();
	//novija verzija js-a je potreban za ove naredbe
	fs.readFile(fp, 'utf-8', (err, data) => {
		if(err){
			alert("An error ocurred reading the file :" + err.message);
			return;
		}
		//myConsole.log(data);
		//myConsole.log(data + "]");
		data = data.slice(0, -1)+"]";
		myConsole.log( "PARSE: "+$.parse(data + "]"));
		data = parse(data + "]");
		$.each( data, function( key, value ) {
			alert( key + ": " + value );
		});
		
	});
}


var fs = require('fs');
var fp= 'resources/history/h.dat';
function writeHistory(filepath, otherData){
	prepareFile();
	var data = {filepath: filepath, som_other_data:otherData};
	fs.appendFile(fp, JSON.stringify(data, null, 2)+",", (err) => {
		if(err){
			alert("An error ocurred creating the file "+ err.message)
		}
		
		alert("The file has been succesfully saved");
	});
	
	
}
