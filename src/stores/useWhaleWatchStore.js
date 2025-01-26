import { create } from "zustand";

const useWhaleWatchStore = create((set, get) => ({
  highestTransaction: null,
  lastTimestamp: 0,
  error: null,
  isLoading: true,
  fetchWhaleActivity: async () => {
    try {
      const transactionsResponse = await fetch("https://blockchain.info/unconfirmed-transactions?format=json");
      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch recent transactions");
      }
      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.txs;

      // Find the transaction with the highest value in the 'out' array
      const highestTx = transactions.reduce((prev, current) => {
        const prevHighestValue = prev.out.reduce((prevOut, currentOut) => Math.max(prevOut, currentOut.value), 0);
        const currentHighestValue = current.out.reduce((prevOut, currentOut) => Math.max(prevOut, currentOut.value), 0);
        return prevHighestValue > currentHighestValue ? prev : current;
      });

      // Find the highest value in the 'out' array of the highest transaction
      const highestValue = highestTx.out.reduce((prev, current) => Math.max(prev, current.value), 0);

      // If the highest transaction is older than the last timestamp, return
      if (highestTx.time <= get().lastTimestamp) {
        return;
      }

      const priceResponse = await fetch("https://api.coincap.io/v2/assets/bitcoin");
      if (!priceResponse.ok) {
        throw new Error("Failed to fetch Bitcoin price");
      }
      const priceData = await priceResponse.json();
      const bitcoinPrice = parseFloat(priceData.data.priceUsd);

      const usdAmount = (highestValue / 100000000) * bitcoinPrice;

      // Update the state only if the transaction is over 10 million for whales, or below 10 million for small fish
      if (usdAmount > 10000000) {
        set({
          highestTransaction: { ...highestTx, usdAmount },
          lastTimestamp: highestTx.time,
          error: null,
          isLoading: false,
          message: "As baleias de BTC estão fazendo ondas! 🌊 Aqui está a transação mais recente:",
        });
      } else if (usdAmount > 0) {
        set({
          highestTransaction: { ...highestTx, usdAmount },
          lastTimestamp: highestTx.time,
          error: null,
          isLoading: false,
          message: "Há peixes pequenos no mar!🐟 Continue observando os grandes.",
        });
      } else {
        set({
          highestTransaction: null, // Nenhuma transação encontrada
          lastTimestamp: highestTx.time,
          error: null,
          isLoading: false,
          message: "Nenhuma transação recente encontrada. Fique de olho na atividade das baleias!👀",
        });
      }
    } catch (error) {
      set({
        highestTransaction: null,
        error: error.message,
        isLoading: false,
      });
    }
  },
}));

export default useWhaleWatchStore;
