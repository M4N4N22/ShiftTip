import { ethers } from "ethers";

export interface TokenBalance {
  symbol: string;
  chain: string;
  balance: number;
  usdValue: number;
  decimals: number;
  contractAddress: string;
}

/**
 * Fetch the balance and USD value of a token for a given wallet.
 * Supports native tokens (ETH, MATIC, BNB) and ERC20 tokens.
 *
 * @param walletAddress - wallet address
 * @param contractAddress - Token contract address 
 * @param chain - Chain name
 */
export async function fetchTokenBalance(
  walletAddress: string,
  contractAddress: string,
  chain: string
): Promise<TokenBalance> {
  // Configure RPC endpoints per chain
  const rpcProviders: Record<string, string> = {
    Ethereum: "https://eth.llamarpc.com", // or Infura/Alchemy
    Polygon: "https://polygon-rpc.com",
    BSC: "https://bsc-dataseed.binance.org",
  };

  const provider = new ethers.JsonRpcProvider(rpcProviders[chain]);
  let balance = 0;
  let decimals = 18;
  let symbol = "";

  if (!contractAddress) {
  
    balance = Number(ethers.formatEther(await provider.getBalance(walletAddress)));
    symbol = chain === "Polygon" ? "MATIC" : chain === "BSC" ? "BNB" : "ETH";
  } else {
   
    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ];
    const tokenContract = new ethers.Contract(contractAddress, erc20Abi, provider);
    const rawBalance = await tokenContract.balanceOf(walletAddress);
    decimals = await tokenContract.decimals();
    balance = Number(rawBalance) / 10 ** decimals;
    symbol = await tokenContract.symbol();
  }


  const priceIdMap: Record<string, string> = {
    ETH: "ethereum",
    MATIC: "matic-network",
    BNB: "binancecoin",
    USDC: "usd-coin",
    USDT: "tether",
  };
  const priceId = priceIdMap[symbol] || "";

  let usdValue = 0;
  if (priceId) {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${priceId}&vs_currencies=usd`);
      const data = await res.json();
      usdValue = data[priceId]?.usd ? balance * data[priceId].usd : 0;
    } catch (err) {
      console.error("CoinGecko price fetch error:", err);
    }
  }

  return {
    symbol,
    chain,
    balance,
    usdValue,
    decimals,
    contractAddress,
  };
}
