import { Networking, Coin } from '../../';

const networkAdapter
    = Networking.Adapter.getNetworkAdapter(Coin.makeCoin(Coin.Unit.BTC), 0);
