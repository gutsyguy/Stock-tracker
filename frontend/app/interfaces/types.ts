export interface AMRNChartProps {
    stockData: StockData;
  }
  


export interface StockData {
    data: {
      chart: {
        result: ChartResult[];
        error: null | any;
      };
    };
  }
  
  interface ChartResult {
    meta: ChartMeta;
    timestamp: number[];
    events: {
      splits: {
        [key: string]: {
          date: number;
          numerator: number;
          denominator: number;
          splitRatio: string;
        };
      };
    };
    indicators: {
      quote: Quote[];
      adjclose: {
        adjclose: number[];
      }[];
    };
  }
  
  interface ChartMeta {
    currency: string;
    symbol: string;
    exchangeName: string;
    fullExchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    hasPrePostMarketData: boolean;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
    regularMarketPrice: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    longName: string;
    shortName: string;
    chartPreviousClose: number;
    priceHint: number;
    currentTradingPeriod: {
      pre: TradingPeriod;
      regular: TradingPeriod;
      post: TradingPeriod;
    };
    dataGranularity: string;
    range: string;
    validRanges: string[];
  }
  
  interface TradingPeriod {
    timezone: string;
    start: number;
    end: number;
    gmtoffset: number;
  }
  
interface Quote {
    volume: number[];
    close: number[];
    high: number[];
    low: number[];
    open: number[];
  }
  

export  interface SearchResults {
    data: {
      explains: any[]; // Assuming empty or unknown structure
      count: number;
      quotes: Quote[];
      news: NewsItem[];
    };
  }
  
  interface Quote {
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
    isYahooFinance: boolean;
  }
  
  interface NewsItem {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number;
    type: string;
    thumbnail: Thumbnail;
    relatedTickers: string[];
  }
  
  interface Thumbnail {
    resolutions: Resolution[];
  }
  
  interface Resolution {
    url: string;
    width: number;
    height: number;
    tag: string;
  }
  
  export type FundProfileResponse = {
    data: {
      quoteSummary: {
        result: [
          {
            fundProfile: {
              maxAge: number
              styleBoxUrl: string
              family: string
              categoryName: string
              legalType: string
              managementInfo: {
                managerName: string | null
                managerBio: string | null
                startdate: Record<string, unknown>
              }
              feesExpensesInvestment: FeeStructure
              feesExpensesInvestmentCat: FeeStructure
              initInvestment: Record<string, unknown>
              initIraInvestment: Record<string, unknown>
              initAipInvestment: Record<string, unknown>
              subseqInvestment: Record<string, unknown>
              subseqIraInvestment: Record<string, unknown>
              subseqAipInvestment: Record<string, unknown>
              brokerages: unknown[]
            }
            summaryProfile: {
              longBusinessSummary: string
              companyOfficers: unknown[]
              executiveTeam: unknown[]
              maxAge: number
            }
          }
        ]
        error: unknown | null
      }
    }
  }
  
  type FeeStructure = {
    annualReportExpenseRatio?: RatioField
    frontEndSalesLoad?: Record<string, unknown>
    deferredSalesLoad?: Record<string, unknown>
    twelveBOne?: Record<string, unknown>
    netExpRatio?: Record<string, unknown>
    grossExpRatio?: Record<string, unknown>
    annualHoldingsTurnover?: RatioField
    totalNetAssets?: NumericField
    projectionValues?: Record<string, unknown>
    projectionValuesCat?: Record<string, unknown>
  }
  
  type RatioField = {
    raw: number
    fmt: string
  }
  
  type NumericField = {
    raw: number
    fmt: string
  }