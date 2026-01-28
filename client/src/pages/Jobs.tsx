import { useState } from "react";
import { useJobs, useCreateJob } from "@/hooks/use-jobs";
import { Layout } from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Search, MapPin, Briefcase as BriefcaseIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertJobSchema;
type FormData = z.infer<typeof formSchema>;

export default function Jobs() {
  const { data: jobs, isLoading } = useJobs();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
          <p className="text-muted-foreground mt-1">Manage job listings and requirements.</p>
        </div>
        <CreateJobDialog open={open} onOpenChange={setOpen} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          className="pl-10 max-w-md" 
          placeholder="Search jobs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)
        ) : filteredJobs?.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl">
            <BriefcaseIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-muted-foreground">Create a new job to get started.</p>
          </div>
        ) : (
          filteredJobs?.map(job => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-all duration-300 border-border group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{job.department || "General"}</span>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  Active
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </p>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Created {new Date(job.createdAt!).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" className="hover:text-primary">View Details</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}

function CreateJobDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createJob = useCreateJob();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "",
      description: "",
      requirements: "",
    }
  });

  const onSubmit = (data: FormData) => {
    createJob.mutate(data, {
      onSuccess: () => {
        toast({ title: "Job Created", description: "The job position has been successfully added." });
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Create Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Position</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="e.g. Senior Frontend Engineer" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input placeholder="e.g. Engineering" {...form.register("department")} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              className="min-h-[100px]" 
              placeholder="Describe the role and responsibilities..." 
              {...form.register("description")} 
            />
            {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <Textarea 
              className="min-h-[100px]" 
              placeholder="- Key skills&#10;- Experience needed&#10;- Educational background" 
              {...form.register("requirements")} 
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? "Creating..." : "Create Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
