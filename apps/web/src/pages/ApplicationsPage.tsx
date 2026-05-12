import { useEffect, useState } from "react";
import {
  Anchor,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  TableScrollContainer,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconSelector,
} from "@tabler/icons-react";
import { Link } from "react-router";

import { getApplications } from "../api/applications";
import {
  remoteTypeMeta,
  statusMeta,
} from "../lib/applicationMeta";
import { formatDate } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import type { ApplicationStatus, ApplicationWithRelations } from "../types/application";

type SortColumn =
  | "companyName"
  | "jobTitle"
  | "location"
  | "remoteType"
  | "status"
  | "priorityRating"
  | "appliedAt"
  | "source"
  | "followUpAt";

type SortDirection = "asc" | "desc";

type SortState = {
  column: SortColumn;
  direction: SortDirection;
};

const filterOptions = [
  { value: "all", label: "All applications" },
  { value: "open", label: "Open applications" },
  { value: "finished", label: "Finished applications" },
] as const;

type FilterOption = (typeof filterOptions)[number]["value"];

const finishedStatuses: ApplicationStatus[] = [
  "withdrawn",
  "no_response",
  "rejected",
];

const initialSort: SortState = {
  column: "followUpAt",
  direction: "asc",
};

function isPastDate(value?: string | null) {
  if (!value) {
    return false;
  }

  const followUpDate = new Date(value);
  const today = new Date();

  followUpDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return followUpDate.getTime() < today.getTime();
}

function compareNullableString(
  left?: string | null,
  right?: string | null,
  direction: SortDirection = "asc",
) {
  const leftValue = left?.trim();
  const rightValue = right?.trim();

  if (!leftValue && !rightValue) {
    return 0;
  }

  if (!leftValue) {
    return 1;
  }

  if (!rightValue) {
    return -1;
  }

  const result = leftValue.localeCompare(rightValue);
  return direction === "asc" ? result : -result;
}

function compareNullableNumber(
  left?: number | null,
  right?: number | null,
  direction: SortDirection = "asc",
) {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  return direction === "asc" ? left - right : right - left;
}

function compareNullableDate(
  left?: string | null,
  right?: string | null,
  direction: SortDirection = "asc",
) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  const result = new Date(left).getTime() - new Date(right).getTime();
  return direction === "asc" ? result : -result;
}

function sortApplications(
  applications: ApplicationWithRelations[],
  sortState: SortState,
) {
  const sorted = [...applications];

  sorted.sort((left, right) => {
    switch (sortState.column) {
      case "companyName":
        return compareNullableString(
          left.companyName,
          right.companyName,
          sortState.direction,
        );
      case "jobTitle":
        return compareNullableString(left.jobTitle, right.jobTitle, sortState.direction);
      case "location":
        return compareNullableString(left.location, right.location, sortState.direction);
      case "remoteType":
        return compareNullableString(
          remoteTypeMeta[left.remoteType],
          remoteTypeMeta[right.remoteType],
          sortState.direction,
        );
      case "status":
        return compareNullableString(
          statusMeta[left.status].label,
          statusMeta[right.status].label,
          sortState.direction,
        );
      case "priorityRating":
        return compareNullableNumber(
          left.priorityRating,
          right.priorityRating,
          sortState.direction,
        );
      case "appliedAt":
        return compareNullableDate(left.appliedAt, right.appliedAt, sortState.direction);
      case "source":
        return compareNullableString(left.source, right.source, sortState.direction);
      case "followUpAt":
        return compareNullableDate(left.followUpAt, right.followUpAt, sortState.direction);
      default:
        return 0;
    }
  });

  return sorted;
}

function SortableHeader({
  label,
  column,
  sortState,
  onSort,
}: {
  label: string;
  column: SortColumn;
  sortState: SortState;
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sortState.column === column;
  const Icon = !isActive
    ? IconSelector
    : sortState.direction === "asc"
      ? IconChevronUp
      : IconChevronDown;

  return (
    <UnstyledButton onClick={() => onSort(column)}>
      <Group gap={6} wrap="nowrap">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Icon size={14} stroke={1.8} />
      </Group>
    </UnstyledButton>
  );
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("open");
  const [sortState, setSortState] = useState<SortState>(initialSort);

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unknown error while loading applications.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  function handleSort(column: SortColumn) {
    setSortState(current => {
      if (current.column === column) {
        return {
          column,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        column,
        direction: column === "priorityRating" ? "desc" : "asc",
      };
    });
  }

  const filteredApplications = applications.filter(application => {
    if (statusFilter === "all") {
      return true;
    }

    if (statusFilter === "finished") {
      return finishedStatuses.includes(application.status);
    }

    return !finishedStatuses.includes(application.status);
  });

  const sortedApplications = sortApplications(filteredApplications, sortState);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={1}>Applications</Title>
          <Text c="dimmed">Track your job applications and follow-ups.</Text>
        </div>

        <Button
          component={Link}
          to="/applications/new"
          leftSection={<IconPlus size={18} />}>
          New application
        </Button>
      </Group>

      <Group justify="flex-end">
        <Select
          label="Filter"
          data={filterOptions}
          value={statusFilter}
          onChange={value => setStatusFilter((value as FilterOption | null) ?? "open")}
          w={240}
        />
      </Group>

      {isLoading ? (
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      ) : error ? (
        <Card withBorder>
          <Text c="red">{error}</Text>
        </Card>
      ) : applications.length === 0 ? (
        <Card withBorder>
          <Text>No applications saved yet.</Text>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card withBorder>
          <Text>No applications match the current filter.</Text>
        </Card>
      ) : (
        <Card withBorder radius="md" p={0}>
          <TableScrollContainer minWidth={980}>
            <Table highlightOnHover striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <SortableHeader
                      label="Company"
                      column="companyName"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Position"
                      column="jobTitle"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Location"
                      column="location"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Remote type"
                      column="remoteType"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Status"
                      column="status"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Priority"
                      column="priorityRating"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Source"
                      column="source"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Applied"
                      column="appliedAt"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Follow-up"
                      column="followUpAt"
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedApplications.map(application => (
                  <Table.Tr key={application.id}>
                    <Table.Td>
                      <Anchor component={Link} to={`/applications/${application.id}`}>
                        {application.companyName}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>{application.jobTitle}</Table.Td>
                    <Table.Td>{application.location || "No location"}</Table.Td>
                    <Table.Td>{remoteTypeMeta[application.remoteType]}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={application.status} />
                    </Table.Td>
                    <Table.Td>{application.priorityRating}</Table.Td>
                    <Table.Td>{application.source || "-"}</Table.Td>
                    <Table.Td>{formatDate(application.appliedAt)}</Table.Td>
                    <Table.Td c={isPastDate(application.followUpAt) ? "red.4" : undefined}>
                      {formatDate(application.followUpAt)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </TableScrollContainer>
        </Card>
      )}
    </Stack>
  );
}
