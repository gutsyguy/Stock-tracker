export interface AlpacaStockDataResponse {
  data: {
    bars: {
      [symbol: string]: AlpacaBar[];
    };
  };
}

export interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n: number;
  vw: number;
}

export interface YahooFinanceAssetProfileResponse {
  data: {
    assetProfile: AssetProfile;
  };
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
  executiveTeam: any[];
  maxAge: number;
}

export interface CompanyOfficer {
  name: string;
  age?: number;
  title?: string;
  yearBorn?: number;
  pay?: number;
  exercisedValue?: number;
  unexercisedValue?: number;
}

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

export interface ProcessedQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
}

export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}