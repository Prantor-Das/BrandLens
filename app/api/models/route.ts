import { getEnabledModels } from "@/lib/models";

export const runtime = "nodejs";

export async function GET() {
  const models = getEnabledModels().map((model) => ({
    id: model.id,
    name: model.name,
    provider: model.provider,
    isFree: model.isFree
  }));

  return Response.json({ models });
}
