import { eveChannel } from "eve/channels/eve";
import { catalogRouteAuth } from "@eve-catalog/agent-kit/route-auth";

export default eveChannel({
  auth: catalogRouteAuth(),
});
