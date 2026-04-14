"use client";

import { useTranslations } from "next-intl";

import { createApplicationAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ApplicationFormProps {
  message?: string;
}

export function ApplicationForm({ message }: ApplicationFormProps) {
  const t = useTranslations("Applications");
  const common = useTranslations("Common");

  return (
    <form action={createApplicationAction} className="space-y-4">
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="company">
          {t("company")} <span className="text-rose-500">*</span>
        </label>
        <Input id="company" name="company" placeholder={t("targetCompany")} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="roleTitle">
          {t("roleTitle")} <span className="text-rose-500">*</span>
        </label>
        <Input id="roleTitle" name="roleTitle" placeholder={t("roleTitle")} required />
      </div>
      <Input name="location" placeholder={common("location")} />
      <Input name="sourceUrl" placeholder={t("jobPostUrl")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="salaryRange" placeholder={t("salaryRange")} />
        <Select name="status" defaultValue="WISHLIST">
          <option value="WISHLIST">{t("status.WISHLIST")}</option>
          <option value="APPLIED">{t("status.APPLIED")}</option>
          <option value="INTERVIEW">{t("status.INTERVIEW")}</option>
          <option value="OFFER">{t("status.OFFER")}</option>
          <option value="REJECTED">{t("status.REJECTED")}</option>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("requiredFields")}
      </p>
      <Button type="submit" className="w-full">
        {t("saveApplication")}
      </Button>
    </form>
  );
}
