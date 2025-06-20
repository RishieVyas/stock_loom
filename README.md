# Stock Loom

A real-time stock market tracking and visualization application that provides users with comprehensive stock data, market trends, and company information.

![Stock Loom Demo](./assets/StockLoomGIF.gif)

## Tech Stack

- **Frontend**: React, Chart.js, React Router, Axios
- **Backend**: Node.js, Express
- **APIs**: Alpha Vantage API for real-time stock data
- **Data Visualization**: Chart.js, D3.js

## Project Goal

Stock Loom aims to provide investors and financial enthusiasts with an intuitive platform to track stock market data, analyze trends, and make informed investment decisions. The application delivers real-time stock information, historical price data, and company fundamentals in a visually appealing interface.

## Application Flow

1. **User Interface**: Users can search for stocks, view market trends, and access detailed company information.
2. **Data Request**: When a user selects a stock, the frontend sends a request to the backend server.
3. **API Integration**: The backend fetches real-time and historical stock data from Alpha Vantage API.
4. **Data Processing**: The server processes and formats the data, implementing caching to optimize performance.
5. **Visualization**: The frontend renders the data using Chart.js to display interactive stock charts and company metrics.

## Setup Instructions

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Alpha Vantage API key (get one for free at [Alpha Vantage](https://www.alphavantage.co/support/#api-key))

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/RishieVyas/stock_loom.git
   cd stock_loom
   ```

2. Create a `.env` file in the root directory with your Alpha Vantage API key:
   ```
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

### Installation

1. Install dependencies for both server and client:
   ```
   npm run install:all
   ```

### Running the Application

1. Start both frontend and backend servers concurrently:
   ```
   npm run dev:all
   ```

2. Or run them separately:
   - Backend server: `npm run dev` (runs on port 5001)
   - Frontend server: `npm run client` (runs on port 3000)

3. Open your browser and navigate to `http://localhost:3000`

## Features

- Real-time stock price tracking
- Historical price data with customizable time ranges
- Company information and fundamentals
- Market trends and top performers
- Interactive charts and visualizations
- Stock search functionality

## Acknowledgments

- Data provided by [Alpha Vantage](https://www.alphavantage.co/)
