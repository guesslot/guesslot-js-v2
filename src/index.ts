import * as Contracts from './contracts';
import Subgraph from './subgraph';

export * from './wallet';
export class dAppJS {
  [key: string]: any;

  constructor() {
    Object.keys(Contracts).forEach((contractName) => {
      const Contract: any = (<any>Contracts)[contractName];
      this[contractName] = (provider: any) => new Contract(provider);
    });
    this['Subgraph'] = () => new Subgraph();
  }
}
