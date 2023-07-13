export const Settings: any = {
  DefaultChain: 137,
  Chains: {
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
    1: {
      chainId: '0x1',
      chainName: 'Ethereum',
    },
  },
  Tokens: {
    137: {},
    80001: {},
  },
  Wallets: {
    WalletConnect: {
      rpc: {
        137: 'https://polygon-rpc.com/',
        80001: 'https://matic-mumbai.chainstacklabs.com',
      },
    },
  },
  Contracts: {
    137: {
      Token: '0x1ba1ca0a11053e697c5cdf9ddb776ee5119e64a4',
    },
  },
};
