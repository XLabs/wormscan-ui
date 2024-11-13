import { ChainId } from "@wormhole-foundation/sdk";

export type TBy = "notional" | "tx";

// Top Address
export type GetTopAddress = {
  symbol: string;
  by: TBy;
};

export type GetTopAddressItem = {
  fromAddress: string;
  value: string;
};

export type GetTopAddressResult = GetTopAddressItem[];

// Transfer By Time
export type GetTransferByTime = {
  symbol: string;
  from: string;
  to: string;
  timeSpan: string;
  by: TBy;
};

export type GetTransferByTimeItem = {
  time: string;
  symbol: string;
  value: string;
};

export type GetTransferByTimeResult = GetTransferByTimeItem[];

// Activity
export type GetActivity = {
  symbol: string;
  by: TBy;
};

export type GetActivityItem = {
  emitterChain: ChainId;
  destinationChain: ChainId;
  symbol: string;
  value: string;
};

export type GetActivityResult = GetActivityItem[];

// Summary
export type GetSummary = {
  coingecko_id: string;
};

export type GetSummaryResult = {
  averageTransferSize?: string;
  medianTransferSize?: string;
  symbol: string;
  price: string;
  totalValueTokenTransferred: string;
  totalTokenTransferred: string;
  marketCap: string;
  circulatingSupply: string;
  totalSupply: string;
  fullyDilutedValuation: string;
  platforms: {
    [key: string]: string;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  links: {
    announcement_url: string[];
    bitcointalk_thread_identifier: null;
    blockchain_site: string[];
    chat_url: string[];
    facebook_username: string;
    homepage: string[];
    official_forum_url: string[];
    repos_url: {
      bitbucket: string[];
      github: string[];
    };
    subreddit_url: string;
    telegram_channel_identifier: string;
    twitter_screen_name: string;
    whitepaper: string;
  };
};

// List
export type GetListResult = {
  coingecko_id: string;
  symbol: string;
  fully_diluted_valuation: string;
  price: string;
  price_change_percentage_24h: string;
  volume_24h: string;
  total_value_locked: string;
  market_cap: string;
  circulating_supply: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
};

// Top Holder
export type GetTopHolder = {
  coingecko_id: string;
};

export type GetTopHolderItem = {
  address: string;
  chain: ChainId;
  volume: string;
};

export type GetTopHolderResult = GetTopHolderItem[];
