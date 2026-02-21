import { createGetRoute } from "@/lib/api-route-factory";
import { getProyectos } from "@/lib/actions/operaciones";

export const GET = createGetRoute(getProyectos);
