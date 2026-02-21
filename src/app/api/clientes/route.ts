import { createGetRoute } from "@/lib/api-route-factory";
import { getClientes } from "@/lib/actions/operaciones";

export const GET = createGetRoute(getClientes);
