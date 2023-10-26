export const Settings: any = {
  TheGraph: 'https://api.thegraph.com/subgraphs/name/guesslot/polygon',
  DefaultChain: 137,
  Chains: {
    137: {
      chainId: '0x89',
      chainName: 'Polygon',
      rpcUrls: ['https://polygon-rpc.com'],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      blockExplorerUrls: ['https://polygonscan.com/'],
      infuraId: '',
    },
  },
  Tokens: {
    137: {},
  },
  Wallets: {
    WalletConnect: {
      rpc: {
        137: 'https://polygon-rpc.com',
      },
    },
  },
  Contracts: {
    137: {
      Stats: '0xb120c233770513bF7aeFD66Abd3a8130FB747DD2',
      AssetPrice: '0x31225a078B556Be86D06D69fFC5d9E26d0E05726',
      Vault: '0xaA70a0Dd94D7557E46F3B3Ac55ee6f76c1703De0',
    },
  },
};
