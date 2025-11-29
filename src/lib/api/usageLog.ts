import { invoke } from "@tauri-apps/api/core";

export interface UsageLogData {
  name?: string;
  id: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  description?: string;
  usage?: {
    total?: {
      requests?: number;
      inputTokens?: number;
      outputTokens?: number;
      cacheCreateTokens?: number;
      cacheReadTokens?: number;
      allTokens?: number;
      cost?: number;
      formattedCost?: string;
    };
  };
  limits?: {
    concurrencyLimit?: number;
    dailyCostLimit?: number;
    totalCostLimit?: number;
    currentDailyCost?: number;
    currentTotalCost?: number;
    weeklyOpusCost?: number;
  };
  accounts?: {
    claudeAccountId?: string;
    geminiAccountId?: string;
    openaiAccountId?: string;
  };
}

export interface UsageLogResult {
  success: boolean;
  data?: UsageLogData;
  error?: string;
}

export const usageLogApi = {
  async query(
    apiKey: string,
    baseUrl?: string,
    period?: string,
  ): Promise<UsageLogResult> {
    try {
      const result = await invoke<UsageLogResult>("query_api_usage", {
        apiKey,
        baseUrl: baseUrl || null,
        period: period || "daily",
      });
      return result;
    } catch (error: unknown) {
      return {
        success: false,
        error: typeof error === "string" ? error : String(error),
      };
    }
  },
};
