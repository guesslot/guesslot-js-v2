import { parseEther } from '@ethersproject/units';
import Contract from '../contract';

export class PredictPool extends Contract {
  protected name: any = 'PredictPool';

  public async predict(pool: string, event: string, stakes: string, result: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.predict(event, parseEther(stakes), result);
  }

  public async claim(pool: string, event: string, epoch: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.claim(epoch, event);
  }

  public async refund(pool: string, event: string, epoch: number): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(pool, abi);
    return contract.refund(epoch, event);
  }
}
