import { Anchor, Card, Divider, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core";

import { formatDate } from "../../lib/format";
import type { ApplicationWithRelations } from "../../types/application";

type ApplicationSummarySectionProps = {
  application: ApplicationWithRelations;
};

export function ApplicationSummarySection({
  application,
}: ApplicationSummarySectionProps) {
  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder radius="md">
          <Stack gap="xs">
            <Title order={3}>Overview</Title>
            <Text>City: {application.city || "Not set"}</Text>
            <Text>Address: {application.address || "Not set"}</Text>
            <Text>Source: {application.source || "Not set"}</Text>
            <Text>Found: {formatDate(application.foundAt)}</Text>
            <Text>Applied: {formatDate(application.appliedAt)}</Text>
            <Text>Last contact: {formatDate(application.lastContactAt)}</Text>
            <Text>Follow-up: {formatDate(application.followUpAt)}</Text>
            {application.jobUrl ? (
              <Anchor href={application.jobUrl} target="_blank">
                Job posting
              </Anchor>
            ) : null}
          </Stack>
        </Card>

        <Card withBorder radius="md">
          <Stack gap="xs">
            <Title order={3}>Ratings</Title>
            <Text>Interest: {application.interestRating ?? "Not set"}</Text>
            <Text>Skill fit: {application.skillFitRating ?? "Not set"}</Text>
            <Text>Priority: {application.priorityRating ?? "Not set"}</Text>
            <Divider my="sm" />
            <Text>CV: {application.cvVersion || "Not set"}</Text>
            <Text>
              Cover letter:{" "}
              {application.coverLetterVersion || application.usedCoverLetter
                ? `${application.coverLetterVersion || "available"}`
                : "Not used"}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md">
        <Stack>
          <Title order={3}>Notes</Title>
          <Text>{application.customizationNotes || "No customization notes."}</Text>
          <Text>{application.notes || "No general notes."}</Text>
          {application.jobAdText ? (
            <>
              <Divider />
              <Textarea
                label="Job ad text"
                value={application.jobAdText}
                minRows={14}
                autosize
                readOnly
              />
            </>
          ) : null}
        </Stack>
      </Card>
    </>
  );
}
