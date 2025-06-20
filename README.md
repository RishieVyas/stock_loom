# Stock Loom

A modern React application for viewing and analyzing stock data with real-time visualizations using data from the AlphaVantage API.

## Features

- **Real-time Stock Data**: View current and historical stock prices
- **Interactive Charts**: Analyze stock trends with interactive charts
- **Stock Search**: Search for stocks across NYSE and NASDAQ listings
- **Company Information**: View detailed company metrics and information
- **Responsive Design**: Works on desktop and mobile devices
- **Market Leaders**: Track top performers and market cap leaders

## Tech Stack

- **Frontend**: React.js, Chart.js, React Router
- **Backend**: Node.js, Express
- **API**: AlphaVantage for stock data
- **Data**: Complete NYSE and NASDAQ stock listings

## Environment Variables

This project uses environment variables to manage sensitive information like API keys. Before running the application, you need to set up these environment variables:

### Server Environment Variables

Create a `.env` file in the root directory with the following variables:

```
ALPHA_VANTAGE_API_KEY=your_api_key_here
PORT=5001
```

You can copy `.env.example` to `.env` and replace the values with your actual API key.

### Client Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```
REACT_APP_API_BASE_URL=http://localhost:5001/api
```

You can copy `client/.env.example` to `client/.env` and modify as needed.

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/stock-viewer.git
   cd stock-viewer
   ```

2. Install all dependencies:
   ```
   npm run install:all
   ```

3. Start the development server:
   ```
   npm run dev:all
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Production Build

To create a production build:

```
npm run build
```

Then start the server:

```
npm start
```

## Security Notes

- Never commit `.env` files to version control
- Always use environment variables for sensitive information
- Rotate API keys periodically for better security

## Screenshots

![Landing Page](https://github.com/user-attachments/assets/4f2f2b4a-78c4-46ec-96d5-e083dcec2e8d)
![Stock Details](https://github.com/user-attachments/assets/b7009533-120c-47ac-931d-4a6f8ff08018)
![Market Overview](https://github.com/user-attachments/assets/acb3e5b4-5648-4e7b-86ee-469073263e7f)

