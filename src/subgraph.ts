import axios from 'axios';
import { AddressZero } from '@ethersproject/constants';
import { formatEther } from '@ethersproject/units';

export default class Subgraph {
  private api: string = 'https://api.thegraph.com/subgraphs/name/guesslot/v2';

  private async request(query: string, data: any): Promise<any> {
    if (!this.api) throw new Error('Subgraph Config Error');
    return axios
      .post(
        this.api,
        JSON.stringify({
          query: query,
          variables: data,
        })
      )
      .then((resp: any) => {
        if (resp.data.data) return resp.data.data.data;
        return Promise.reject(resp.data.errors);
      });
  }
}
