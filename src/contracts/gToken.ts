import { parseEther } from '@ethersproject/units';
import Contract from '../contract';

export class gToken extends Contract {
  protected name: any = 'gToken';

  public async pools(token: string, pool: string): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(token, abi);
    return contract.pools(pool);
  }

  public async deposit(token: string, amount: string): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(token, abi);
    return contract.deposit(parseEther(amount));
  }

  public async withdraw(token: string, amount: string): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(token, abi);
    return contract.withdraw(parseEther(amount));
  }

  public async donate(token: string, amount: string): Promise<any> {
    const abi: any = this.getAbi(this.name);
    const contract = this.getContract(token, abi);
    return contract.donate(parseEther(amount));
  }
}
