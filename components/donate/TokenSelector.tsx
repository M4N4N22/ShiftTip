import AsyncSelect from "react-select/async";
import { Label } from "@/components/ui/label";
import { TokenBalance } from "@/lib/fetchTokenBalance";

interface TokenSelectorProps {
  selectedTokenChain: TokenBalance | null;
  setSelectedTokenChain: (token: TokenBalance | null) => void;
  allTokens: TokenBalance[];
  loading: boolean;
  balances: TokenBalance[];
  loadingBalance: boolean;
}

export const TokenSelector = ({
  selectedTokenChain,
  setSelectedTokenChain,
  allTokens,
  loading,
  balances,
  loadingBalance,
}: TokenSelectorProps) => {
  const defaultPopularTokens: TokenBalance[] = [
    {
      symbol: "ETH",
      chain: "Ethereum",
      contractAddress: "",
      balance: 0,
      usdValue: 0,
      decimals: 18,
    },
    {
      symbol: "USDC",
      chain: "Ethereum",
      contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      balance: 0,
      usdValue: 0,
      decimals: 6,
    },
    {
      symbol: "MATIC",
      chain: "Polygon",
      contractAddress: "",
      balance: 0,
      usdValue: 0,
      decimals: 18,
    },
    {
      symbol: "USDT",
      chain: "Polygon",
      contractAddress: "0x3813e82e6f7098b9583FC0F33a962D02018B6803",
      balance: 0,
      usdValue: 0,
      decimals: 6,
    },
    {
      symbol: "BNB",
      chain: "BSC",
      contractAddress: "",
      balance: 0,
      usdValue: 0,
      decimals: 18,
    },
  ];
  const loadTokenOptions = async (inputValue: string) => {
    const options = [
      ...defaultPopularTokens,
      ...allTokens.filter(
        (t) =>
          !defaultPopularTokens.some(
            (p) => p.symbol === t.symbol && p.chain === t.chain
          )
      ),
    ];
    return options
      .filter(
        (t) =>
          t.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
          t.chain.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map((t) => ({
        value: `${t.symbol}-${t.chain}`,
        label: `${t.symbol.toUpperCase()} (${t.chain})`,
        token: t,
      }));
  };

  return (
    <div className="space-y-2">
      <Label>Select Token & Chain</Label>
      <AsyncSelect
        cacheOptions
        defaultOptions={defaultPopularTokens.map((t) => ({
          value: `${t.symbol}-${t.chain}`,
          label: `${t.symbol.toUpperCase()} (${t.chain})`,
          token: t,
        }))}
        loadOptions={loadTokenOptions}
        placeholder="Type to search..."
        value={
          selectedTokenChain
            ? {
                value: `${selectedTokenChain.symbol}-${selectedTokenChain.chain}`,
                label: `${selectedTokenChain.symbol.toUpperCase()} (${
                  selectedTokenChain.chain
                })`,
                token: selectedTokenChain,
              }
            : null
        }
        onChange={(selected: any) =>
          setSelectedTokenChain(selected?.token || null)
        }
        isDisabled={loading}
        styles={{
          control: (base: any) => ({
            ...base,
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "0.75rem",
            boxShadow: "none",
            padding: "0.25rem 0.5rem",
            color: "white",
          }),
          input: (base: any) => ({ ...base, color: "white" }),
          menu: (base: any) => ({
            ...base,
            backgroundColor: "rgba(0,0,0,0.8)",
            borderRadius: "1rem",
            backdropFilter: "blur(16px)",
          }),
          option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused
              ? "oklch(0.66 0.26 360)"
              : "transparent",
            color: state.isFocused ? "black" : "white",
            borderRadius: "0.75rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }),
          singleValue: (base: any) => ({ ...base, color: "white" }),
          placeholder: (base: any) => ({
            ...base,
            color: "rgba(255,255,255,0.6)",
          }),
          noOptionsMessage: (base: any) => ({
            ...base,
            color: "rgba(255,255,255,0.6)",
          }),
        }}
      />

      {loadingBalance && (
        <p className="text-xs text-muted-foreground">Fetching balance...</p>
      )}

      {selectedTokenChain && balances.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Wallet balance: {balances[0].balance} {selectedTokenChain.symbol} (~$
          {balances[0].usdValue.toFixed(2)})
        </p>
      )}
    </div>
  );
};
