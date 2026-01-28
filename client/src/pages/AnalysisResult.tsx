import { useAnalysis } from "@/hooks/use-analyses";
import { useJob } from "@/hooks/use-jobs";
import { Layout } from "@/components/Layout";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, AlertTriangle, Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function AnalysisResult() {
  const [, params] = useRoute("/analysis/:id");
  const id = parseInt(params?.id || "0");
  const { data: analysis, isLoading: loadingAnalysis } = useAnalysis(id);
  const { data: job, isLoading: loadingJob } = useJob(analysis?.jobId || 0);

  if (loadingAnalysis || loadingJob) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl col-span-2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!analysis) return <Layout><div>Analysis not found</div></Layout>;

  // Ensure JSON fields are parsed correctly (drizzle returns them as objects/arrays already)
  const strengths = (analysis.strengths as string[]) || [];
  const weaknesses = (analysis.weaknesses as string[]) || [];
  const missing = (analysis.missingQualifications as string[]) || [];

  const scoreData = [{
    name: "Match Score",
    value: analysis.matchScore || 0,
    fill: analysis.matchScore! >= 70 ? "hsl(var(--primary))" : 
          analysis.matchScore! >= 50 ? "hsl(24, 94%, 50%)" : "hsl(0, 84%, 60%)"
  }];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/analyze">
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{analysis.candidateName}</h1>
            <p className="text-muted-foreground">Applying for <span className="font-semibold text-foreground">{job?.title}</span></p>
          </div>
          <div className="ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="lg:col-span-1 border-border shadow-md">
            <CardHeader>
              <CardTitle>Match Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-0">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" cy="50%" 
                    innerRadius="80%" outerRadius="100%" 
                    barSize={20} 
                    data={scoreData} 
                    startAngle={90} 
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{analysis.matchScore}%</span>
                  <span className="text-sm text-muted-foreground">Match</span>
                </div>
              </div>
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Based on skills, experience, and education requirements.
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="lg:col-span-2 border-border shadow-md">
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" /> Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" /> Potential Gaps & Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {missing.length > 0 && (
            <Card className="md:col-span-2 border-l-4 border-l-red-500 shadow-sm bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" /> Missing Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {missing.map((item, i) => (
                    <Badge key={i} variant="destructive" className="px-3 py-1 text-sm font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
