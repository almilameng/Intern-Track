import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { reserveAI } from "@/lib/access";
import { sameOrigin } from "@/lib/request-security";
import { aiClient, aiModel, dataInstructions } from "@/lib/ai";
import { MatchResult } from "@/lib/ai-types";
import { zodTextFormat } from "openai/helpers/zod";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Please log in again." }, { status: 401 });
  let reserved = false;
  try {
    const { applicationId } = await request.json();
    if (typeof applicationId !== "string" || applicationId.length > 80)
      return Response.json(
        { error: "Choose a saved application." },
        { status: 400 },
      );
    const sql = database();
    const [app] =
      await sql`SELECT data FROM applications WHERE id = ${applicationId} AND user_id = ${session.user.id}`;
    if (!app)
      return Response.json(
        { error: "Application not found." },
        { status: 404 },
      );
    const description = app.data.jobDescription;
    if (
      typeof description !== "string" ||
      description.trim().length < 80 ||
      description.length > 15000
    )
      return Response.json(
        {
          error:
            "Add a job description of 80–15,000 characters in the tracker first.",
        },
        { status: 400 },
      );
    const [resume] =
      await sql`SELECT profile, version FROM resumes WHERE user_id = ${session.user.id}`;
    if (!resume)
      return Response.json(
        { error: "Upload your resume first." },
        { status: 400 },
      );
    const client = aiClient();
    await reserveAI(session.user.id);
    reserved = true;
    const response = await client.responses.parse({
      model: aiModel,
      store: false,
      reasoning: { effort: "minimal" },
      max_output_tokens: 2200,
      instructions:
        dataInstructions +
        " Help the applicant assess their own fit for this job. Compare degree, skills and experience to explicit requirements. Cite concrete resume evidence in strengths, distinguish absent evidence from definite gaps, and suggest honest application improvements. score is a rough evidence-based fit estimate, never probability of getting hired. Use Insufficient information if the job text is not a real description. Keep each list to 3–5 concise items. Do not infer dates or update application state.",
      input: JSON.stringify({
        resume: resume.profile,
        job: {
          company: app.data.company,
          position: app.data.position,
          description,
        },
      }),
      text: { format: zodTextFormat(MatchResult, "job_match") },
    });
    const result = response.output_parsed;
    if (!result) throw new Error("Incomplete analysis");
    const saved =
      await sql`INSERT INTO matches (application_id, user_id, resume_version, job_description, result) SELECT ${applicationId}, ${session.user.id}, ${resume.version}, ${description}, ${JSON.stringify(result)}::jsonb WHERE EXISTS (SELECT 1 FROM resumes WHERE user_id = ${session.user.id} AND version = ${resume.version}) AND EXISTS (SELECT 1 FROM applications WHERE id = ${applicationId} AND user_id = ${session.user.id} AND data->>'jobDescription' = ${description}) ON CONFLICT (application_id) DO UPDATE SET resume_version = EXCLUDED.resume_version, job_description = EXCLUDED.job_description, result = EXCLUDED.result, created_at = now() RETURNING application_id`;
    if (!saved.length)
      return Response.json(
        {
          error:
            "Your resume or job changed during analysis. Please run the match again.",
        },
        { status: 409 },
      );
    return Response.json({ result });
  } catch (error) {
    return Response.json(
      {
        error:
          !reserved &&
          error instanceof Error &&
          /daily|allowance|requests today|not configured/.test(error.message)
            ? error.message
            : "The match could not finish. Please try again shortly.",
      },
      { status: 503 },
    );
  }
}
