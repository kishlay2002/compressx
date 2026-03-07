export async function trackJob(data: {
  type: string;
  inputFilename: string;
  inputSize: number;
  outputSize: number;
  preset?: string;
  pipeline?: string;
}) {
  try {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // Silently fail — tracking is best-effort
  }
}
