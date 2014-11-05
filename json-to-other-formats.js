var fs = require('fs')
var data = require('./ebola-outbreak-data.json')

var csvStream = fs.createWriteStream('./ebola-outbreak-data.csv');
csvStream.write("date, cases, deaths\n")
for (var i = 0; i < data.length; i++) {
	var d = data[i]
	csvStream.write(d.date + ", " + d.cases +  ", " + d.deaths + "\n")
}
console.log("CSV file saved")
csvStream.end();


var tsvStream = fs.createWriteStream('./ebola-outbreak-data.tsv');
tsvStream.write("date\tcases\tdeaths\n")
for (var i = 0; i < data.length; i++) {
  var d = data[i]
  tsvStream.write(d.date + "\t" + d.cases +  "\t" + d.deaths + "\n")
}
console.log("TSV file saved")
tsvStream.end();


var xmlStream = fs.createWriteStream('./ebola-outbreak-data.xml');
xmlStream.write('<?xml version="1.0"?>\n')
xmlStream.write("<ROWSET>\n")
for (var i = 0; i < data.length; i++) {
  var d = data[i]
  xmlStream.write("\t<ROW>\n")
  xmlStream.write("\t\t<date>"+d.date+"</date>\n")
  xmlStream.write("\t\t<cases>"+d.cases+"</cases>\n")
  xmlStream.write("\t\t<deaths>"+d.deaths+"</deaths>\n")
  xmlStream.write("\t</ROW>\n")
}
xmlStream.write("</ROWSET>\n")
console.log("XML file saved")
xmlStream.end();
