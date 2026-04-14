import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { getQuestionBankData } from "@/lib/questions/queries";
import { questionBankFilterSchema } from "@/lib/validations/questions";
import { QuestionSetList } from "@/components/question-bank/question-set-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

interface QuestionBankPageProps {
  searchParams: Promise<{
    applicationId?: string;
    category?: string;
    difficulty?: string;
    type?: string;
    message?: string;
    generatedSetId?: string;
  }>;
}

export default async function QuestionBankPage({
  searchParams,
}: QuestionBankPageProps) {
  const t = await getTranslations("QuestionBank");
  const common = await getTranslations("Common");
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const rawSearchParams = await searchParams;
  const parsedFilters = questionBankFilterSchema.safeParse({
    applicationId: rawSearchParams.applicationId,
    category: rawSearchParams.category ?? "ALL",
    difficulty: rawSearchParams.difficulty ?? "ALL",
    type: rawSearchParams.type ?? "ALL",
  });
  const filters = parsedFilters.success
    ? parsedFilters.data
    : {
        applicationId: undefined,
        category: "ALL" as const,
        difficulty: "ALL" as const,
        type: "ALL" as const,
      };

  const { applications, questionSets, totalQuestionSets } = await getQuestionBankData(
    session.user.id,
    filters,
  );

  const activeFilterLabels = [
    filters.applicationId
      ? applications.find((application) => application.id === filters.applicationId)
        ? `${t("filterApplication")}: ${
            applications.find((application) => application.id === filters.applicationId)?.company
          }`
        : t("applicationFilter")
      : null,
    filters.category && filters.category !== "ALL"
      ? `${t("filterCategory")}: ${t(`category.${filters.category}`)}`
      : null,
    filters.difficulty && filters.difficulty !== "ALL"
      ? `${t("filterDifficulty")}: ${t(`difficulty.${filters.difficulty}`)}`
      : null,
    filters.type && filters.type !== "ALL" ? `${t("filterType")}: ${t(`type.${filters.type}`)}` : null,
  ].filter(Boolean) as string[];
  const hasActiveFilters = activeFilterLabels.length > 0;

  return (
    <div className="space-y-6">
      {rawSearchParams.message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {rawSearchParams.message}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {t("label")}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-border/60 bg-white/70 p-5">
        <form className="grid gap-4 lg:grid-cols-4">
          <Select defaultValue={filters.applicationId ?? ""} name="applicationId">
            <option value="">{common("allApplications")}</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.company} · {application.roleTitle}
              </option>
            ))}
          </Select>
          <Select defaultValue={filters.category ?? "ALL"} name="category">
            <option value="ALL">{common("allCategories")}</option>
            <option value="BEHAVIORAL">{t("category.BEHAVIORAL")}</option>
            <option value="TECHNICAL">{t("category.TECHNICAL")}</option>
            <option value="LEADERSHIP">{t("category.LEADERSHIP")}</option>
            <option value="SYSTEM_DESIGN">{t("category.SYSTEM_DESIGN")}</option>
          </Select>
          <Select defaultValue={filters.difficulty ?? "ALL"} name="difficulty">
            <option value="ALL">{common("allDifficulty")}</option>
            <option value="EASY">{t("difficulty.EASY")}</option>
            <option value="MEDIUM">{t("difficulty.MEDIUM")}</option>
            <option value="HARD">{t("difficulty.HARD")}</option>
          </Select>
          <Select defaultValue={filters.type ?? "ALL"} name="type">
            <option value="ALL">{common("allTypes")}</option>
            <option value="behavioral">{t("type.behavioral")}</option>
            <option value="technical">{t("type.technical")}</option>
            <option value="resume-based">{t("type.resume-based")}</option>
          </Select>
          <div className="lg:col-span-4 flex justify-end">
            <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground" type="submit">
              {t("applyFilters")}
            </button>
          </div>
        </form>
        {hasActiveFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">{t("activeFilters")}</p>
            {activeFilterLabels.map((label) => (
              <Badge key={label} tone="neutral">
                {label}
              </Badge>
            ))}
            <Button href="/question-bank" variant="ghost">
              {common("clearFilters")}
            </Button>
          </div>
        ) : null}
        {!applications.length ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("noApplications")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {t("visibleSets", { count: questionSets.length })}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? t("filteredFrom", { count: totalQuestionSets })
              : t("showingAll")}
          </p>
        </div>
      </div>

      <QuestionSetList
        emptyMessage={
          hasActiveFilters
            ? "No question sets match the current filters. Try clearing one of the filters or generate a new set from an application detail page."
            : "No question sets yet. Generate one from an application detail page once you have an application and job description ready."
        }
        highlightedSetId={rawSearchParams.generatedSetId}
        questionSets={questionSets}
      />
    </div>
  );
}
