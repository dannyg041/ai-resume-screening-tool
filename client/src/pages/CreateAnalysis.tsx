import { useState } from "react";
import { useJobs } from "@/hooks/use-jobs";
import { useCreateAnalysis } from "@/hooks/use-analyses";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Wand2 } from "lucide-react";

export default function CreateAnalysis() {
  const { data: jobs } = useJobs();
  const createAnalysis = useCreateAnalysis();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [selectedJob, setSelectedJob] = useState<string>("");
  const [candidateName, setCandidateName] = useState("");
  const [resumeText, setResumeText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !resumeText || !candidateName) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all fields." });
      return;
    }

    createAnalysis.mutate({
      jobId: parseInt(selectedJob),
      candidateName,
      resumeText,
      fileName: "pasted-text.txt"
    }, {
      onSuccess: (data) => {
        toast({ title: "Analysis Complete", description: "Redirecting to results..." });
        setLocation(`/analysis/${data.id}`);
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Analysis Failed", description: error.message });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Analysis</h1>
          <p className="text-muted-foreground mt-1">Screen a candidate against job requirements using AI.</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Candidate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Position</Label>
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs?.map(job => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Candidate Name</Label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resume Content</Label>
                <div className="relative">
                  <Textarea 
                    className="min-h-[300px] font-mono text-sm leading-relaxed p-4" 
                    placeholder="Paste the full resume text here..." 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                    {resumeText.length} chars
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Copy and paste the text directly from the PDF or Word document.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto gap-2 text-lg px-8 shadow-xl shadow-primary/20"
                  type="submit"
                  disabled={createAnalysis.isPending}
                >
                  {createAnalysis.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" /> Analyze Candidate
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
