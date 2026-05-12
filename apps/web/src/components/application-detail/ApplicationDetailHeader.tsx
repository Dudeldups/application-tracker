import { Button, Group, Text, Title } from "@mantine/core";
import { Link } from "react-router";

import { StatusBadge } from "../StatusBadge";
import type { ApplicationWithRelations } from "../../types/application";

type ApplicationDetailHeaderProps = {
  application: ApplicationWithRelations;
  isDeleting: boolean;
  onDelete: () => void;
};

export function ApplicationDetailHeader({
  application,
  isDeleting,
  onDelete,
}: ApplicationDetailHeaderProps) {
  return (
    <Group justify="space-between" align="start">
      <div>
        <Title order={1}>{application.companyName}</Title>
        <Text c="dimmed">{application.jobTitle}</Text>
      </div>

      <Group>
        <StatusBadge status={application.status} />
        <Button
          component={Link}
          to={`/applications/${application.id}/edit`}
          variant="outline"
          color="green">
          Edit
        </Button>
        <Button color="red" variant="light" loading={isDeleting} onClick={onDelete}>
          Delete
        </Button>
      </Group>
    </Group>
  );
}
