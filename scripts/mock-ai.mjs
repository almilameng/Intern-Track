// Local browser-test fixture only. Production never starts this server.
import http from "node:http";
const server = http.createServer(async (req, res) => {
  if (req.method === "GET") {
    res.end("ready");
    return;
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  const request = JSON.parse(body);
  const profile = request.text?.format?.name === "resume_profile";
  const result = profile
    ? {
        isResume: true,
        summary:
          "Computer science student with Python and SQL project experience.",
        education: ["BS Computer Science"],
        skills: ["Python", "SQL"],
        experience: ["Built a data dashboard using Python and SQL."],
      }
    : {
        score: 82,
        fit: "Strong match",
        summary: "Your Python and SQL experience supports this role.",
        strengths: [
          "Python project experience matches the programming requirement.",
        ],
        gaps: ["No cloud deployment experience is described."],
        nextSteps: ["Describe the impact of your dashboard project."],
      };
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      id: "resp_test",
      object: "response",
      status: "completed",
      model: "gpt-5-mini",
      output: [
        {
          id: "msg_test",
          type: "message",
          status: "completed",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: JSON.stringify(result),
              annotations: [],
            },
          ],
        },
      ],
    }),
  );
});
server.listen(4010, "127.0.0.1");
