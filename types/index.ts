export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export type QuestionCategory =
  | "Behavioral"
  | "Technical"
  | "System Design"
  | "Leadership";

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  updatedAt: string;
  matchScore: number;
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  source: "AI Generated" | "Saved";
}

export interface ActivityItem {
  id: string;
  label: string;
  timestamp: string;
  type: "application" | "question" | "session" | "note";
}
