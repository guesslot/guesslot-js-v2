import axios from 'axios';
import { AddressZero } from '@ethersproject/constants';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import { Settings } from './constants';

export class Subgraph {
  private eventsApi: string = 'https://raw.githubusercontent.com/guesslot/guesslot-events/main/events.json';
  private noticesApi: string = 'https://raw.githubusercontent.com/guesslot/guesslot-events/main/notices.json';
  private events: any;

  private async request(query: string, data: any): Promise<any> {
    return axios
      .post(
        Settings.TheGraph,
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
    const resp: any = await axios.get(this.eventsApi);
    for (const key in resp.data) {
      resp.data[key.toLowerCase()] = resp.data[key];
      delete resp.data[key];
    }
    this.events = resp.data;
  }

  public async getNotices(): Promise<any> {
    const resp: any = await axios.get(this.noticesApi);
    return resp.data;
  }

  public async getSummary(): Promise<any> {
    const query: string = 'query {data:app(id:"guesslot") { pools, predicts, categories, winners }}';
    return this.request(query, {});
  }

  public async getEvent(pool: string, event: string, epoch: number): Promise<any> {
    await this.initEvents();
    pool = pool.toLowerCase();
    const id: string = pool + '-' + event + '-' + epoch;
    const query1: string =
      'query ($id: String!) {data:event(id:$id) {pool, name, category, epoch, startTime, endTime, settleTime, count, stakes, tokenName, token, results {value, count, stakes}, result {value, status, count, stakes}, rewards, status}}';
    const query2: string = 'query ($id: String!) {data:detail(id:$id) {data}}';

    return Promise.all([this.request(query1, { id: id }), this.request(query2, { id: id })]).then((data: any) => {
      if (!data[0]) return;

      const events: any = this.events[data[0].pool.toLowerCase()];
      if (!events) return;

      if (data[1]) {
        data[0].detail = JSON.parse(data[1].data);
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
      data.results[key].ratio = data.count == 0 ? 0 : (data.results[key].count / data.count) * 100;
      delete data.results[key].value;
      data.results[key].label = data.options[key];
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
    if (data.result) {
      data.result.stakes = formatEther(data.result.stakes);
      data.result.label = data.results[data.result.value].label;
    } else {
      data.result = { count: 0, stakes: '0.0', status: 0, value: 0, label: '' };
    }

    // if (data.status == 'Predicting') 
    //   data.endTime =  (data.tital.indexOf('ETH') !== -1) ? data.endTime + 3600 * 24 * 99 : data.endTime + 3600 * 24;

    return data;
  }

  public async getEvents(
    token: string,
    status: string,
    category: string[],
    keywords: string = '',
    skip: number = 0
  ): Promise<any> {
    await this.initEvents();
    let where = category.length == 0 ? '' : ', category_in: ' + JSON.stringify(category);
    const time = parseInt(Date.now() / 1000 + '');
    let sort = 'asc';

    switch (status) {
      case 'Predicting':
        where += ',status_gt: 0, startTime_lte: ' + time + ', endTime_gte: ' + time;
        break;

      case 'Pending':
        where += ',status_gt: 0, endTime_lte: ' + time + ', settleTime_gte: ' + time;
        sort = 'desc';
        break;

      case 'Finalized':
        where += ',status_gt: 0, settleTime_lt: ' + time;
        sort = 'desc';
        break;
    }

    const query: string =
      'query ($keywords: String!, $tokenName: String!, $skip: Int!) {data:events(first: 20, skip: $skip, orderBy: settleTime, orderDirection: ' + sort + ', where: {name_contains_nocase: $keywords, tokenName_contains_nocase: $tokenName' +
      where +
      '}) {token, pool, name, tokenName, category, epoch, startTime, endTime, settleTime, count, stakes, rewards, refunded}}';
    return this.request(query, { keywords: keywords, tokenName: token, skip: skip }).then((data: any) => {
      const items: any = [];
      data.forEach((item: any) => {
        const events: any = this.events[item.pool];
        if (events) {
          const event: any = events[item.name];
          if (event) {
            item = Object.assign(item, event);
            item.stakes = formatEther(item.stakes);
            item.rewards = formatEther(item.rewards);
            if (item.status == 2) {
              item.status = 'Finalized';
            } else if (item.startTime > time) {
              item.status = 'Upcoming';
            } else if (item.endTime > time) {
              item.status = 'Predicting';
            } else if (item.settleTime > time) {
              item.status = 'Pending';
            } else {
              item.status = 'Finalized';
            }
            items.push(item);
          }
        }
      });
      return items;
    });
  }

  public async getHistory(
    account: string = '',
    token: string = '',
    status: string = '',
    skip: number = 0
  ): Promise<any> {
    if (!account) account = AddressZero;
    account = account.toLowerCase();
    let where = '';
    let eventStatus = 1;

    switch (status) {
      case 'Won':
        eventStatus = 2;
        where = ', claimed: false, result_: { status: 1 }';
        break;

      case 'Ended':
        eventStatus = 2;
        where = ', claimed: false, result_: { status: 0 }';
        break;

      case 'Claimed':
        eventStatus = 2;
        where = ', claimed: true';
        break;

      case 'Predicting':
        where = ', event_: { status: 1 }';
        break;
    }

    await this.initEvents();
    const query: string =
      'query ($account: String!, $token: String!, $status: Int, $skip: Int!) {data:predicts(first: 20, skip: $skip, orderBy: time, orderDirection: desc, where: { account: $account, event_: { tokenName_contains_nocase: $token, status_gte: $status } ' +
      where +
      '}) { account, claimed, event { pool, name, epoch, tokenName, result { stakes }, rewards, refunded, status }, result { value, status }, stakes, time }}';
    return this.request(query, { account: account, token: token, status: eventStatus, skip: skip }).then(
      (data: any) => {
        const items: any = [];
        for (const predict of data) {
          const events: any = this.events[predict.event.pool];
          if (!events) continue;

          const event: any = events[predict.event.name];
          if (!event) continue;

          items.push(this._getPredict(predict, event));
        }
        return items;
      }
    );
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
    item.stakes = formatEther(predict.stakes);

    const rewards = parseUnits(predict.event.rewards, 0);
    const stakes = parseUnits(predict.stakes, 0);
    const totalStakes = predict.event.result ? parseUnits(predict.event.result.stakes, 0) : parseUnits('0', 0);
    item.rewards =
      totalStakes.isZero() || predict.result.status == 0
        ? formatEther('0')
        : formatEther(rewards.mul(stakes).div(totalStakes));

    if (predict.claimed) {
      item.status = 'Claimed';
    } else if (predict.event.status == 2) {
      item.status = predict.result.status == 1 ? 'Won' : 'Ended';
    } else {
      item.status = 'Predicting';
    }

    return item;
  }

  public async getWinners(skip: number = 0): Promise<any> {
    await this.initEvents();
    const query: string =
      'query ($skip: Int!) {data:predicts(first: 20, skip: $skip, orderBy: time, orderDirection: desc, where: { result_: { status: 1 } }) { account, claimed, event, { pool, name, epoch, tokenName, result { stakes }, rewards, refunded, status }, result { value, status }, stakes, time }}';
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
    if (!account) account = AddressZero;

    account = account.toLowerCase();
    const query: string =
      'query ($account: Bytes!) {data:predicts(first: 1000, where: {and: [{claimed: false, account: $account, event_: {tokenName_not_contains: "gUSDT"}}, {or: [{event_: {refunded: true}}, {event_: {status: 1}}, {event_: {status: 2}, result_: {status: 1}}]}]}) { stakes, event { token }}}';
    return this.request(query, { account: account }).then((data: any) => {
      const items: any = {};
      data.forEach((item: any) => {
        if (!items[item.event.token]) items[item.event.token] = parseUnits('0', 0);
        items[item.event.token] = items[item.event.token].add(parseUnits(item.stakes, 0));
      });
      return items;
    });
  }
}
