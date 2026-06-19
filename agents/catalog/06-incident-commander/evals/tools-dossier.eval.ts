import { defineEval } from "eve/evals";

export default defineEval({
  description: "Incident commander loads dossier, analyzes records, writes report.",
  async test(t) {
    await t.send(
      [
        "Follow these steps exactly:",
        "1. Call load_dossier.",
        "2. Call analyze_records with query 'urgent'.",
        "3. Call write_report with title 'Incident action report' and body containing the word PRIORITY-REPORT.",
        "4. Reply with exactly REPORT-SENT.",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.toolOrder(["load_dossier", "analyze_records", "write_report"]);
    t.calledTool("load_dossier");
    t.calledTool("analyze_records");
    t.calledTool("write_report");
    t.messageIncludes("REPORT-SENT");
  },
});