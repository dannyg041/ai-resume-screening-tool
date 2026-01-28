import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client using Replit AI Integrations environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Jobs Routes ===
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  });

  // === Analysis Routes ===
  app.get(api.analyses.list.path, async (req, res) => {
    const analyses = await storage.getAnalyses();
    res.json(analyses);
  });

  app.get(api.analyses.get.path, async (req, res) => {
    const analysis = await storage.getAnalysis(Number(req.params.id));
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  });

  app.post(api.analyses.create.path, async (req, res) => {
    try {
      const input = api.analyses.create.input.parse(req.body);

      // 1. Get Job details
      const job = await storage.getJob(input.jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // 2. Create Resume record
      const resume = await storage.createResume({
        candidateName: input.candidateName,
        fileName: input.fileName,
        content: input.resumeText,
      });

      // 3. Create initial Analysis record (pending)
      let analysis = await storage.createAnalysis({
        jobId: job.id,
        resumeId: resume.id,
        status: "pending",
        matchScore: 0,
        summary: "Analysis in progress...",
      });

      // 4. Perform AI Analysis (async but we'll await it for now to keep it simple, or fire and forget if long)
      // For a better UX, we might want to return the pending analysis immediately and process in background.
      // But for this MVP, let's await it to show results immediately.

      const prompt = `
        You are an expert HR recruiter. Analyze the following resume against the job description.
        
        Job Title: ${job.title}
        Job Description: ${job.description}
        Requirements: ${job.requirements}
        
        Resume Content:
        ${input.resumeText}
        
        Provide the following in JSON format:
        - matchScore: integer from 0 to 100
        - summary: A brief summary of the fit (2-3 sentences)
        - strengths: Array of strings listing key matching skills/strengths
        - weaknesses: Array of strings listing gaps or weaknesses
        - missingQualifications: Array of strings listing specific missing requirements
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [
            { role: "system", content: "You are a helpful HR assistant. Output strictly valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        // 5. Update Analysis record
        analysis = await storage.updateAnalysis(analysis.id, {
          matchScore: result.matchScore || 0,
          summary: result.summary || "No summary provided.",
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || [],
          missingQualifications: result.missingQualifications || [],
          status: "completed",
        });

        res.status(201).json(analysis);

      } catch (aiError) {
        console.error("AI Analysis failed:", aiError);
        // Update status to failed
        await storage.updateAnalysis(analysis.id, {
          status: "failed",
          summary: "AI analysis failed. Please try again.",
        });
        res.status(500).json({ message: "AI Analysis failed" });
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const jobs = await storage.getJobs();
  if (jobs.length === 0) {
    console.log("Seeding database...");
    await storage.createJob({
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      description: "We are looking for an experienced Full Stack Engineer to join our team. You will be building scalable web applications using React and Node.js.",
      requirements: "- 5+ years of experience with JavaScript/TypeScript\n- Experience with React, Node.js, and PostgreSQL\n- Knowledge of cloud infrastructure (AWS/GCP)\n- Strong communication skills",
    });
    
    await storage.createJob({
      title: "Product Marketing Manager",
      department: "Marketing",
      description: "Join our marketing team to lead product launches and go-to-market strategies.",
      requirements: "- 3+ years in product marketing\n- Experience in B2B SaaS\n- Excellent writing and storytelling skills\n- Data-driven mindset",
    });
    console.log("Database seeded!");
  }
}
