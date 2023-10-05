import { AddressZero } from '@ethersproject/constants';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import { formatBytes32String } from '@ethersproject/strings';
import Contract from '../contract';
import { Subgraph } from '../subgraph';

export class Stats extends Contract {
  protected name: any = 'Stats';
  private subgraph: Subgraph = new Subgraph();

  private _getAsset(data: any, stakes: any): any {
    const assetStakes = data.tokenName
      ? data.assetStakes
      : stakes[data.assetAddress.toLowerCase()]
      ? stakes[data.assetAddress.toLowerCase()]
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

  public async getAssets(account: any): Promise<any> {
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

  public async getAsset(account: any, asset: string): Promise<any> {
    if (!account) account = AddressZero;
    const contract = await this.getContractByName();
    const stakes = await this.subgraph.getStakes(account);

    return contract.getAsset(account, asset).then((data: any) => {
      return this._getAsset(data, stakes);
    });
  }

  public async getEvent(account: any, pool: string, event: string, epoch: number): Promise<any> {
    if (!account) account = AddressZero;
    const contract = await this.getContractByName();
    const evt = await this.subgraph.getEvent(pool, event, epoch);

    const chainId: number = await this.getChainId();
    const assetPriceAbi: any = this.getAbi('AssetPrice');
    const assetPriceAddress: any = this.getSetting(chainId, 'AssetPrice');
    const assetPriceContract = this.getContract(assetPriceAddress, assetPriceAbi);

    const gTokenAbi: any = this.getAbi('gToken');
    const gTokenContract = this.getContract(evt.token, gTokenAbi);

    return contract.getAsset(account, evt.token).then(async (asset: any) => {
      evt.tokenBalance = formatEther(asset.assetBalance);
      if (evt.detail && evt.detail['lockedTime'] > 0)
        evt.detail.lastPrice = formatUnits(await assetPriceContract.getPrice(formatBytes32String(event)), 8);
      if (evt.status == 'Pending' && evt.tokenName == 'gUSDT') {
        const data = await Promise.all([gTokenContract.getRewards(pool), gTokenContract.pools(pool)]);
        const rewards: any = formatEther(data[0]);
        const totalStakes: any = formatEther(data[1].amount);
        evt.rewards = totalStakes == 0 ? 0 : (evt.stakes * rewards) / totalStakes;
      }
      return evt;
    });
  }
}
