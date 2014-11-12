var fs = require('fs')
var unirest = require('unirest')
var cheerio = require('cheerio')
var rimraf = require('rimraf')
var dpdf = require('download-pdf')
var pdfUtil = require('pdf-to-text')

// Save to data to multiple formats
var save = require('./lib/saveData.js')

// Last report in local data
var currentData = require('./ebola-outbreak-data.json')
var lastReport = currentData[currentData.length - 1]
var lastReportTimestamp = new Date(lastReport.date).getTime()

// Placeholder for new report data
var reports = []

// Get all the reports from WHO
unirest
  .get("http://www.who.int/csr/disease/ebola/situation-reports/en/")
  .end(function(response){

    // Get the response body
    var body = response.body

    // Send the body to cheerio
    var $ = cheerio.load(body)

    // Find all the elements we care about in the first .list in the source
    var elements = $($("#content .list")[0]).children('li').children('a')

    // Loop over the reports
    for (var i = elements.length - 1; i >= 0; i--) {
      var element = elements[i]

      // Get the date 
      var date = element.children[0].data
      date = new Date(date.split("-")[1].trim())
      var dateTimestamp = new Date(date).getTime()

      if (dateTimestamp > lastReportTimestamp) {

        // Get the link
        var link = element.attribs.href.trim()

        // Create the object
        var obj = {
          date: date,
          link: link
        }

        // Add to array
        reports.push(obj)   

      }

    }

    if (reports.length > 0) {
      getReports(reports)
    } else {
      save(currentData)
    }

  })

function getReports(reports) {
  var report = reports[0]
  reports.shift()
  var link = report.link
  var date = new Date(report.date).toISOString()
  unirest
    .get(link)
    .end(function(response){
      var body = response.body
      var opts = { directory : "temp" }
      console.log("Downloading " + link)
      dpdf(link, opts, function(err, path){
        if (err) throw err
        parseReport(path, function(data){
          var obj = {
            date: date,
            cases: parseInt(data.cases),
            deaths: parseInt(data.deaths)
          }
          currentData.push(obj)
          if (reports.length > 0) {
            getReports(reports) 
          } else {
            rimraf('./temp', function(err) {
              if (err) throw err
              save(currentData)
            })
          }
        })
      })
    })
}

function parseReport(report, callback) {

  pdfUtil.pdfToText(report, function(err, data) {

    if (err) throw(err)

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
