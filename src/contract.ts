import { Contract as contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { getProvider } from './wallet';
import { Settings } from './constants';
import * as ABI from './abi';

export default abstract class Contract {
  protected provider: any;
  protected name: any;

  constructor(provider: any) {
    this.provider = provider ? provider : getProvider();
  }

  public getSetting(chainId: number, name: string): any {
    try {
      return Settings.Contracts[chainId][name];
    } catch (error) {}
    throw new Error('Chain not supported.');
  }

  protected getAddress(chainId: number, name: string = this.name): any {
    return this.getSetting(chainId, name);
  }

  protected getAbi(name: string): any {
    const abi: any = (<any>ABI)[name];
    if (abi) return abi;

    throw new Error('Module not implemented.');
  }

  protected getContract(address: string, abi: any): any {
    return new contract(address, abi, this.provider.getSigner());
  }

  protected async getContractByName(name: string = this.name): Promise<any> {
    const chainId: number = await this.getChainId();
    const address: any = this.getSetting(chainId, name);
    const abi: any = this.getAbi(name);
    return this.getContract(address, abi);
  }

  protected async getChainId(): Promise<any> {
    const chainId = await this.provider.send('eth_chainId', []);
    return parseInt(chainId);
  }

  protected async getAccount(): Promise<any> {
    return this.provider
      .getSigner()
      .getAddress()
      .catch(() => {
        return Promise.resolve(AddressZero);
      });
  }

  public async needApprove(account: string, token: string, spender: string): Promise<boolean> {
    if (!account) return false;

    const abi: any = this.getAbi('ERC20');
    const erc20: any = this.getContract(token, abi);

    const allowance: BigNumber = await erc20.allowance(account, spender);
    const value: BigNumber = await erc20.balanceOf(account);
    if (value == BigNumber.from(0)) return true;

    return allowance.lt(value);
  }

  public async approve(token: string, spender: string): Promise<any> {
    const abi: any = this.getAbi('ERC20');
    const erc20: any = this.getContract(token, abi);
    const amount: BigNumber = BigNumber.from('0x0000000000000000000000000000000000000000ffffffffffffffffffffffff');

    return erc20.approve(spender, amount);
  }

  public async tokenBalanceOf(token: string, account: string): Promise<any> {
    const chainId: number = await this.getChainId();
    const address: string = this.getSetting(chainId, token);
    const abi: any = this.getAbi('ERC20');
    const erc20: any = this.getContract(address, abi);

    return erc20.balanceOf(account);
  }
}
