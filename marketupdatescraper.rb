# to do: get full name for most active option symbol
require 'rubygems'
require 'nokogiri'
require 'open-uri'
require 'json'

industryURL = 'https://eresearch.fidelity.com/eresearch/markets_sectors/sectors/sectors_in_market.jhtml'
activeURL = 'http://www.cboe.com/data/current-market-statistics/cboe-most-actives-gainers-losers-equity-options'
pcURL = 'http://www.cboe.com/data/current-market-statistics'
daqURL = 'https://www.nasdaq.com/markets/most-active.aspx'
nysURL = 'https://www.nasdaq.com/markets/most-active.aspx?exchange=NYSE'
cnnURL = 'https://money.cnn.com/data/markets/'
vixURL = 'http://www.cboe.com/vix'

#activeLink = pcURL

# Place Put/Call data in array
page = Nokogiri::HTML(open(pcURL))
pcData = []
page.css('tr td').each_with_index do |x, i|
    if i > 5 && i < 10
        #push each data point from the 9:30 line to list using regex to remove tags
        pcData.push(x.to_str.match(/\d{1,6}\.*\d{0,2}/))
    end
end

# Place Most Active Options in array
page = Nokogiri::HTML(open(activeURL))
topCall = []
topPut = []
topOpt = []
topOptDesc = ""
page.css('tr td').each_with_index do |x, i|
    if i > 0 && i < 5
        topCall.push(x.to_str)
    end
    if i > 70 && i < 75
        topPut.push(x.to_str)
    end
end
if topCall[3].to_i > topPut[3].to_i
    topOpt = topCall
    topOptDesc = "call"
else
    topOpt = topPut
    topOptDesc = "put"
end

# Place Adv/Dec ratios into arrays
page = Nokogiri::HTML(open(daqURL))
daqAdvDec = []
daqAdvDec.push(page.css('tr td')[2].to_str.match(/\d{0,1},?\d{3}/))
daqAdvDec.push(page.css('tr td')[4].to_str.match(/\d{0,1},?\d{3}/))
page = Nokogiri::HTML(open(nysURL))
nysAdvDec = []
nysAdvDec.push(page.css('tr td')[2].to_str.match(/\d{0,1},?\d{3}/))
nysAdvDec.push(page.css('tr td')[4].to_str.match(/\d{0,1},?\d{3}/))

# Place major index prices into array
page = Nokogiri::HTML(open(cnnURL))
indexData = []
spMod = ""
dowMod = ""
daqMod = ""
indexData.push(page.css('ul.three-equal-columns li.column')[0].to_str.match(/[\+\-]{1}\d{1,}\.\d{2}\%/))
indexData.push(page.css('ul.three-equal-columns li.column')[1].to_str.match(/[\+\-]{1}\d{1,}\.\d{2}\%/))
indexData.push(page.css('ul.three-equal-columns li.column')[2].to_str.match(/[\+\-]{1}\d{1,}\.\d{2}\%/))
if indexData[0].to_s[0] == "+"
    dowMod = "up"
else
    dowMod = "down"
end
if indexData[1].to_s[0] == "+"
    daqMod = "up"
else
    daqMod = "down"
end
if indexData[2].to_s[0] == "+"
    spMod = "up"
else
    spMod = "down"
end

# pull VIX data (price, change, close) into array and set modifier variable
page = Nokogiri::HTML(open(vixURL))
vixData = []
vixMod = ""
vixData.push(page.css("div.col2")[0].to_str.match(/\d{1,2}\.\d{2}/))
vixData.push(page.css("div.col2")[1].to_str.match(/\d{1,2}\.\d{2}/))
currentVix = vixData[0].to_s
eodVix = vixData[1].to_s
changeVix = currentVix.to_f - eodVix.to_f
vixData.push(changeVix.round(2))
if vixData[2] > 0
    vixMod = "up"
else
    vixMod = "down"
end

divider = "-------------------------"
puts "Top Call:"
puts topCall
puts divider
puts "Top Put:"
puts topPut
puts divider
puts "Top Opt:"
puts topOpt
puts divider
puts "Put/Call Ratio:"
puts pcData
puts divider
puts "Nasdaq Adv/Dec:"
puts daqAdvDec
puts divider
puts "NYSE Adv/Dec:"
puts nysAdvDec
puts divider
puts "Major Index %'s:"
puts indexData
puts divider
puts "Vix:"
puts vixData
puts divider
puts "At present, the S&P 500 is #{spMod} #{indexData[2]}, the DJIA is #{dowMod} #{indexData[1]}, and the NASDAQ is #{daqMod} #{indexData[0]}."
puts "Industries doing well today include ABCDEFG. Industries showing weakness include ABCDEFG. The VIX is #{vixMod} #{vixData[2]} to #{vixData[0]} after the previous close of #{vixData[1]}. The most heavily traded options this morning are for the ABCDEFGHIJKLMN (#{topOpt[0]}), with #{topOpt[3]} #{topOpt[1]} $#{topOpt[2]} #{topOptDesc}s on the board. The total put/call ratio as of 10:30 AM was #{pcData[3]} (#{pcData[1]}/#{pcData[0]}). The advancers/decliners ratio for NYSE stocks is #{nysAdvDec[0]}/#{nysAdvDec[1]} while the advancers/decliners ratio for NASDAQ stocks is #{daqAdvDec[0]}/#{daqAdvDec[1]}."