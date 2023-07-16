import axios from 'axios';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';

export class Subgraph {
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

  public async getEvent(pool: string, event: string, epoch: number): Promise<any> {
    await this.initEvents();
    pool = pool.toLocaleLowerCase();
    const id: string = pool + '-' + event + '-' + epoch;
    const query1: string =
      'query ($id: String!) {data:event(id:$id) {pool, name, category, epoch, startTime, endTime, settleTime, count, stakes, tokenName, token, results {value, count, stakes}, result {value, status, count, stakes}, rewards, status, isFreezePool}}';
    const query2: string = 'query ($id: String!) {data:detail(id:$id) {data}}';

    return Promise.all([this.request(query1, { id: id }), this.request(query2, { id: id })]).then((data: any) => {
      if (!data[0]) return;

      const events: any = this.events[data[0].pool.toLowerCase()];
      if (!events) return;

      if (data[1]) {
        data[0].detail = JSON.parse(data[1].data);
        console.log(data[0].detail);
        if (data[0].detail.lockedPrice) data[0].detail.lockedPrice = formatUnits(data[0].detail.lockedPrice, 8);
        if (data[0].detail.closedPrice) data[0].detail.closedPrice = formatUnits(data[0].detail.closedPrice, 8);
      }
      return this._getEvent(Object.assign(data[0], events[data[0].name]));
    });
  }

  private _getEvent(data: any): any {
    const time = parseInt(Date.now() / 1000 + '');
    const results: any = {};

    for (const result of data.results) {
      results[result.value] = result;
    }

    for (const key in data.options) {
      if (results[key]) {
        data.results[key] = results[key];
      } else {
        data.results[key] = { count: 0, stakes: 0 };
      }
      data.results[key].stakes = formatEther(data.results[key].stakes);
      delete data.results[key].value;
    }

    if (data.status == 2) {
      data.status = 'Finalized';
    } else if (data.startTime > time) {
      data.status = 'Upcoming';
    } else if (data.endTime > time) {
      data.status = 'Predicting';
    } else if (data.settleTime > time) {
      data.status = 'Pending';
    } else {
      data.status = 'Finalized';
    }

    data.stakes = formatEther(data.stakes);
    data.rewards = formatEther(data.rewards);
    if (data.result) data.result.stakes = formatEther(data.result.stakes);

    return data;
  }

  public async getEvents(
    token: string = 'gUSDT',
    status: string = 'Predicting',
    category: string = 'Crypto',
    skip: number = 0
  ): Promise<any> {
    await this.initEvents();
    let where = '';
    const time = parseInt(Date.now() / 1000 + '');

    switch (status) {
      case 'Predicting':
        where = ',status_gt: 0, startTime_lte: ' + time + ', endTime_gte: ' + time;
        break;

      case 'Pending':
        where = ',status_gt: 0, endTime_lte: ' + time + ', settleTime_gte: ' + time;
        break;

      case 'Finalized':
        where = ',status_gt: 0, settleTime_lt: ' + time;
        break;
    }

    const query: string =
      'query ($tokenName: String!, $category: String!, $skip: Int!) {data:events(first: 100, skip: $skip, orderBy: startTime, orderDirection: desc, where: {tokenName: $tokenName, category: $category' +
      where +
      '}) {token, pool, name, tokenName, category, epoch, startTime, endTime, settleTime, count, stakes, rewards, refunded, isFreezePool}}';
    return this.request(query, { tokenName: token, category: category, skip: skip }).then((data: any) => {
      const items: any = [];
      data.forEach((item: any) => {
        const evt: any = this.events[item.pool];
        if (evt) {
          item = Object.assign(item, evt[item.name]);
          item.status = status;
          item.tokenName = token;
          item.stakes = formatEther(item.stakes);
          item.rewards = formatEther(item.rewards);
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
      'query ($account: String!, $skip: Int!) {data:predicts(first: 1000, skip: $skip, orderBy: time, orderDirection: desc, where: { account: $account }) { account, claimed, event { pool, name, epoch, tokenName, result { stakes }, rewards, refunded, status }, result { value, status }, stakes, time }}';
    return this.request(query, { account: account, skip: skip }).then((data: any) => {
      const items: any = [];

      for (const predict of data) {
        const events: any = this.events[predict.event.pool];
        if (!events) continue;

        const event: any = events[predict.event.name];
        if (!event) continue;

        items.push(this._getPredict(predict, event));
      }
      return items;
    });
  }

  private _getPredict(predict: any, event: any): any {
    const item: any = {};
    item.pool = predict.event.pool;
    item.token = predict.event.tokenName;
    item.object = predict.event.name;
    item.account = predict.account;
    item.result = event.options[predict.result.value];
    item.claimed = predict.claimed;
    item.refunded = predict.event.refunded;
    item.epoch = predict.event.epoch;
    item.time = predict.time;

    const rewards = parseUnits(predict.event.rewards, 0);
    const stakes = parseUnits(predict.stakes, 0);
    const totalStakes = parseUnits(predict.event.result.stakes, 0);
    item.rewards = totalStakes.isZero() ? formatEther('0') : formatEther(rewards.mul(stakes).div(totalStakes));

    if (predict.claimed) {
      item.status = 'Claimed';
    } else if (predict.event.status == 2) {
      item.status = predict.result.status == 1 ? 'Won' : 'Close';
    } else {
      item.status = 'Predicting';
    }

    return item;
  }

  public async getWinners(skip: number = 0): Promise<any> {
    await this.initEvents();
    const query: string =
      'query ($skip: Int!) {data:predicts(first: 1000, skip: $skip, orderBy: time, orderDirection: desc, where: { result_: { status: 1 } }) { account, claimed, event, { pool, name, epoch, tokenName, result { stakes }, rewards, refunded, status }, result { value, status }, stakes, time }}';
    return this.request(query, { skip: skip }).then((data: any) => {
      const items: any = [];

      for (const predict of data) {
        const events: any = this.events[predict.event.pool];
        if (!events) continue;

        const event: any = events[predict.event.name];
        if (!event) continue;

        items.push(this._getPredict(predict, event));
      }
      return items;
    });
  }

  public async getStakes(account: string): Promise<any> {
    const query: string =
      'query ($account: Bytes!) {data:accountStakes(first: 1000, where: { account: $account }) { token amount }}';
    return this.request(query, { account: account }).then((data: any) => {
      const items: any = {};
      data.forEach((item: any) => {
        items[item.token] = item.amount;
      });
      return items;
    });
  }
}
