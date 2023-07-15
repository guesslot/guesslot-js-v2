// import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import Contract from '../contract';
import Subgraph from '../subgraph';

export class Stats extends Contract {
  protected name: any = 'Stats';
  private subgraph: Subgraph = new Subgraph();

  private _getAsset(data: any, stakes: any): any {
    const assetStakes = data.tokenName
      ? data.assetStakes
      : stakes[data.assetAddress.toLowerCase()]
      ? parseUnits(stakes[data.assetAddress.toLowerCase()], 0)
      : parseUnits('0', 0);
    return {
      assetName: data.assetName,
      assetAddress: data.assetAddress,
      assetBalance: formatEther(data.assetBalance),
      assetStakes: formatEther(assetStakes),
      assetTotal: formatEther(data.assetBalance.add(assetStakes)),
      tokenName: data.tokenName ? data.tokenName : '',
      tokenAddress: data.tokenName ? data.tokenAddress : '',
      tokenBalance: formatEther(data.tokenBalance),
      price: formatUnits(data.price, 8),
    };
  }

  public async getAssets(account: string): Promise<any> {
    if (!account) account = AddressZero;
    const contract = await this.getContractByName();
    const stakes = await this.subgraph.getStakes(account);

    return contract.getAssets(account).then((data: any) => {
      const items: any = [];
      data.forEach((item: any) => {
        items.push(this._getAsset(item, stakes));
      });
      return items;
    });
  }

  public async getAsset(account: string, asset: string): Promise<any> {
    if (!account) account = AddressZero;
    const contract = await this.getContractByName();
    const stakes = await this.subgraph.getStakes(account);

    return contract.getAsset(account, asset).then((data: any) => {
      return this._getAsset(data, stakes);
    });
  }
}
