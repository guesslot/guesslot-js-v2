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
    for (const key in resp.data) {
      resp.data[key.toLowerCase()] = resp.data[key];
      delete resp.data[key];
    }
    this.events = resp.data;
  }

  public async getEvents(status: string = 'Predicting', skip: number = 0): Promise<any> {
    await this.initEvents();
    let where = '{ status_gt: 3 }';
    const time = parseInt(Date.now() / 1000 + '');

    switch (status) {
      case 'Predicting':
        where = '{ status_gt: 0, endTime_gte: ' + time + ', startTime_lte: ' + time + ' }';
        break;

      case 'Pending':
        where = '{ status_gt: 0, endTime_lt: ' + time + ' }';
        break;

      case 'Finalized':
        where = '{ status_gt: 0, settleTime_lt: ' + time + ' }';
        break;
    }

    const query: string =
      'query ($skip: Int!) {data:events(first: 100, skip: $skip, orderBy: startTime, orderDirection: desc, where: ' +
      where +
      ') {token, pool, name, epoch, startTime, endTime, settleTime, count, stakes}}';
    return this.request(query, { skip: skip }).then((data: any) => {
      const items: any = [];
      data.forEach((item: any) => {
        const evt: any = this.events[item.pool];
        if (evt) {
          item = Object.assign(item, evt[item.name]);
          item.status = status;
          items.push(item);
        }
      });
      return items;
    });
  }

  public async getHistory(account: string = '', skip: number = 0): Promise<any> {
    if (!account) return;

    await this.initEvents();
    const query: string =
      'query ($account: String!, $skip: Int!) {data:predicts(first: 1000, skip: $skip, orderBy: time, orderDirection: desc, where: { account: $account }) { account claimed event { pool name epoch result { value } stakes token rewards refunded status } result { value status }, stakes, time }}';
    return this.request(query, { account: account, skip: skip }).then((data: any) => {
      const items: any = [];

      for (const predict of data) {
        const events: any = this.events[predict.event.pool];
        if (!events) continue;

        const event: any = events[predict.event.name];
        if (!event) continue;

        const item: any = {};
        item.pool = predict.event.token;
        item.object = predict.event.name;
        item.result = event.options[predict.result.value];
        item.claimed = predict.claimed;
        item.refunded = predict.event.refunded;
        item.epoch = predict.event.epoch.toString().padStart(4, '0');

        if (predict.claimed) {
          item.status = 'Claimed';
        } else if (predict.event.status == 2) {
          item.status = predict.result.status == 1 ? 'Won' : 'Close';
        } else {
          item.status = 'Predicting';
        }

        items.push(item);
      }
      return items;
    });
  }

  public async getWinners(skip: number = 0): Promise<any> {
    await this.initEvents();
    const query: string =
      'query ($skip: Int!) {data:predicts(first: 1000, skip: $skip, orderBy: time, orderDirection: desc, where: { result_: { status: 1 } }) { account claimed event { pool name epoch result { value } stakes token rewards refunded status } result { value status }, stakes, time }}';
    return this.request(query, { skip: skip }).then((data: any) => {
      const items: any = [];

      for (const predict of data) {
        const events: any = this.events[predict.event.pool];
        if (!events) continue;

        const event: any = events[predict.event.name];
        if (!event) continue;

        const item: any = {};
        item.account = predict.account;
        item.pool = predict.event.token;
        item.object = predict.event.name;
        item.result = event.options[predict.result.value];
        item.claimed = predict.claimed;
        item.refunded = predict.event.refunded;
        item.epoch = predict.event.epoch.toString().padStart(4, '0');
        item.time = predict.time;

        if (predict.claimed) {
          item.status = 'Claimed';
        } else if (predict.event.status == 2) {
          item.status = predict.result.status == 1 ? 'Won' : 'Close';
        } else {
          item.status = 'Predicting';
        }

        items.push(item);
      }
      return items;
    });
  }
}
