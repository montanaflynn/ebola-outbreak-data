var fs = require('fs')
var aoot = require('aoot')
var data = require('./ebola-outbreak-data.json')

fs.writeFile("ebola-outbreak-data.csv", aoot.csv(data), function(err) {
    if(err) {
        console.log(err)
    } else {
        console.log("CSV file saved!")
    }
}) 

fs.writeFile("ebola-outbreak-data.tsv", aoot.tsv(data), function(err) {
    if(err) {
        console.log(err)
    } else {
        console.log("TSV file saved!")
    }
}) 

fs.writeFile("ebola-outbreak-data.xml", aoot.xml(data), function(err) {
    if(err) {
        console.log(err)
    } else {
        console.log("XML file saved!")
    }
}) 
