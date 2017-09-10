var fs = require('fs');

export function parseJSON(json_response) {
	// reads file
	var data = fs.readFileSync('link1.json','utf8'); //('json-filename', 'utf8')

	// takes json and makes into js object
	var mydata = JSON.parse(data);
	var raw_text = mydata["responses"][0]["fullTextAnnotation"]["text"]; //where the url should be in the json file, very static
	return raw_text;
}