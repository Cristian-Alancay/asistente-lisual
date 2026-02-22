import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as configService from "@/services/config-personal";
import type { PersonalConfig, PersonalConfigKey } from "@/lib/config-personal-defaults";

export const configPersonalKeys = {
  all: ["config-personal"] as const,
};

export function usePersonalConfig() {
  return useQuery({
    queryKey: configPersonalKeys.all,
    queryFn: configService.getPersonalConfig,
  });
}

export function useSetPersonalConfigKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: PersonalConfigKey; value: string }) =>
      configService.setPersonalConfigKey(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: configPersonalKeys.all }),
  });
}

export function useSetPersonalConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<PersonalConfig>) =>
      configService.setPersonalConfig(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: configPersonalKeys.all }),
  });
}
