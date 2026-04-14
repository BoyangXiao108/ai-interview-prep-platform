import { createApplicationAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ApplicationFormProps {
  message?: string;
}

export function ApplicationForm({ message }: ApplicationFormProps) {
  return (
    <form action={createApplicationAction} className="space-y-4">
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <Input name="company" placeholder="Target company" />
      <Input name="roleTitle" placeholder="Role title" />
      <Input name="location" placeholder="Location" />
      <Input name="sourceUrl" placeholder="Job post URL (optional)" />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="salaryRange" placeholder="Salary range (optional)" />
        <Select name="status" defaultValue="WISHLIST">
          <option value="WISHLIST">Wishlist</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Save application
      </Button>
    </form>
  );
}
