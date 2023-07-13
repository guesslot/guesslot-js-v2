import axios from 'axios';
// import { AddressZero } from '@ethersproject/constants';
// import { formatEther } from '@ethersproject/units';

export default class Subgraph {
  private thegraphApi: string = 'https://api.thegraph.com/subgraphs/name/guesslot/v2';
  private githubApi: string = 'https://raw.githubusercontent.com/guesslot/guesslot-events/main/events.json';
  private events: any;

  private async request(query: string, data: any): Promise<any> {
    return axios
      .post(
        this.thegraphApi,
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

  private async initEvents(): Promise<any> {
    if (this.events) return;
    const resp: any = await axios.get(this.githubApi);
    this.events = resp.data;
  }

  public async getEvents(skip: number = 0): Promise<any> {
    await this.initEvents();
    const query: string =
      'query ($skip: Int!) {data:events(first: 50, skip: $skip, orderBy: startTime, orderDirection: desc, where: {}) {token, pool, name, epoch, startTime, endTime, settleTime, count, stakes, status}}';
    return this.request(query, { skip: skip }).then((data: any) => {
      const items: any = [];
      data.forEach((item: any) => {
        const evt: any = this.events[item.pool];
        if (evt) items.push(Object.assign(item, evt[item.name]));
      });
      return items;
    });
  }
}
