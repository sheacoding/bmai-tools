import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Key,
  Settings2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Activity,
  Zap,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi, usageLogApi } from "@/lib/api";
import type { UsageLogResult } from "@/lib/api/usageLog";

interface UsageLogPanelProps {
  onOpenChange?: (open: boolean) => void;
}

const DEFAULT_BASE_URL = "https://claude.kun8.vip";

export const UsageLogPanel: React.FC<UsageLogPanelProps> = () => {
  const { t } = useTranslation();

  // 配置状态
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [showApiKey, setShowApiKey] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);

  // 数据状态
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UsageLogResult | null>(null);

  // 加载保存的配置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsApi.get();
        if (settings.usageLogApiKey) {
          setApiKey(settings.usageLogApiKey);
          setConfigExpanded(false);
        }
        if (settings.usageLogBaseUrl) {
          setBaseUrl(settings.usageLogBaseUrl);
        }
        if (settings.usageLogPeriod) {
          setPeriod(settings.usageLogPeriod as "daily" | "monthly");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      const settings = await settingsApi.get();
      await settingsApi.save({
        ...settings,
        usageLogApiKey: apiKey,
        usageLogBaseUrl: baseUrl,
        usageLogPeriod: period,
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // 查询用量
  const handleQuery = async () => {
    if (!apiKey.trim()) return;

    setIsLoading(true);
    try {
      const res = await usageLogApi.query(apiKey, baseUrl, period);
      setResult(res);
      if (res.success) {
        setConfigExpanded(false);
      }
    } catch (error) {
      setResult({
        success: false,
        error: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  // 格式化数字
  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "-";
    return num.toLocaleString();
  };

  // 计算进度百分比
  const calcProgress = (current?: number, limit?: number) => {
    if (!current || !limit || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const data = result?.data;

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* 配置区域 */}
      <div className="mb-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Settings2 size={18} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">
                {t("usageLog.config.title", { defaultValue: "查询配置" })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {apiKey
                  ? t("usageLog.config.configured", { defaultValue: "已配置 API Key" })
                  : t("usageLog.config.notConfigured", { defaultValue: "请配置 API Key" })}
              </p>
            </div>
          </div>
          {configExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {configExpanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t("usageLog.config.apiKeyPlaceholder", {
                    defaultValue: "输入你的 API Key",
                  })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={DEFAULT_BASE_URL}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Period 选择 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("usageLog.config.period", { defaultValue: "统计周期" })}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod("daily")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    period === "daily"
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("usageLog.config.daily", { defaultValue: "日统计" })}
                </button>
                <button
                  onClick={() => setPeriod("monthly")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    period === "monthly"
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("usageLog.config.monthly", { defaultValue: "月统计" })}
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveConfig}
                className="flex-1"
              >
                <Save size={14} className="mr-1.5" />
                {configSaved
                  ? t("usageLog.config.saved", { defaultValue: "已保存" })
                  : t("usageLog.config.save", { defaultValue: "保存配置" })}
              </Button>
              <Button
                size="sm"
                onClick={handleQuery}
                disabled={!apiKey.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw size={14} className="mr-1.5" />
                )}
                {t("usageLog.config.query", { defaultValue: "查询用量" })}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">
              {t("usageLog.loading", { defaultValue: "正在查询用量数据..." })}
            </span>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {!isLoading && result && !result.success && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="p-4 rounded-full bg-red-500/10">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {t("usageLog.error.title", { defaultValue: "查询失败" })}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {result.error || t("usageLog.error.unknown", { defaultValue: "未知错误" })}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleQuery}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              {t("common.retry", { defaultValue: "重试" })}
            </Button>
          </div>
        </div>
      )}

      {/* 未配置状态 */}
      {!isLoading && !result && !apiKey && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="p-4 rounded-full bg-blue-500/10">
              <Key className="h-10 w-10 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {t("usageLog.empty.title", { defaultValue: "配置 API Key" })}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t("usageLog.empty.description", {
                  defaultValue: "请在上方配置区域输入你的 API Key 以查询用量统计",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 数据展示 */}
      {!isLoading && result?.success && data && (
        <div className="space-y-4">
          {/* 基本信息卡片 */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Activity size={18} />
              </div>
              <h3 className="font-medium text-foreground">
                {t("usageLog.info.title", { defaultValue: "基本信息" })}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("usageLog.info.name", { defaultValue: "名称" })}
                </p>
                <p className="text-sm font-medium">{data.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("usageLog.info.status", { defaultValue: "状态" })}
                </p>
                <div className="flex items-center gap-1.5">
                  {data.isActive ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">
                        {t("usageLog.info.active", { defaultValue: "启用" })}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        {t("usageLog.info.inactive", { defaultValue: "禁用" })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("usageLog.info.createdAt", { defaultValue: "创建时间" })}
                </p>
                <p className="text-sm">{formatDate(data.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("usageLog.info.expiresAt", { defaultValue: "过期时间" })}
                </p>
                <p className="text-sm">{formatDate(data.expiresAt)}</p>
              </div>
            </div>
          </div>

          {/* 使用量统计卡片 */}
          {data.usage?.total && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Zap size={18} />
                </div>
                <h3 className="font-medium text-foreground">
                  {t("usageLog.usage.title", { defaultValue: "使用量统计" })}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("usageLog.usage.requests", { defaultValue: "请求次数" })}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatNumber(data.usage.total.requests)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("usageLog.usage.inputTokens", { defaultValue: "输入 Token" })}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatNumber(data.usage.total.inputTokens)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("usageLog.usage.outputTokens", { defaultValue: "输出 Token" })}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatNumber(data.usage.total.outputTokens)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("usageLog.usage.cacheCreate", { defaultValue: "缓存创建" })}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatNumber(data.usage.total.cacheCreateTokens)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("usageLog.usage.cacheRead", { defaultValue: "缓存读取" })}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatNumber(data.usage.total.cacheReadTokens)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("usageLog.usage.totalTokens", { defaultValue: "总 Token" })}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatNumber(data.usage.total.allTokens)}
                  </p>
                </div>
              </div>
              {/* 费用 */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-blue-500" />
                    <span className="text-sm font-medium">
                      {t("usageLog.usage.totalCost", { defaultValue: "总费用" })}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-500">
                    {data.usage.total.formattedCost ||
                      `$${data.usage.total.cost?.toFixed(4) || "0"}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 限制信息卡片 */}
          {data.limits && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <Clock size={18} />
                </div>
                <h3 className="font-medium text-foreground">
                  {t("usageLog.limits.title", { defaultValue: "使用限制" })}
                </h3>
              </div>
              <div className="space-y-4">
                {/* 每日费用 */}
                {data.limits.dailyCostLimit !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">
                        {t("usageLog.limits.dailyCost", { defaultValue: "每日费用" })}
                      </span>
                      <span className="font-medium">
                        ${data.limits.currentDailyCost?.toFixed(4) || "0"} / $
                        {data.limits.dailyCostLimit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                        style={{
                          width: `${calcProgress(data.limits.currentDailyCost, data.limits.dailyCostLimit)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* 总费用 */}
                {data.limits.totalCostLimit !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">
                        {t("usageLog.limits.totalCost", { defaultValue: "总费用" })}
                      </span>
                      <span className="font-medium">
                        ${data.limits.currentTotalCost?.toFixed(4) || "0"} / $
                        {data.limits.totalCostLimit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all"
                        style={{
                          width: `${calcProgress(data.limits.currentTotalCost, data.limits.totalCostLimit)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* 并发限制 */}
                {data.limits.concurrencyLimit !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("usageLog.limits.concurrency", { defaultValue: "并发限制" })}
                    </span>
                    <span className="font-medium">{data.limits.concurrencyLimit}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 关联账户卡片 */}
          {data.accounts && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Users size={18} />
                </div>
                <h3 className="font-medium text-foreground">
                  {t("usageLog.accounts.title", { defaultValue: "关联账户" })}
                </h3>
              </div>
              <div className="space-y-3">
                {data.accounts.claudeAccountId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Claude</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {data.accounts.claudeAccountId}
                    </span>
                  </div>
                )}
                {data.accounts.geminiAccountId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gemini</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {data.accounts.geminiAccountId}
                    </span>
                  </div>
                )}
                {data.accounts.openaiAccountId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">OpenAI</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {data.accounts.openaiAccountId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 刷新按钮 */}
          <div className="flex justify-center pt-2 pb-4">
            <Button variant="outline" size="sm" onClick={handleQuery} disabled={isLoading}>
              <RefreshCw size={14} className={`mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              {t("usageLog.refresh", { defaultValue: "刷新数据" })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageLogPanel;
