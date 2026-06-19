import { eveChannel } from "eve/channels/eve";
import { routeAuth } from "@eve-catalog/agent-kit/route-auth";

export default eveChannel({
  auth: routeAuth(),
});