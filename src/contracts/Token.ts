import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import Contract from '../contract';

export class Token extends Contract {
  protected name: any = 'Token';

  public async balanceOf(): Promise<any> {
    const chainId: number = await this.getChainId();
    const address: any = this.getSetting(chainId, 'Token');
    const abi: any = this.getAbi('ERC20');
    console.log(chainId, address, 'balanceOf');
    const contract = this.getContract(address, abi);
    const balance: BigNumber = await contract.balanceOf(address);
    return formatEther(balance);
  }
}
