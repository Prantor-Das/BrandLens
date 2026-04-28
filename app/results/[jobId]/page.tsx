import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { buildResultsMetadata, getResultsPayload } from "@/lib/results-data";

type ResultsPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { jobId } = await params;
  const payload = await getResultsPayload(jobId);

  if (!payload) {
    return {
      title: "Report not found - BrandLens AI"
    };
  }

  return buildResultsMetadata(payload, jobId);
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { jobId } = await params;
  const payload = await getResultsPayload(jobId);

  if (!payload) {
    notFound();
  }

  return <ResultsDashboard initialData={payload} jobId={jobId} />;
}
