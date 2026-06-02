"use client";

import { useState, useEffect } from "react";
import { Database, User, Check, AlertCircle, Loader2 } from "lucide-react";
import { ThemeMenu } from "@/components/theme-menu";
import { useTranslation } from "@/hooks/use-translation";

type Step = "database" | "admin" | "complete";

interface AdminConfig {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export default function SetupPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("database");
  const [databaseType, setDatabaseType] = useState<string>("sqlite-local");
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTested, setConnectionTested] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch("/api/setup");
        const data = await response.json();
        if (data.initialized) {
          window.location.href = "/auth/signin";
          return;
        }
        if (data.databaseType) {
          setDatabaseType(data.databaseType);
        }
      } catch (e) {
        console.error("Failed to check setup status", e);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkSetupStatus();
  }, []);

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-bg-marketing flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  const testConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "test-connection" }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionTested(true);
        if (data.databaseType) {
          setDatabaseType(data.databaseType);
        }
      } else {
        setError(data.error || "Connection failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    if (adminConfig.password !== adminConfig.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (adminConfig.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "initialize",
          admin: {
            username: adminConfig.username,
            password: adminConfig.password,
            email: adminConfig.email || undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("complete");
      } else {
        setError(data.error || "Initialization failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    window.location.href = "/auth/signin";
  };

  return (
    <div className="min-h-screen bg-bg-marketing flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeMenu />
      </div>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium text-text-primary tracking-tight mb-2">
            {t("setup.title")}
          </h1>
          <p className="text-text-tertiary">
            {t("setup.subtitle")}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {(["database", "admin", "complete"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-brand-indigo text-white"
                    : i < (["database", "admin", "complete"].indexOf(step))
                    ? "bg-success-green text-white"
                    : "bg-surface-elevated text-text-quaternary"
                }`}
              >
                {i < (["database", "admin", "complete"].indexOf(step)) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    i < (["database", "admin", "complete"].indexOf(step))
                      ? "bg-success-green"
                      : "bg-surface-elevated"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-bg-panel rounded-xl border border-border-standard p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === "database" && (
            <DatabaseStep
              databaseType={databaseType}
              connectionTested={connectionTested}
              onTest={testConnection}
              onNext={() => setStep("admin")}
              loading={loading}
            />
          )}

          {step === "admin" && (
            <AdminStep
              config={adminConfig}
              setConfig={setAdminConfig}
              onBack={() => setStep("database")}
              onSubmit={initializeSystem}
              loading={loading}
            />
          )}

          {step === "complete" && (
            <CompleteStep onComplete={handleComplete} />
          )}
        </div>
      </div>
    </div>
  );
}

function DatabaseStep({
  databaseType,
  connectionTested,
  onTest,
  onNext,
  loading,
}: {
  databaseType: string;
  connectionTested: boolean;
  onTest: () => void;
  onNext: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();

  const typeLabelKey = `setup.type_${databaseType}` as const;
  const typeLabel = t(typeLabelKey);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-hover-bg flex items-center justify-center">
          <Database className="w-5 h-5 text-brand-indigo" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-text-primary">{t("setup.databaseConfig")}</h2>
          <p className="text-sm text-text-tertiary">{t("setup.verifyConnection")}</p>
        </div>
      </div>

      <div className="px-4 py-3 rounded-lg bg-hover-bg border border-border-standard">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text-primary">{t("setup.currentDatabase")}</div>
            <div className="text-xs text-text-quaternary mt-0.5">{t("setup.driverFromEnv")}</div>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-brand-indigo/10 text-brand-indigo text-sm font-medium">
            {typeLabel}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onTest}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg bg-hover-bg text-text-secondary font-medium hover:bg-surface-elevated transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("setup.testing")}
            </span>
          ) : (
            t("setup.testConnection")
          )}
        </button>
        <button
          onClick={onNext}
          disabled={!connectionTested || loading}
          className="flex-1 px-4 py-2 rounded-lg bg-brand-indigo text-white font-medium hover:bg-accent-violet transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("setup.continue")}
        </button>
      </div>

      {connectionTested && (
        <div className="flex items-center gap-2 text-success-green text-sm">
          <Check className="w-4 h-4" />
          {t("setup.connectionSuccessful")}
        </div>
      )}
    </div>
  );
}

function AdminStep({
  config,
  setConfig,
  onBack,
  onSubmit,
  loading,
}: {
  config: AdminConfig;
  setConfig: React.Dispatch<React.SetStateAction<AdminConfig>>;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-hover-bg flex items-center justify-center">
          <User className="w-5 h-5 text-brand-indigo" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-text-primary">{t("setup.createAdmin")}</h2>
          <p className="text-sm text-text-tertiary">{t("setup.adminCredentials")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t("auth.username")}</label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="admin"
            required
            className="w-full px-3 py-2 rounded-lg bg-hover-bg border border-border-standard text-text-primary placeholder-text-quaternary focus:outline-none focus:border-brand-indigo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t("setup.email")}</label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => setConfig((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 rounded-lg bg-hover-bg border border-border-standard text-text-primary placeholder-text-quaternary focus:outline-none focus:border-brand-indigo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t("auth.password")}</label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full px-3 py-2 rounded-lg bg-hover-bg border border-border-standard text-text-primary placeholder-text-quaternary focus:outline-none focus:border-brand-indigo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t("setup.confirmPassword")}</label>
          <input
            type="password"
            value={config.confirmPassword}
            onChange={(e) => setConfig((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full px-3 py-2 rounded-lg bg-hover-bg border border-border-standard text-text-primary placeholder-text-quaternary focus:outline-none focus:border-brand-indigo"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 rounded-lg bg-hover-bg text-text-secondary font-medium hover:bg-surface-elevated transition-colors"
        >
          {t("setup.back")}
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !config.username || !config.password || !config.confirmPassword}
          className="flex-1 px-4 py-2 rounded-lg bg-brand-indigo text-white font-medium hover:bg-accent-violet transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("setup.initializing")}
            </span>
          ) : (
            t("setup.initialize")
          )}
        </button>
      </div>
    </div>
  );
}

function CompleteStep({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-success-green/10 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-success-green" />
      </div>
      <div>
        <h2 className="text-lg font-medium text-text-primary">{t("setup.setupComplete")}</h2>
        <p className="text-sm text-text-tertiary mt-1">{t("setup.setupCompleteDesc")}</p>
      </div>
      <button
        onClick={onComplete}
        className="w-full px-4 py-2 rounded-lg bg-brand-indigo text-white font-medium hover:bg-accent-violet transition-colors"
      >
        {t("setup.goToLogin")}
      </button>
    </div>
  );
}
