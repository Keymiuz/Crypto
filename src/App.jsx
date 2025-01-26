import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Favorites from "./pages/Favorites.jsx";
import Header from "./components/layout/Header";
import CryptoDetails from "./pages/CryptoDetails";
import NewsPage from "./pages/NewsPage";
import useAssetStore from './stores/useAssetStore'; 
import useHistoricalBTCDataStore from './stores/useHistoricalBTCDataStore'; 

function App() {
  const assets = useAssetStore(state => state.assets);
  const fetchAssets = useAssetStore(state => state.fetchAssets);
  const fetchHistoricalBtcData = useHistoricalBTCDataStore(state => state.fetchHistoricalBtcData);

  useEffect(() => {
    fetchAssets();
    fetchHistoricalBtcData();
    const interval = setInterval(() => {
      fetchAssets();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAssets]);

  const calculateDominance = (assetSymbol) => {
    const totalMarketCap = assets.reduce((acc, asset) => acc + parseFloat(asset.marketCapUsd || 0), 0);
    const asset = assets.find((a) => a.symbol === assetSymbol);
    return asset ? ((parseFloat(asset.marketCapUsd) / totalMarketCap) * 100).toFixed(2) : "0";
  };

  const calculateTotalVolume = () => {
    const totalVolume = assets.reduce((acc, asset) => acc + parseFloat(asset.volumeUsd24Hr || 0), 0);
    return (totalVolume / 1e9).toFixed(2);
  };

  const calculateTotalMarketCap = () => {
    return assets.reduce((acc, asset) => acc + parseFloat(asset.marketCapUsd || 0), 0) / 1e12;
  };

  const calculateMarketDirection = (assetSymbol) => {
    const asset = assets.find((a) => a.symbol === assetSymbol);
    if (asset && !isNaN(parseFloat(asset.changePercent24Hr))) {
      return parseFloat(asset.changePercent24Hr) > 0 ? "up" : "down";
    }
    return "neutral";
  };

  const marketData = React.useMemo(
    () => ({
      btcDominance: calculateDominance("BTC"),
      ethDominance: calculateDominance("ETH"),
      totalVolume: calculateTotalVolume(),
      marketDirection: calculateMarketDirection("BTC"),
      totalMarketCap: calculateTotalMarketCap(),
    }),
    [assets],
  );

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Router>
        <Header/>
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/crypto/:id" element={<CryptoDetails />} />
          </Routes>
      </Router>
    </Box>
  );
}

export default App;