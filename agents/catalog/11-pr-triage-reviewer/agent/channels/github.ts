import { defaultGitHubAuth, githubChannel } from "eve/channels/github";

// GitHub App channel for PR/issue @mentions. Credentials from env on deploy;
// the default HTTP channel exercises the same agent locally.
export default githubChannel({
  botName: process.env.GITHUB_APP_SLUG ?? "pr-triage-bot",
  onComment: (ctx, _comment) => ({ auth: defaultGitHubAuth(ctx) }),
});