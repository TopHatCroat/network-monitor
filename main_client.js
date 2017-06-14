/**
 * Created by root on 14.06.17..
 */
$(document).ready(function(){
    myConsole.log("TEST");
    $("#inputFile").click(function(event){
        event.target.value=null;
    }).change(function(event){
        inspectFile(event.target.files[0].path);
    });
});