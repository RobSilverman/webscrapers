import csv from 'fast-csv';

const alphavantage_key = '9HDAAXPNNM6NPGSK';
const url_base = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${alphavantage_key};`

