import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { AnalyzeRequest } from "@shared/schema";

export function useAnalyses() {
  return useQuery({
    queryKey: [api.analyses.list.path],
    queryFn: async () => {
      const res = await fetch(api.analyses.list.path);
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return api.analyses.list.responses[200].parse(await res.json());
    },
  });
}

export function useAnalysis(id: number) {
  return useQuery({
    queryKey: [api.analyses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.analyses.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return api.analyses.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      const res = await fetch(api.analyses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create analysis");
      return api.analyses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.analyses.list.path] });
    },
  });
}
