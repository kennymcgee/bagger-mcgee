export function GET() {
  // Liveness only: never expose configuration, credentials, or database status.
  return Response.json({ status: "ok" });
}
