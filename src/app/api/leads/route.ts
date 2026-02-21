import { createGetRoute } from "@/lib/api-route-factory";
import { getLeads } from "@/lib/actions/leads";

export const GET = createGetRoute(getLeads);
