var fs = require('fs')
var aoot = require('aoot')

module.exports = function save(data) {
    
  fs.writeFile("./ebola-outbreak-data.json", JSON.stringify(data,null,4), function(err) {
    if(err) {
      console.log(err)
    } else {
      console.log("JSON file saved!")
    }
  }) 

  fs.writeFile("./ebola-outbreak-data.csv", aoot.csv(data), function(err) {
    if(err) {
      console.log(err)
    } else {
      console.log("CSV file saved!")
    }
  }) 

  fs.writeFile("./ebola-outbreak-data.tsv", aoot.tsv(data), function(err) {
    if(err) {
      console.log(err)
    } else {
      console.log("TSV file saved!")
    }
  }) 

  fs.writeFile("./ebola-outbreak-data.xml", aoot.xml(data), function(err) {
    if(err) {
      console.log(err)
    } else {
      console.log("XML file saved!")
    }
  }) 

  fs.writeFile("./ebola-outbreak-data.yaml", aoot.yaml(data), function(err) {
    if(err) {
      console.log(err)
    } else {
      console.log("YAML file saved!")
    }
  }) 

}
