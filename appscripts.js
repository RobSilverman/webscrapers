function onOpen() {
    //places menu button in spreadsheet
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Hercules API Puller')
        .addItem('Pull SSR Data','getStockData')
        .addToUi();
  }
  
function getHerculesAPI(stock) {
    
    //concatenate link from base and entered symbol
    var link = 'API Link Redacted' + stock
    
    //pull data from API using link
    try {
      var response = UrlFetchApp.fetch(link, { headers: { Authorization + Bearer Token Redacted } });
    }
    catch(error) {
      return null;
    }
    
    //prepare and return JSON data
    var data = response.getContentText();
    return JSON.parse(data);
    
    
    //Logger.log(output.data.industry.stockSentimentRank);
    //var sheet = SpreadsheetApp.getActiveSheet();
    //sheet.getRange(2, 2).setValue([(varname).data.sentiment]);
  }
  
function getStockData() {
    
    var startTime = Date.now();
    //determine active spreadsheet
    var spsh = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spsh.getSheetByName("API Puller");
    var lnTest = sheet.getLastRow();
    
    for (i=0; i<lnTest-1; i++) {
      var symbol = sheet.getRange(i + 2, 1).getValue(); 
      var hercData = getHerculesAPI(symbol);
      
      if (hercData == null) {
        sheet.getRange(i + 2, 2).setValue("Error");
      } else {
        var rndssr = hercData.data.ssrOverallScore;
        var stssr = hercData.data.ssrShortTermTechnicalScore;
        var ltssr = hercData.data.ssrLongTermTechnicalScore;
        var fdssr = hercData.data.ssrFundamentalScore;
        sheet.getRange(i + 2, 2).setValue(Math.round(rndssr*100));
        sheet.getRange(i + 2, 3).setValue(Math.round(stssr*100));
        sheet.getRange(i + 2, 4).setValue(Math.round(ltssr*100));
        sheet.getRange(i + 2, 5).setValue(Math.round(fdssr*100));
        sheet.getRange(i + 2, 6).setValue([hercData.data.averageRecommendation]);
        sheet.getRange(i + 2, 7).setValue([hercData.data.priceMeanTarget]);
      }
        
      if (sheet.getRange(i + 2, 5).getValue() == 0) {
        sheet.getRange(i + 2, 5).clear()
      }
      
      if (sheet.getRange(i + 2, 2).getValue() == "Error" && sheet.getRange(i + 2, 1).isBlank()) {
        sheet.getRange(i + 2, 2).clear()
      }
      
    }
    
    var endTime = Date.now();
    var progTime = endTime - startTime;
    sheet.getRange(1, 11).setValue((progTime / (1000 * 60)) + " minutes");
    
  }
  
function sheetSizeTest() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    lr = ss.getLastRow()
    Logger.log(lr);
  }

function writeStory() {
    var startTime = Date.now();
    var spsh = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = spsh.getSheetByName("API Puller");
    const ioSheet = spsh.getSheetByName("Input/Output");
    const lnTest = dataSheet.getLastRow();
    
    // section for creating "Data2" sheet w/ static references
    const dataPullSheet = spsh.getSheetByName("Data");
    const dataTwoSheet = spsh.getSheetByName("Data2");
    var dataSheetCopy = spsh.getRange("Data!A1:AC294").getValues();
    dataTwoSheet.getRange("A1:AC294").setValues(dataSheetCopy);
    
    for (i=0; i<lnTest-1; i++) {
      var symbol = dataSheet.getRange(i + 2, 1).getValue();
      var ssrScore = dataSheet.getRange(i + 2, 2).getValue();
      var stTech = dataSheet.getRange(i + 2, 3).getValue();
      var ltTech = dataSheet.getRange(i + 2, 4).getValue();
      var fundScore = dataSheet.getRange(i + 2, 5).getValue();
      var matAvgRec = dataSheet.getRange(i + 2, 6).getValue();
      var meanTgt = dataSheet.getRange(i + 2, 7).getValue();
      
      var avgRec = Math.round(matAvgRec);
      
      // skip if SSR pull gives "Error"
      if (ssrScore == "Error") {
        continue;
      }
      
      if (dataSheet.getRange(i + 2, 1).isBlank()) {
        continue;
      }
      
      switch (avgRec) {
        case 5:
          ioSheet.getRange(6, 2).setValue("Strong Buy");
          break;
        case 4:
          ioSheet.getRange(6, 2).setValue("Buy");
          break;
        case 3:
          ioSheet.getRange(6, 2).setValue("Hold");
          break;
        case 2:
          ioSheet.getRange(6, 2).setValue("Sell");
          break;
        case 1:
          ioSheet.getRange(6, 2).setValue("Strong Sell");
          break;
        default:
          ioSheet.getRange(6, 2).clear();
      }
      
      ioSheet.getRange(1, 2).setValue(symbol);
      ioSheet.getRange(2, 2).setValue(ssrScore);
      ioSheet.getRange(3, 2).setValue(stTech);
      ioSheet.getRange(4, 2).setValue(ltTech);
      ioSheet.getRange(5, 2).setValue(fundScore);
      // changed to switch statement above   ioSheet.getRange(6, 2).setValue(avgRec);
      ioSheet.getRange(7, 2).setValue(meanTgt);
      
      //insert "break" for loading here
      SpreadsheetApp.flush();
      //Utilities.sleep(1500);
      
      var title = ioSheet.getRange(11, 2).getValue();
      var story = ioSheet.getRange(13, 2).getValue();
      
      dataSheet.getRange(i + 2, 8).setValue(title);
      dataSheet.getRange(i + 2, 9).setValue(story);
      
      var attempts = 20;
      
      while (dataSheet.getRange(i + 2, 9).getValue() == "#N/A" && attempts >= 0) {
        Utilities.sleep(100);
        //story = ioSheet.getRange(13, 2).getValue();
        SpreadsheetApp.flush();
        //dataSheet.getRange(i + 2, 9).setValue(story);
        ioSheet.getRange(13, 2).copyTo(dataSheet.getRange(i + 2, 9), {contentsOnly:true});
        attempts -= 1;
      }
      
    }
    
    var endTime = Date.now();
    var progTime = endTime - startTime;
    dataSheet.getRange(1, 11).setValue((progTime / (1000 * 60)) + " minutes");
    
  }