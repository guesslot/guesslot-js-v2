import { create } from 'zustand';
import { connectWallet, updateWallet, getChainName } from 'guesslot-js';

export const useWallet = create((set: any, get: any) => ({
  account: undefined,
  chainId: undefined,
  chainName: undefined,
  provider: undefined,

  connect: async (walletType: any = '') => {
    if (!walletType) walletType = localStorage.getItem('walletType');

    if (!walletType || get().account) return;

    const wallet: any = await connectWallet(walletType);
    const { chain, accounts } = await updateWallet(wallet);
    set({
      account: accounts[0],
      chainId: parseInt(chain),
      chainName: getChainName(parseInt(chain)),
      provider: wallet,
    });
    localStorage.setItem('walletType', walletType);

    wallet.provider.on('accountsChanged', async () => {
      if (!get().provider) return;

      const { accounts } = await updateWallet(wallet);
      set({ account: accounts[0] });
    });

    wallet.provider.on('chainChanged', async () => {
      if (!get().provider) return;

      const { chain } = await updateWallet(wallet);
      set({ chainId: parseInt(chain), chainName: getChainName(parseInt(chain)) });
    });

    if (walletType == 'WalletConnect')
      wallet.provider.on('disconnect', async () => {
        if (!get().provider) return;

        localStorage.removeItem('walletType');
        set({
          account: undefined,
          chainId: undefined,
          chainName: undefined,
          provider: undefined,
        });
      });
  },
  disconnect: async () => {
    if (!get().provider) return;

    if (get().provider?.provider?.disconnect) {
      await get().provider?.provider?.disconnect();
    } else {
      localStorage.removeItem('walletType');
      set({
        account: undefined,
        chainId: undefined,
        chainName: undefined,
        provider: undefined,
      });
    }
  },
}));
