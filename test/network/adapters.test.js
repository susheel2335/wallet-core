import { Networking, Coin } from '../../lib';

const networkAdapter = Networking.Adapter.getNetworkAdapter(Coin.makeCoin(Coin.Unit.BTC), 0);
