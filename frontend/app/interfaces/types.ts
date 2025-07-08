export interface AlpacaStockDataResponse {
  data: {
    bars: {
      [symbol: string]: AlpacaBar[];
    };
  };
}

export interface AlpacaBar {
  t: string;     // ISO date string: "2025-07-07T08:00:00Z"
  o: number;     // open
  h: number;     // high
  l: number;     // low
  c: number;     // close
  v: number;     // volume
  n: number;     // number of trades
  vw: number;    // volume-weighted average price
}


export interface YahooFinanceSearchResponse {
  data: {
    explains: any[]; // Adjust if you know the type
    count: number;
    quotes: Quote[];
    news: NewsItem[];
    nav: any[];
    lists: any[];
    researchReports: any[];
    screenerFieldResults: any[];
    totalTime: number;
    timeTakenForQuotes: number;
    timeTakenForNews: number;
    timeTakenForAlgowatchlist: number;
    timeTakenForPredefinedScreener: number;
    timeTakenForCrunchbase: number;
    timeTakenForNav: number;
    timeTakenForResearchReports: number;
    timeTakenForScreenerField: number;
    timeTakenForCulturalAssets: number;
    timeTakenForSearchLists: number;
  };
}

export type Quote = YahooFinanceQuote | NonYahooFinanceQuote;

export interface YahooFinanceQuote {
  exchange: string;
  shortname: string;
  quoteType: string;
  symbol: string;
  index: string;
  score: number;
  typeDisp: string;
  longname: string;
  exchDisp: string;
  sector?: string;
  sectorDisp?: string;
  industry?: string;
  industryDisp?: string;
  dispSecIndFlag?: boolean;
  isYahooFinance: true;
}

export interface NonYahooFinanceQuote {
  index: string;
  name: string;
  permalink: string;
  isYahooFinance: false;
}

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: string; // or `Date` if you plan to parse it
  type: string;
  thumbnail: {
    resolutions: Resolution[];
  };
}

export interface Resolution {
  url: string;
  width: number;
  height: number;
  tag: string;
}


export interface CompanyOfficer {
  maxAge: number;
  name: string;
  age?: number;
  title: string;
  yearBorn?: number;
  fiscalYear: number;
  totalPay?: number;
  exercisedValue: number;
  unexercisedValue: number;
}

export interface AssetProfile {
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  website: string;
  industry: string;
  industryKey: string;
  industryDisp: string;
  sector: string;
  sectorKey: string;
  sectorDisp: string;
  longBusinessSummary: string;
  fullTimeEmployees: number;
  companyOfficers: CompanyOfficer[];
  auditRisk: number;
  boardRisk: number;
  compensationRisk: number;
  shareHolderRightsRisk: number;
  overallRisk: number;
  governanceEpochDate: string;
  compensationAsOfEpochDate: string;
  executiveTeam: any[]; // Adjust if structure known
  maxAge: number;
}

export interface YahooFinanceAssetProfileResponse {
  data: {
    assetProfile: AssetProfile;
  };
}