import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { InfuraProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Wallet as wallet } from '@ethersproject/wallet';
import { Settings } from './constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function getChains() {
  const chains: any = [];

  for (const chainId in Settings.Chains) {
    chains.push({ id: parseInt(chainId), name: Settings.Chains[chainId].chainName });
  }

  return chains;
}

export function getChainName(chainId: number) {
  const chain = Settings.Chains[chainId];
  return chain ? chain.chainName : undefined;
}

export function getProvider(privateKey: string = '', chainId: number = Settings.DefaultChain) {
  const chain: any = Settings.Chains[chainId];
  let provider: any = chain.infuraId
    ? new InfuraProvider(chainId, chain.infuraId)
    : new JsonRpcProvider(chain.rpcUrls[0], chainId);

  provider.getSigner = () => (privateKey ? new wallet(privateKey, provider) : provider);
  return provider;
}

export async function connectWallet(walletType: string) {
  let provider;
  switch (walletType) {
    case 'MetaMask':
      if (!window.ethereum)
        throw new Error(
          '<a href="https://metamask.io" style="color:#fff" target="_blank">Please install MetaMask!</a>'
        );

      window.ethereum.removeAllListeners();
      provider = new Web3Provider(window.ethereum, 'any');
      break;
    case 'WalletConnect':
      const _provider: any = new WalletConnectProvider(Settings.Wallets.WalletConnect);
      _provider.events.removeAllListeners('accountsChanged');
      _provider.events.removeAllListeners('chainChanged');
      _provider.events.removeAllListeners('disconnect');
      provider = new Web3Provider(_provider, 'any');
      break;
    default:
      throw new Error('Wallet not supported.');
  }

  await provider.send('eth_requestAccounts', []).catch((error: any) => {
    throw new Error(error.message);
  });

  return provider;
}

export async function updateWallet(provider: any) {
  if (!provider) return {};

  const [chain, accounts] = await Promise.all([provider.send('eth_chainId', []), provider.send('eth_accounts', [])]);
  return { chain, accounts };
}

export async function switchChain(provider: any, chainId: number = Settings.DefaultChain) {
  if (!provider) return;

  const chain: any = Settings.Chains[chainId];
  if (!chain) throw new Error('Chain not supported.');

  await provider.send('wallet_switchEthereumChain', [{ chainId: chain.chainId }]).catch((error: any) => {
    if (error.code == 4902 || error.code == -32000) {
      delete chain.infuraId;
      return provider.send('wallet_addEthereumChain', [chain]);
    }
    throw error;
  });
}

export async function addToken(provider: any, chainId: number = Settings.DefaultChain) {
  if (!provider) return;

  const token: any = Settings.Chains[chainId];
  if (!token) throw new Error('Chain not supported.');

  return provider.send('wallet_watchAsset', [token]);
}
