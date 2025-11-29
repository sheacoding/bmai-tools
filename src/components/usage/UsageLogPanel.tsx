import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/api";

interface UsageLogPanelProps {
  onOpenChange?: (open: boolean) => void;
}

// 配置用量查询网址
const USAGE_LOG_URL = "https://claude.kun8.vip/admin-next/api-stats";

export const UsageLogPanel: React.FC<UsageLogPanelProps> = ({ onOpenChange }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // 用于刷新 iframe

  // 刷新 iframe
  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setKey((prev) => prev + 1);
  };

  // 在外部浏览器中打开
  const handleOpenExternal = async () => {
    try {
      await settingsApi.openExternal(USAGE_LOG_URL);
    } catch (error) {
      console.error("Failed to open external URL:", error);
    }
  };

  // iframe 加载完成
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // iframe 加载错误
  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {t("usageLog.description", { defaultValue: "查看 API 用量和算力消耗统计" })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            {t("common.refresh", { defaultValue: "刷新" })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            {t("usageLog.openInBrowser", { defaultValue: "浏览器打开" })}
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 relative rounded-lg border border-border overflow-hidden bg-background">
        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("usageLog.loading", { defaultValue: "正在加载用量数据..." })}
              </span>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("usageLog.loadError", { defaultValue: "加载失败" })}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("usageLog.loadErrorDesc", {
                    defaultValue: "无法加载用量页面，该网站可能禁止嵌入显示"
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  {t("common.retry", { defaultValue: "重试" })}
                </Button>
                <Button size="sm" onClick={handleOpenExternal}>
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  {t("usageLog.openInBrowser", { defaultValue: "浏览器打开" })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* iframe 嵌入网页 */}
        <iframe
          key={key}
          src={USAGE_LOG_URL}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={t("usageLog.title", { defaultValue: "用量查询" })}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default UsageLogPanel;
