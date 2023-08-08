import { parseEther } from '@ethersproject/units';
import { formatBytes32String } from '@ethersproject/strings';
import Contract from '../contract';

export class Pool extends Contract {
  protected name: any = 'Pool';
  public async claimable(pool: string, account: string, event: string, epoch: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.claimable(account, epoch, formatBytes32String(event));
  }

  public async predict(pool: string, event: string, stakes: string, result: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.predict(formatBytes32String(event), parseEther(stakes), result);
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

  public async settleAll(pool: string, startNextEpoch: boolean): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.functions['settle()'](startNextEpoch);
  }

  public async settle(pool: string, event: string, result: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.settle(formatBytes32String(event), result);
  }
}
