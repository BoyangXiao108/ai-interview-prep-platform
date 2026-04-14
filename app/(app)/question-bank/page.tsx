import { auth } from "@/lib/auth";
import { getQuestionBankData } from "@/lib/questions/queries";
import { questionBankFilterSchema } from "@/lib/validations/questions";
import { QuestionSetList } from "@/components/question-bank/question-set-list";
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

  const { applications, questionSets } = await getQuestionBankData(
    session.user.id,
    filters,
  );

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
            Question bank
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            Browse saved and AI-generated practice prompts.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Review your generated question batches by application, category, difficulty,
            and type.
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-border/60 bg-white/70 p-5">
        <form className="grid gap-4 lg:grid-cols-4">
          <Select defaultValue={filters.applicationId ?? ""} name="applicationId">
            <option value="">All applications</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.company} · {application.roleTitle}
              </option>
            ))}
          </Select>
          <Select defaultValue={filters.category ?? "ALL"} name="category">
            <option value="ALL">All categories</option>
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="TECHNICAL">Technical</option>
            <option value="LEADERSHIP">Leadership</option>
            <option value="SYSTEM_DESIGN">System design</option>
          </Select>
          <Select defaultValue={filters.difficulty ?? "ALL"} name="difficulty">
            <option value="ALL">All difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </Select>
          <Select defaultValue={filters.type ?? "ALL"} name="type">
            <option value="ALL">All types</option>
            <option value="behavioral">Behavioral</option>
            <option value="technical">Technical</option>
            <option value="resume-based">Resume-based</option>
          </Select>
          <div className="lg:col-span-4 flex justify-end">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              type="submit"
            >
              Apply filters
            </button>
          </div>
        </form>
      </div>

      <QuestionSetList questionSets={questionSets} />
    </div>
  );
}
