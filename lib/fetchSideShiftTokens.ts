import { TokenBalance } from "./fetchTokenBalance";

export interface SideShiftCoin {
  coin: string;
  name: string;
  hasMemo: boolean;
  deprecated: boolean;
  fixedOnly: string[] | boolean;
  variableOnly: string[] | boolean;
  networks: string[];

  tokenDetails?: Record<
    string,
    {
      contractAddress: string;
      decimals?: number;
      networksWithMemo?: string[];
      depositOffline?: string[] | boolean;
      settleOffline?: string[] | boolean;
    }
  >;
}

export async function fetchSideShiftTokens(): Promise<TokenBalance[]> {
  try {
    console.log("Fetching SideShift coins...");
    const res = await fetch("https://sideshift.ai/api/v2/coins");
    const data: SideShiftCoin[] = await res.json();
    console.log(`Fetched ${data.length} coins from SideShift API`);

    const tokens: TokenBalance[] = [];

    data.forEach((coin) => {
      const details = coin.tokenDetails ?? {};

      Object.entries(details).forEach(([network, info]) => {
        if (!network || !info.contractAddress) {
          console.log(
            `Skipping ${coin.coin} on ${
              network || "unknown"
            }: missing network or contractAddress`,
            info
          );
          return;
        }

        const depositOnline =
          info.depositOffline !== true &&
          (!Array.isArray(info.depositOffline) ||
            info.depositOffline.length === 0);

        if (!depositOnline) {
          console.log(
            `Skipping ${coin.coin} on ${network}: depositOffline =`,
            info.depositOffline
          );
          return;
        }

        tokens.push({
          symbol: coin.coin,
          chain: network,
          contractAddress: info.contractAddress,
          decimals: info.decimals ?? 18,
          balance: 0,
          usdValue: 0,
        });

        console.log(`Added ${coin.coin} on ${network} to token list`);
      });
    });

    console.log(`Final tokens list contains ${tokens.length} entries`);
    return tokens;
  } catch (err) {
    console.error("Error fetching SideShift coins:", err);
    return [];
  }
}
