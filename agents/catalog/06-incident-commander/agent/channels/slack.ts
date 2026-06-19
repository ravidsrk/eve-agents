import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

// Slack channel for incident threads. Credentials via Vercel Connect on deploy;
// the default HTTP and alert channels exercise the same agent locally.
export default slackChannel({
  credentials: connectSlackCredentials("slack/incident-commander"),
});