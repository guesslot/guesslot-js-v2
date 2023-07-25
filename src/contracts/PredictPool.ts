import { parseEther } from '@ethersproject/units';
import { formatBytes32String } from '@ethersproject/strings';
import Contract from '../contract';

export class PredictPool extends Contract {
  protected name: any = 'PredictPool';

  public async predict(
    pool: string,
    token: string,
    event: string,
    stakes: string,
    result: number,
    isFreezePool: boolean
  ): Promise<any> {
    if (isFreezePool) {
      const abi: any = this.getAbi('gToken');
      const contract = this.getContract(token, abi);
      console.log(pool);
      return contract.predict(pool, formatBytes32String(event), parseEther(stakes), result);
    } else {
      const abi: any = this.getAbi(this.name);
      const contract = this.getContract(pool, abi);
      return contract.predict(formatBytes32String(event), parseEther(stakes), result);
    }
  }

  public async claim(pool: string, event: string, epoch: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.claim(epoch, formatBytes32String(event));
  }

  public async refund(pool: string, event: string, epoch: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.refund(epoch, formatBytes32String(event));
  }

  public async needApprove(token: string, spender: string, amount: string, isFreezePool?: boolean): Promise<boolean> {
    if (isFreezePool) return false;
    return super.needApprove(token, spender, amount);
  }
}
