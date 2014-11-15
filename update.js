var fs = require('fs')
var unirest = require('unirest')
var cheerio = require('cheerio')
var rimraf = require('rimraf')
var aoot = require('aoot')
var dpdf = require('download-pdf')
var pdfUtil = require('pdf-to-text')

// Last report in local data
var originalData = require('./ebola-outbreak-data.json')
var lastReport = originalData[originalData.length - 1]
var lastReportTimestamp = new Date(lastReport.date).getTime()

// Placeholder for new report data
var reports = []

// Get all the PDF reports from the WHO website
unirest
  .get("http://www.who.int/csr/disease/ebola/situation-reports/archive/en/")
  .end(function(response){

    console.log("Ebola report list received")

    // Send the body to cheerio for jquerification
    var $ = cheerio.load(response.body)

    // Find all the a elements we care about in the first .list 
    var elements = $($("#content .list")[0]).children('li').children('a')

    // Loop over the reports backwards
    for (var i = elements.length - 1; i >= 0; i--) {

      // Get the date from anchor link text
      var element = elements[i]
      var date = element.children[0].data
      date = new Date(date.split("-")[1].trim())

      // Save the date in epoch timestamp to compare
      var dateTimestamp = new Date(date).getTime()

      // Check if we have new reports
      if (dateTimestamp > lastReportTimestamp) {

        // Get the link
        var link = element.attribs.href.trim()

        // Add to array
        reports.push({
          date: date,
          link: link
        })   

      }

    }

    // Keep going if more reports
    if (reports.length > 0) {
      getReports(reports)

    // If we're up to date
    } else {
      saveData(originalData)
    }

  })

// Get all the new reports
function getReports(reports) {

  var report = reports[0]
  console.log("Downloading " + report.link)

  // Save the pdf report into the temp directory
  dpdf(report.link, { directory : "temp" }, function(err, path){

    if (err) throw err

    // Parse the report that was just saved
    parseReport(path, function(data){

      // Add to the original data array
      originalData.push({
        date: new Date(report.date).toISOString(),
        cases: parseInt(data.cases),
        deaths: parseInt(data.deaths)
      })

      // Check if more reports to do
      reports.shift()
      if (reports.length > 0) {

        // Keep on going
        getReports(reports) 

      } else {

        // Delete the temp dir
        rimraf('./temp', function(err) {
          if (err) throw err

          // Save the data in a bunch of formats
          saveData(originalData)
        })
      }
    })
  })
}

function parseReport(report, callback) {

  pdfUtil.pdfToText(report, function(err, data) {

    if (err) throw(err)

    // Let's hope this doesn't change :/
    var cases = /There have been \S*(?:\s\S+)?/
    var deaths = /with \S*(?:\s\S+)?/

    var obj = {}

    var match = cases.exec(data)
    if (match === null) throw("Couldn't parse cases")
    cases = match[0]
    cases = cases.replace(/\D/g,'');
    obj["cases"] = cases

    var match = deaths.exec(data)
    if (match === null) throw("Couldn't parse deaths")
    deaths = match[0]
    deaths = deaths.replace(/\D/g,'');
    obj["deaths"] = deaths

    callback(obj)

  })
}

function saveData(data) {
    
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
