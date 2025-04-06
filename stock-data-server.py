from flask import Flask, jsonify
import yfinance as yf
import pandas as pd
from datetime import datetime
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Common NSE stocks mapping
common_stocks = {
    "hdfc bank": "HDFCBANK",
    "hdfc": "HDFCBANK",
    "reliance": "RELIANCE",
    "reliance industries": "RELIANCE",
    "tcs": "TCS",
    "tata consultancy services": "TCS",
    "infosys": "INFY",
    "icici bank": "ICICIBANK",
    "icici": "ICICIBANK",
    "sbi": "SBIN",
    "state bank of india": "SBIN",
    "axis bank": "AXISBANK",
    "axis": "AXISBANK",
    "bharti airtel": "BHARTIARTL",
    "airtel": "BHARTIARTL",
    "itc": "ITC",
    "wipro": "WIPRO",
    "bajaj finance": "BAJFINANCE",
    "hul": "HINDUNILVR",
    "hindustan unilever": "HINDUNILVR",
    "kotak mahindra bank": "KOTAKBANK",
    "kotak": "KOTAKBANK",
    "larsen & toubro": "LT",
    "l&t": "LT"
}

def get_nse_stock_data(ticker_symbol):
    """
    Get real-time stock data for NSE listed companies using Yahoo Finance API
    
    Args:
        ticker_symbol: The stock symbol with .NS suffix for NSE stocks
        
    Returns:
        A dictionary with stock information
    """
    try:
        # Ensure the ticker has .NS suffix for NSE stocks
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"
            
        # Get the stock information
        stock = yf.Ticker(ticker_symbol)
        
        # Get current price data
        info = stock.info
        
        # Create a dictionary with relevant information
        stock_data = {
            "symbol": ticker_symbol,
            "company_name": info.get('longName', info.get('shortName', ticker_symbol.replace('.NS', ''))),
            "current_price": info.get('currentPrice', info.get('regularMarketPrice', 'N/A')),
            "currency": info.get('currency', 'INR'),
            "previous_close": info.get('previousClose', 'N/A'),
            "open": info.get('open', 'N/A'),
            "day_high": info.get('dayHigh', 'N/A'),
            "day_low": info.get('dayLow', 'N/A'),
            "52_week_high": info.get('fiftyTwoWeekHigh', 'N/A'),
            "52_week_low": info.get('fiftyTwoWeekLow', 'N/A'),
            "market_cap": info.get('marketCap', 'N/A'),
            "volume": info.get('volume', 'N/A'),
            "avg_volume": info.get('averageVolume', 'N/A'),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Calculate the change and percent change
        if stock_data["current_price"] != 'N/A' and stock_data["previous_close"] != 'N/A':
            try:
                current_price = float(stock_data["current_price"])
                prev_close = float(stock_data["previous_close"])
                change = current_price - prev_close
                percent_change = (change / prev_close) * 100
                stock_data["change"] = round(change, 2)
                stock_data["percent_change"] = round(percent_change, 2)
            except (TypeError, ValueError):
                stock_data["change"] = 'N/A'
                stock_data["percent_change"] = 'N/A'
        else:
            stock_data["change"] = 'N/A'
            stock_data["percent_change"] = 'N/A'
            
        return stock_data
    
    except Exception as e:
        print(f"Error fetching data for {ticker_symbol}: {str(e)}")
        return None

@app.route('/api/stock/<ticker>')
def get_stock(ticker):
    """API endpoint to get stock data by ticker"""
    try:
        data = get_nse_stock_data(ticker)
        if data:
            return jsonify(data)
        else:
            return jsonify({"error": f"Could not retrieve data for {ticker}"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stock/name/<company_name>')
def get_stock_by_name(company_name):
    """API endpoint to get stock data by company name"""
    try:
        # Try to find the ticker in our mapping
        lookup_name = company_name.lower()
        if lookup_name in common_stocks:
            ticker = common_stocks[lookup_name]
            data = get_nse_stock_data(ticker)
            if data:
                return jsonify(data)
        
        # If not found in our mapping, try a direct lookup with the name
        ticker = f"{company_name.replace(' ', '')}.NS"
        data = get_nse_stock_data(ticker)
        if data:
            return jsonify(data)
        
        return jsonify({"error": f"Could not find ticker for {company_name}"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trending')
def get_trending_stocks():
    """API endpoint to get data for popular Indian stocks"""
    try:
        trending_stocks = [
            "RELIANCE",
            "TCS",
            "HDFCBANK",
            "INFY",
            "ICICIBANK",
            "SBIN",
            "LT",
            "AXISBANK",
            "BHARTIARTL",
            "KOTAKBANK"
        ]
        
        results = []
        for ticker in trending_stocks:
            data = get_nse_stock_data(ticker)
            if data:
                results.append(data)
                # Small delay to be nice to the API
                time.sleep(0.2)
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting NSE Stock Data API Server...")
    app.run(host='0.0.0.0', port=5001, debug=True)
