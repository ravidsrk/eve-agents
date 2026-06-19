import type { defineTool } from "eve/tools";

type Tool = ReturnType<typeof defineTool>;

export declare const loadDossierTool: Tool;
export declare const searchRecordsTool: Tool;
export declare const analyzeRecordsTool: Tool;
export declare const writeReportTool: Tool;
export declare const recordDecisionTool: Tool;
export declare const fetchLiveJsonTool: Tool;
export declare const swarmRunTool: Tool;

