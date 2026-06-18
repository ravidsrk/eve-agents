import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

// Slack channel: answers @mentions and DMs in threads. Credentials run through Vercel Connect
// (no raw SLACK_BOT_TOKEN). Live delivery requires a deployed Connect destination attached to
// /eve/v1/slack (see README). Locally, the default HTTP channel still serves the same agent.
export default slackChannel({
  credentials: connectSlackCredentials("slack/lab"),
});
