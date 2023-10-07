import { reactive } from "vue";
import {
  connectWallet,
  updateWallet,
  getChainName,
  switchChain,
  Subgraph,
  Pool,
  Stats,
  gToken,
} from "guesslot-js";

export const useWallet = reactive({
  account: undefined,
  chainId: undefined,
  chainName: undefined,
  provider: undefined,

  connect: async (walletType: any = "") => {
    if (!walletType) walletType = localStorage.getItem("walletType");

    if (!walletType || useWallet.account) return;

    const wallet: any = await connectWallet(walletType);
    const { chain, accounts } = await updateWallet(wallet);

    useWallet.account = accounts[0];
    useWallet.chainId = parseInt(chain);
    useWallet.chainName = getChainName(parseInt(chain));
    if (!useWallet.chainName) switchChain(wallet);
    useWallet.provider = wallet;

    localStorage.setItem("walletType", walletType);

    wallet.provider.on("accountsChanged", async () => {
      if (!useWallet.provider) return;

      const { accounts } = await updateWallet(useWallet.provider);
      useWallet.account = accounts[0];
    });

    wallet.provider.on("chainChanged", async () => {
      if (!useWallet.provider) return;

      const { chain } = await updateWallet(useWallet.provider);
      useWallet.chainId = parseInt(chain);
      useWallet.chainName = getChainName(parseInt(chain));
    });

    if (walletType == "WalletConnect")
      wallet.provider.on("disconnect", async () => {
        if (!useWallet.provider) return;

        localStorage.removeItem("walletType");
        useWallet.account = undefined;
        useWallet.chainId = undefined;
        useWallet.chainName = undefined;
        useWallet.provider = undefined;
      });
  },

  disconnect: async () => {
    if (!useWallet.provider) return;

    try {
      await useWallet.provider.provider.disconnect();
    } catch (error) {
      localStorage.removeItem("walletType");
      useWallet.account = undefined;
      useWallet.chainId = undefined;
      useWallet.chainName = undefined;
      useWallet.provider = undefined;
    }
  },

  usePool: () => {
    return new Pool(useWallet.provider);
  },

  useStats: () => {
    return new Stats(useWallet.provider);
  },

  useSubgraph: () => {
    return new Subgraph();
  },

  useGToken: () => {
    return new gToken(useWallet.provider);
  },

  switchChain: (chainId: number) => {
    return switchChain(useWallet.provider, chainId);
  },
});
