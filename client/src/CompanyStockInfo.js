import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useParams, useNavigate } from 'react-router-dom';
import './CompanyStockInfo.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CompanyStockInfo = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [stockInfo, setStockInfo] = useState({});
  const [timeRange, setTimeRange] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Mock data for additional information
  const mockDetails = {
    high: 0,
    low: 0,
    volume: '0',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: 'N/A',
    '52wHigh': 0,
    '52wLow': 0,
    beta: 'N/A',
    description: "Loading company description..."
  };

  const fetchStockData = useCallback(async (range) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/stocks`, {
        params: {
          symbol,
          range
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock price data:', error);
      throw error;
    }
  }, [symbol]);

  const fetchStockInfo = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/stock-info`, {
        params: {
          symbol
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock info:', error);
      throw error;
    }
  }, [symbol]);

  const fetchData = useCallback(async (range) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stock price data first
      const priceData = await fetchStockData(range);
      setStockData(priceData);
      
      // Then fetch company info (sequential to avoid rate limiting)
      try {
        const info = await fetchStockInfo();
        setStockInfo(info || {});
      } catch (infoError) {
        console.warn('Could not fetch company info, but price data is available:', infoError);
        // Don't set error state here, as we at least have price data
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // If we get a rate limiting error, retry after a delay
      if (error.response && (error.response.status === 429 || 
          (error.response.data && error.response.data.includes && error.response.data.includes('frequency')))) {
        
        if (retryCount < 3) {
          setError('Rate limit reached. Retrying in 5 seconds...');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchData(range);
          }, 5000);
        } else {
          setError('API rate limit reached. Please try again later.');
        }
      } else {
        setError('Failed to load stock data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchStockData, fetchStockInfo, retryCount, symbol]);

  useEffect(() => {
    fetchData(timeRange);
    // Reset retry count when changing time range
    setRetryCount(0);
  }, [fetchData, timeRange]);

  // Calculate current price and price change
  const currentPrice = stockData.length > 0 ? stockData[stockData.length - 1].close : 0;
  const previousPrice = stockData.length > 1 ? stockData[stockData.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const percentChange = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  
  // Calculate day's range
  const todayData = stockData.length > 0 ? stockData[stockData.length - 1] : { high: 0, low: 0 };
  const dayHigh = todayData.high || 0;
  const dayLow = todayData.low || 0;
  
  // Calculate volume
  const volume = todayData.volume ? formatVolume(todayData.volume) : '0';

  function formatVolume(volume) {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  const data = {
    labels: stockData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: `${symbol} Stock Price`,
        data: stockData.map(d => d.close),
        fill: {
          target: 'origin',
          above: 'rgba(34, 197, 94, 0.1)',   // Green with opacity
        },
        borderColor: '#22c55e',
        borderWidth: 2,
        tension: 0.1,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        reverse: true,
        grid: {
          color: 'rgba(74, 85, 104, 0.7)',
          drawBorder: false,
        },
        ticks: {
          color: '#e2e8f0',
          maxRotation: 45,
          minRotation: 45,
        }
      },
      y: {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Price ($)',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(74, 85, 104, 0.7)',
          drawBorder: false,
        },
        ticks: {
          color: '#e2e8f0',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#4a5568',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            const price = context.raw;
            return `Price: $${price.toFixed(2)}`;
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const handleRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <div className="stock-detail-page">
      <button className="back-button" onClick={handleBackClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h2 className="stock-name">{stockInfo.Name || symbol}</h2>
      <p className="stock-ticker">{symbol}</p>

      {/* Key Metrics Overview */}
      <div className="metrics-grid">
        <div className="metric-card">
          <p className="metric-label">Current Price</p>
          <p className="metric-value">${currentPrice.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Change (24h)</p>
          <p className={`metric-value ${priceChange >= 0 ? 'positive-change' : 'negative-change'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%)
          </p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Day's Range (H/L)</p>
          <p className="metric-value">${dayLow.toFixed(2)} - ${dayHigh.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Volume</p>
          <p className="metric-value">{volume}</p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <div className="time-range-buttons">
          {['1M', '3M', '6M', '1Y', '5Y'].map(range => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`range-button ${timeRange === range ? 'active' : ''}`}
            >
              {range}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="loading-indicator">Loading chart data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="chart-wrapper">
            <Line data={data} options={options} />
          </div>
        )}
      </div>

      {/* Additional Information Section */}
      <div className="info-grid">
        <div className="info-card">
          <h3 className="info-title">Key Statistics</h3>
          <ul className="stats-list">
            <li>P/E Ratio: <span>{stockInfo.PERatio || mockDetails.peRatio}</span></li>
            <li>EPS: <span>${stockInfo.EPS || mockDetails.eps}</span></li>
            <li>Dividend Yield: <span>{stockInfo.DividendYield || mockDetails.dividendYield}</span></li>
            <li>52-Week High: <span>${stockInfo['52WeekHigh'] || mockDetails['52wHigh']}</span></li>
            <li>52-Week Low: <span>${stockInfo['52WeekLow'] || mockDetails['52wLow']}</span></li>
            <li>Beta: <span>{stockInfo.Beta || mockDetails.beta}</span></li>
          </ul>
        </div>
        <div className="info-card">
          <h3 className="info-title">About Company</h3>
          <p className="company-description">
            {stockInfo.Description || "No company description available."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyStockInfo;
