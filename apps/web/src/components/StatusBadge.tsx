import { Badge } from "@mantine/core";

import { statusMeta } from "../lib/applicationMeta";
import type { ApplicationStatus } from "../types/application";

type StatusBadgeProps = {
  status: ApplicationStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMeta[status];

  return (
    <Badge color={meta.color} variant="light">
      {meta.label}
    </Badge>
  );
}
