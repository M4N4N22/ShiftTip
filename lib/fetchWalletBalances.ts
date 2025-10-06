// lib/fetchWalletBalances.ts
export interface TokenBalance {
    symbol: string;
    balance: number; 
    usdValue: number;
    chain: string;
  }
  
  const CHAINS = [
    { id: "1", name: "Ethereum", apiUrl: "https://api.covalenthq.com/v1/1/address" },
    { id: "137", name: "Polygon", apiUrl: "https://api.covalenthq.com/v1/137/address" },
    { id: "56", name: "BNB Chain", apiUrl: "https://api.covalenthq.com/v1/56/address" },
  ];
  
  export async function fetchWalletBalances(address: string): Promise<TokenBalance[]> {
    const allBalances: TokenBalance[] = [];
  
    await Promise.all(
      CHAINS.map(async (chain) => {
        try {
          const res = await fetch(
            `${chain.apiUrl}/${address}/balances_v2/?key=${process.env.NEXT_PUBLIC_COVALENT_KEY}`
          );
          const data = await res.json();
  
          data?.data?.items?.forEach((t: any) => {
            allBalances.push({
              symbol: t.contract_ticker_symbol?.toLowerCase(),
              balance: parseFloat(t.balance) / Math.pow(10, t.contract_decimals),
              usdValue: t.quote || 0,
              chain: chain.name,
            });
          });
        } catch (e) {
          console.error(`Failed fetching balances for ${chain.name}:`, e);
        }
      })
    );
  
    return allBalances;
  }
  