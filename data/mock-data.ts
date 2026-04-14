import type {
  ActivityItem,
  ApplicationRecord,
  InterviewQuestion,
} from "@/types";

export const applicationStats = [
  { label: "Active applications", value: "18", trend: "+3 this week" },
  { label: "Interviews booked", value: "6", trend: "2 upcoming" },
  { label: "Questions generated", value: "126", trend: "+24 today" },
  { label: "Practice streak", value: "9 days", trend: "Best this month" },
];

export const applications: ApplicationRecord[] = [
  {
    id: "app-1",
    company: "Notion",
    role: "Product Engineer",
    location: "San Francisco, CA",
    status: "Interview",
    updatedAt: "2 hours ago",
    matchScore: 92,
  },
  {
    id: "app-2",
    company: "Ramp",
    role: "Frontend Engineer",
    location: "New York, NY",
    status: "Applied",
    updatedAt: "Yesterday",
    matchScore: 88,
  },
  {
    id: "app-3",
    company: "Vercel",
    role: "Full Stack Engineer",
    location: "Remote",
    status: "Wishlist",
    updatedAt: "3 days ago",
    matchScore: 95,
  },
  {
    id: "app-4",
    company: "Stripe",
    role: "Software Engineer",
    location: "Seattle, WA",
    status: "Offer",
    updatedAt: "Today",
    matchScore: 90,
  },
  {
    id: "app-5",
    company: "Figma",
    role: "Frontend Platform Engineer",
    location: "Remote",
    status: "Rejected",
    updatedAt: "4 days ago",
    matchScore: 84,
  },
];

export const activities: ActivityItem[] = [
  {
    id: "act-1",
    label: "Generated 12 backend-focused questions for Notion",
    timestamp: "25 minutes ago",
    type: "question",
  },
  {
    id: "act-2",
    label: "Completed mock interview session for Ramp",
    timestamp: "2 hours ago",
    type: "session",
  },
  {
    id: "act-3",
    label: "Moved Vercel to wishlist and added hiring manager note",
    timestamp: "Yesterday",
    type: "note",
  },
];

export const questionBank: InterviewQuestion[] = [
  {
    id: "q-1",
    prompt: "Walk me through a product decision you made with incomplete user data.",
    category: "Behavioral",
    difficulty: "Medium",
    source: "AI Generated",
  },
  {
    id: "q-2",
    prompt: "How would you optimize a React dashboard rendering thousands of application records?",
    category: "Technical",
    difficulty: "Hard",
    source: "Saved",
  },
  {
    id: "q-3",
    prompt: "Design a system for storing resumes, notes, and interview transcripts securely.",
    category: "System Design",
    difficulty: "Hard",
    source: "AI Generated",
  },
  {
    id: "q-4",
    prompt: "Tell me about a time you disagreed with a recruiter or hiring manager and how you handled it.",
    category: "Leadership",
    difficulty: "Easy",
    source: "Saved",
  },
];
