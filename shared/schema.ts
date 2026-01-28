import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department"),
  description: text("description").notNull(),
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  candidateName: text("candidate_name").notNull(),
  fileName: text("file_name"),
  content: text("content").notNull(), // Extracted text
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  matchScore: integer("match_score"), // 0-100
  summary: text("summary"),
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  missingQualifications: jsonb("missing_qualifications").$type<string[]>(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Base Schemas
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true, createdAt: true });

// Types
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Analysis Request Type (for the analyze endpoint)
export const analyzeRequestSchema = z.object({
  jobId: z.number(),
  resumeText: z.string(),
  candidateName: z.string(),
  fileName: z.string().optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
