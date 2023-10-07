export const Settings: any = {
  DefaultChain: 80001,
  Chains: {
    80001: {
      chainId: '0x13881',
      chainName: 'Mumbai',
      // rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
      rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
      infuraId: '',
    },
  },
  Tokens: {
    80001: {},
  },
  Wallets: {
    WalletConnect: {
      rpc: {
        80001: 'https://matic-mumbai.chainstacklabs.com',
      },
    },
  },
  Contracts: {
    80001: {
      Stats: '0xCd392EC3422fbfbB49BE953E74DF3df56Dd002DF',
      AssetPrice: '0x83c8200F4B910833cD675524E60A0158677F8168',
      Vault: '0x79c72E7F78012Bacecb8F60A21F53193EfF4c198',
    },
  },
};
