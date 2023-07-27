import Contract from '../contract';

export class Vault extends Contract {
  protected name: any = 'Vault';

  public async shares(token: string, account: string): Promise<any> {
    const contract = await this.getContractByName();
    return contract.shares(token, account).then((data: any) => {
      console.log(data);
    });
  }
}
