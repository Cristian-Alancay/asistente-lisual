import { createContext, useContext } from "react";
import type { Role } from "@/types/auth";

type RoleContextValue = {
  role: Role;
  canEdit: boolean;
};

const RoleContext = createContext<RoleContextValue>({
  role: "usuario",
  canEdit: true,
});

export function RoleProvider({
  userRole,
  children,
}: {
  userRole: Role;
  children: React.ReactNode;
}) {
  const canEdit = userRole !== "viewer";
  return (
    <RoleContext value={{ role: userRole, canEdit }}>
      {children}
    </RoleContext>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
