import { eveChannel } from "eve/channels/eve";
import { routeAuth } from "@eve-agents/agent-kit/route-auth";

export default eveChannel({
  auth: routeAuth(),
});