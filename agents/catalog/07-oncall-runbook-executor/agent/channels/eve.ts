import { eveChannel } from "eve/channels/eve";
import { localDev, placeholderAuth, vercelOidc } from "eve/channels/auth";

export default eveChannel({
  auth: [
    // Open on localhost for eve dev and the TUI.
    localDev(),
    // Lets Vercel deployments and the Eve TUI reach the deployed agent.
    vercelOidc(),
    // Replace with app auth in production, or remove for an intentionally public demo.
    placeholderAuth(),
  ],
});
