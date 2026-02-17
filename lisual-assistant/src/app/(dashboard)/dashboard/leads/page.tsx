import { Suspense } from "react";
import { LeadsTable } from "./leads-table";
import { LeadsHeader } from "./leads-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <LeadsHeader />
      <Card>
        <CardHeader>
          <CardTitle>Listado de Leads</CardTitle>
          <CardDescription>Gestiona tus prospectos y contactos</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <LeadsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
