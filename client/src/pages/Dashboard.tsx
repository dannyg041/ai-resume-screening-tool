import { useAnalyses } from "@/hooks/use-analyses";
import { useJobs } from "@/hooks/use-jobs";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: analyses, isLoading: loadingAnalyses } = useAnalyses();
  const { data: jobs, isLoading: loadingJobs } = useJobs();

  if (loadingAnalyses || loadingJobs) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  const recentAnalyses = analyses?.slice(0, 5) || [];
  const averageScore = analyses?.length 
    ? Math.round(analyses.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / analyses.length) 
    : 0;

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your hiring pipeline and recent screenings.</p>
        </div>
        <Link href="/analyze">
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
            + New Analysis
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Candidates" 
          value={analyses?.length || 0} 
          icon={Users} 
          trend="+12% this week"
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard 
          title="Active Jobs" 
          value={jobs?.length || 0} 
          icon={Briefcase} 
          trend="2 closing soon"
          color="bg-purple-500/10 text-purple-500"
        />
        <StatCard 
          title="Avg Match Score" 
          value={`${averageScore}%`} 
          icon={TrendingUp} 
          trend="Top quality candidates"
          color="bg-green-500/10 text-green-500"
        />
        <StatCard 
          title="Pending Review" 
          value={analyses?.filter(a => a.status === 'pending').length || 0} 
          icon={Clock} 
          trend="Action needed"
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Analyses</h2>
            <Link href="/analyze" className="text-primary hover:underline text-sm font-medium">View All</Link>
          </div>
          
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {recentAnalyses.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No analyses yet. Start by screening a candidate.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentAnalyses.map((analysis) => (
                  <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                    <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getScoreColor(analysis.matchScore || 0)}`}>
                          {analysis.matchScore}%
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            Candidate #{analysis.resumeId}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Job ID: {analysis.jobId} • {new Date(analysis.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
          <Card className="p-6 space-y-4 border-border shadow-sm hover:shadow-md transition-all">
            <h3 className="font-semibold">Create New Job</h3>
            <p className="text-sm text-muted-foreground">Define requirements for a new position to start screening candidates.</p>
            <Link href="/jobs">
              <button className="w-full py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors">
                Manage Jobs
              </button>
            </Link>
          </Card>
          
          <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <h3 className="font-semibold text-primary">Pro Tip</h3>
            <p className="text-sm text-muted-foreground">Detailed job descriptions lead to 40% more accurate AI matching scores.</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground">
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}
