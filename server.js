// Load configuration with environment variables
// const config = require('./config');
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Get API key from config
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
console.log("process.env", process.env)
console.log("API_KEY: ",API_KEY);

// Cache configuration
const cache = {
  stocks: {},
  stockInfo: {}
};

const CACHE_TTL = {
  stocks: 5 * 60 * 1000, // 5 minutes
  stockInfo: 24 * 60 * 60 * 1000 // 24 hours
};

// API request queue to prevent rate limiting
const apiQueue = [];
let isProcessingQueue = false;

/**
 * Process API request queue with delay between requests
 */
function processApiQueue() {
  if (apiQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const nextRequest = apiQueue.shift();
  
  nextRequest.execute()
    .then(data => nextRequest.resolve(data))
    .catch(error => nextRequest.reject(error))
    .finally(() => {
      // Wait 1 second before processing next request
      setTimeout(processApiQueue, 1000);
    });
}

/**
 * Add request to queue and return a promise
 * @param {Function} requestFn - Function that returns a promise for the API request
 * @returns {Promise} Promise that resolves with the API response
 */
function queueApiRequest(requestFn) {
  return new Promise((resolve, reject) => {
    apiQueue.push({
      execute: requestFn,
      resolve,
      reject
    });

    if (!isProcessingQueue) {
      processApiQueue();
    }
  });
}

// Load ticker data
const nasdaqTickers = JSON.parse(fs.readFileSync(path.join(__dirname, 'nasdaq_full_tickers.json')));
const nyseTickers = JSON.parse(fs.readFileSync(path.join(__dirname, 'nyse_full_tickers.json')));
const allTickers = nasdaqTickers.concat(nyseTickers);

/**
 * Search for tickers based on query string
 */
app.get('/api/search-tickers', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  if (!query) {
    return res.json([]);
  }
  
  const filteredTickers = allTickers.filter(ticker =>
    ticker.symbol.toLowerCase().includes(query) || ticker.name.toLowerCase().includes(query)
  );
  
  res.json(filteredTickers.slice(0, 100));
});

/**
 * Calculate date range based on range string
 * @param {string} range - Range string ('1M', '3M', '6M', '1Y', '5Y')
 * @returns {Object} Object with startDate and endDate
 */
const getDateRange = (range) => {
  const endDate = new Date();
  let startDate = new Date(endDate);
  
  switch (range) {
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '5Y':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case '1M':
    default:
      startDate.setMonth(endDate.getMonth() - 1);
  }
  
  return { startDate, endDate };
};

/**
 * Get stock price data
 */
app.get('/api/stocks', async (req, res) => {
  const symbol = req.query.symbol || 'AAPL';
  const range = req.query.range || '1M';
  const cacheKey = `${symbol}_${range}`;
  
  // Check cache first
  if (cache.stocks[cacheKey] && cache.stocks[cacheKey].timestamp > Date.now() - CACHE_TTL.stocks) {
    console.log(`Serving cached stock data for ${symbol} (${range})`);
    return res.json(cache.stocks[cacheKey].data);
  }
  
  const { startDate, endDate } = getDateRange(range);

  try {
    // Use queue to prevent rate limiting
    const response = await queueApiRequest(() => axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: API_KEY,
        outputsize: 'full' // Get full data to support different ranges
      }
    }));

    if (response.data['Error Message']) {
      console.error('Error fetching stock data:', response.data['Error Message']);
      return res.status(500).json({ 
        error: 'Error fetching stock data', 
        message: response.data['Error Message'] 
      });
    }

    if (response.data['Note']) {
      console.warn('API call frequency warning:', response.data['Note']);
    }

    const data = response.data['Time Series (Daily)'];
    if (!data) {
      console.error('No data returned for symbol:', symbol);
      return res.status(404).json({ 
        error: 'No data returned', 
        message: 'No data available for this stock' 
      });
    }

    const formattedData = Object.keys(data)
      .map(key => ({
        timestamp: key,
        open: parseFloat(data[key]['1. open']),
        high: parseFloat(data[key]['2. high']),
        low: parseFloat(data[key]['3. low']),
        close: parseFloat(data[key]['4. close']),
        volume: parseInt(data[key]['5. volume'])
      }))
      .filter(d => new Date(d.timestamp) >= startDate && new Date(d.timestamp) <= endDate)
      .reverse();

    // Store in cache
    cache.stocks[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Error fetching stock data', message: error.message });
  }
});

/**
 * Get stock company information
 */
app.get('/api/stock-info', async (req, res) => {
  const symbol = req.query.symbol || 'AAPL';
  
  // Check cache first
  if (cache.stockInfo[symbol] && cache.stockInfo[symbol].timestamp > Date.now() - CACHE_TTL.stockInfo) {
    console.log(`Serving cached company info for ${symbol}`);
    return res.json(cache.stockInfo[symbol].data);
  }
  
  try {
    // Use queue to prevent rate limiting
    const response = await queueApiRequest(() => axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: API_KEY
      }
    }));

    if (response.data['Error Message']) {
      console.error('Error fetching stock info:', response.data['Error Message']);
      return res.status(500).json({ 
        error: 'Error fetching stock info', 
        message: response.data['Error Message'] 
      });
    }

    if (response.data['Note']) {
      console.warn('API call frequency warning:', response.data['Note']);
    }

    // Store in cache
    cache.stockInfo[symbol] = {
      data: response.data,
      timestamp: Date.now()
    };

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock info:', error.message);
    res.status(500).json({ error: 'Error fetching stock info', message: error.message });
  }
});

/**
 * Get top performing stocks (mock data)
 */
app.get('/api/top-performers', (req, res) => {
  const topPerformers = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.45, priceChange: 10, marketCap: 2000 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.10, priceChange: 8, marketCap: 1800 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 155.70, priceChange: 7, marketCap: 1500 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.30, priceChange: 6, marketCap: 1400 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 180.20, priceChange: 5, marketCap: 1000 }
  ];
  res.json(topPerformers);
});

/**
 * Get stocks with biggest market cap (mock data)
 */
app.get('/api/biggest-market-cap', (req, res) => {
  const biggestMarketCap = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.45, priceChange: 1.2, marketCap: 2000 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.10, priceChange: 0.8, marketCap: 1800 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 155.70, priceChange: 0.7, marketCap: 1500 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.30, priceChange: 0.6, marketCap: 1400 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 180.20, priceChange: 0.5, marketCap: 1000 }
  ];
  res.json(biggestMarketCap);
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cacheStats: {
      stocks: Object.keys(cache.stocks).length,
      stockInfo: Object.keys(cache.stockInfo).length
    },
    queueLength: apiQueue.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API rate limiting protection active - requests will be queued`);
});
