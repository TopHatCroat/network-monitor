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
			myConsole.log("history file created");
		});
	}
}

let historyData = "h";

function readHistory(){
	prepareFile();
	//novija verzija js-a je potreban za ove naredbe
	fs.readFile(fp, 'utf-8', (err, data) => {
		if(err){
			alert("An error ocurred reading the file :" + err.message);
			return;
		}
		myConsole.log("readHistory()");
		//if not empty
		if(data!="["){
			//remove last ,
			data = data.slice(0, -1);
        }
		data += "]";
		data = JSON.parse(data);
        historyData = JSON.parse(JSON.stringify(data));
	});
}
var fs = require('fs');
var fp= 'resources/app/data/h.dat';

function writeHistory(filePath, fileSize, processingTime, securityProblems){
	prepareFile();
	var id = ""+filePath+fileSize+processingTime+securityProblems+ new Date().toLocaleString();
    id = id.hashCode();
	if(historyData.length>40){

	}
	var date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
	var data = {id: id, filePath: filePath, fileSize:fileSize, processingTime: processingTime, securityProblems:securityProblems, date: date};
	fs.appendFile(fp, JSON.stringify(data, null, 2)+",", (err) => {
		if(err){
			alert("An error ocurred creating the file "+ err.message)
		}
        historyData.push(data);
	});


}



