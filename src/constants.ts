export const Settings: any = {
  DefaultChain: 80001,
  Chains: {
    80001: {
      chainId: '0x13881',
      chainName: 'Mumbai',
      rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
      infuraId: '',
    },
    137: {
      chainId: '0x89',
      chainName: 'Polygon',
      rpcUrls: ['https://polygon-rpc.com/'],
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
    80001: {},
    137: {},
  },
  Wallets: {
    WalletConnect: {
      rpc: {
        80001: 'https://matic-mumbai.chainstacklabs.com',
        137: 'https://polygon-rpc.com/',
      },
    },
  },
  Contracts: {
    80001: {
      Stats: '0x2Ac70212948Aa2507f1e79372610834aa9E8F9a9',
    },
    137: {
      Token: '0x1ba1ca0a11053e697c5cdf9ddb776ee5119e64a4',
    },
  },
};
