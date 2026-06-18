export declare const BUDGET_USD: number;
export declare const MAX_CALL_USD: number;
export declare function amountSpent(): number;
export declare function discover(query: string, limit?: number): Promise<any>;
export declare function inspect(provider: string, endpoint: string): Promise<any>;
export declare function walletBalance(): Promise<any>;
export interface MonidPrice {
  type?: string;
  amount?: number;
  currency?: string;
}
export declare function run(args: {
  provider: string;
  endpoint: string;
  input?: Record<string, unknown>;
  price?: MonidPrice;
}): Promise<any>;
export declare const config: {
  BASE_URL: string;
  BUDGET_USD: number;
  MAX_CALL_USD: number;
  COST_LOG: string;
};
