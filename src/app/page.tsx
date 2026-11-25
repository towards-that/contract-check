import { HomeClient } from "@/components/home-client";
import { getModelName } from "@/lib/constants";

export default function Page() {
  return (
    <HomeClient
      hasApiKey={Boolean(process.env.GEMINI_API_KEY?.trim())}
      model={getModelName()}
    />
  );
}
