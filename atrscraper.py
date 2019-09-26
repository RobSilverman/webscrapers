import json
import requests
import csv

alphavantage_key = '9HDAAXPNNM6NPGSK'
url_base = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&outputsize=compact&apikey={key}'

class Stock:
    def __init__(self, symbol):
        self.symbol = symbol

    def get_data(self):
        api_url = url_base.format(symbol=self.symbol, key=alphavantage_key)
        response = requests.get(api_url)

        if response.status_code == 200:
            return json.loads(response.content.decode('utf-8'))
        else:
            return None

for stk in ["aapl", "gs", "NFLX", "z"]:
    s = Stock(symbol = stk)
    json_data = s.get_data()
