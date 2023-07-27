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
      Stats: '0xCd392EC3422fbfbB49BE953E74DF3df56Dd002DF',
      Vault: '0x79c72E7F78012Bacecb8F60A21F53193EfF4c198',
    },
  },
};
