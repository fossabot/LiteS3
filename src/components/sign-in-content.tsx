"use client";

import { SignInForm } from "@/components/sign-in-form";
import { useTranslation } from "@/hooks/use-translation";

export function SignInContent() {
  const { t } = useTranslation();

  return (
    <>
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 xl:px-24">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-brand-indigo flex items-center justify-center">
              <span className="text-white font-medium text-lg">S3</span>
            </div>
            <span className="text-2xl font-medium text-text-primary" style={{ letterSpacing: "-0.704px" }}>S3 Manager</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-medium text-text-primary leading-tight whitespace-pre-line" style={{ letterSpacing: "-1.056px" }}>
            {t("auth.heroTitle")}
          </h1>
          <p className="text-text-tertiary text-lg mt-6 leading-relaxed">
            {t("auth.heroDesc")}
          </p>
          <div className="flex items-center gap-6 flex-wrap mt-10 text-sm text-text-quaternary">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="h-2 w-2 rounded-full bg-success-green" />
              <span>{t("auth.featureBuckets")}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="h-2 w-2 rounded-full bg-success-green" />
              <span>{t("auth.featurePreview")}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="h-2 w-2 rounded-full bg-success-green" />
              <span>{t("auth.featureBatch")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex flex-col items-center gap-5 mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-indigo/20 rounded-2xl blur-xl" />
              <div className="relative h-16 w-16 rounded-2xl bg-brand-indigo flex items-center justify-center shadow-lg">
                <span className="text-white font-medium text-2xl">S3</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-medium text-text-primary" style={{ letterSpacing: "-0.704px" }}>
                S3 Manager
              </h1>
              <p className="text-text-tertiary text-sm mt-2">{t("auth.heroTitleMobileDesc")}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-quaternary">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-green" />
                <span>{t("auth.featureBucketsShort")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-green" />
                <span>{t("auth.featurePreviewShort")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-green" />
                <span>{t("auth.featureBatchShort")}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-xl border border-border-subtle p-6 shadow-elevated">
            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-medium text-text-primary">{t("auth.welcomeBack")}</h2>
              <p className="text-text-tertiary text-sm mt-1">{t("auth.enterCredentials")}</p>
            </div>
            <SignInForm />
          </div>

          <p className="text-center text-xs text-text-quaternary mt-6">
            {t("auth.secureLogin")}
          </p>
        </div>
      </div>
    </>
  );
}
