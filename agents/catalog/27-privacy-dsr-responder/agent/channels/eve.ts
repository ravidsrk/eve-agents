import { eveChannel } from "eve/channels/eve";
import { catalogRouteAuth } from "@eve-agents/agent-kit/route-auth";

export default eveChannel({
  auth: catalogRouteAuth(),
});
