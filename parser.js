// reads file
var fs = require('fs');
var data = fs.readFileSync('p1.json','utf8'); //('json-filename', 'utf8')

var mydata = JSON.parse(data); //store JSON data as js object
var re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
var url = "";
for(var i = 0; i < mydata["responses"][0]["textAnnotations"].length; i++) {
    if(re.test(mydata["responses"][0]["textAnnotations"][i]["description"])) {
        url = mydata["responses"][0]["textAnnotations"][i]["description"];
    }
}
console.log(url);