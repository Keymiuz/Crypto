import React, { useEffect } from "react";
import { Box, Heading, Text, Hide } from "@chakra-ui/react";
import useAssetStore from "../../stores/useAssetStore";

const MarketTeaser = () => {
  // Access values directly from the store
  const { totalMarketCap, overallPercentChange, fetchAssets } = useAssetStore((state) => ({
    totalMarketCap: state.totalMarketCap,
    overallPercentChange: state.overallPercentChange,
    fetchAssets: state.fetchAssets,
  }));

  // Trigger assets fetch on component mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Adjusted check for undefined or null
  if (totalMarketCap === null || totalMarketCap === undefined || overallPercentChange === null || overallPercentChange === undefined) {
    return (
      <Box textAlign="center" my={4} mx={8}>
        Loading market data...
      </Box>
    );
  }

  const changeSign = overallPercentChange > 0 ? "+" : "";

  return (
    <Box textAlign="center" m={8}>
      <Hide below="md">
        <Heading mb={4} as="h1">
          Explore as 100 Principais Criptomoedas
        </Heading>
      </Hide>
      <Text fontSize="xl">
        Nossas 100 principais criptomoedas têm um valor de mercado total de{" "}
        <Text as="span" fontWeight="bold">
          ${totalMarketCap} Trilhões
        </Text>
        , uma{" "}
        <Text as="span" fontWeight="bold" color={overallPercentChange > 0 ? "green.400" : "red.400"}>
          {changeSign}
          {overallPercentChange}%
        </Text>{" "}
        mudança nas últimas 24 horas.
      </Text>
    </Box>
  );
};

export default MarketTeaser;
