import { ActionIcon, Button, Card, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { UseFormReturn } from "react-hook-form";

import type { ApplicationWithRelations } from "../../types/application";
import type { ContactFormValues } from "./forms";

type ContactsSectionProps = {
  application: ApplicationWithRelations;
  form: UseFormReturn<ContactFormValues>;
  isSubmitting: boolean;
  onSubmit: (values: ContactFormValues) => Promise<void>;
  onDeleteContact: (contactId: string, label: string) => void;
};

export function ContactsSection({
  application,
  form,
  isSubmitting,
  onSubmit,
  onDeleteContact,
}: ContactsSectionProps) {
  return (
    <Card withBorder radius="md">
      <Stack>
        <Title order={3}>Contacts</Title>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Name"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <TextInput
              label="Role"
              {...form.register("role")}
              error={form.formState.errors.role?.message}
            />
            <TextInput
              label="Email"
              {...form.register("email")}
              error={form.formState.errors.email?.message}
            />
            <TextInput
              label="Phone"
              {...form.register("phone")}
              error={form.formState.errors.phone?.message}
            />
            <Button type="submit" loading={isSubmitting}>
              Add contact
            </Button>
          </Stack>
        </form>

        {application.contacts.length === 0 ? (
          <Text c="dimmed">No contacts added yet.</Text>
        ) : (
          <Stack gap="sm">
            {application.contacts.map(contact => (
              <Card key={contact.id} withBorder>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Stack gap={2}>
                    <Text fw={600}>{contact.name || "Unnamed contact"}</Text>
                    <Text size="sm">{contact.role || "No role added"}</Text>
                    <Text size="sm">{contact.email || "No email"}</Text>
                    <Text size="sm">{contact.phone || "No phone number"}</Text>
                  </Stack>
                  <Stack align="end">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="Delete contact"
                      onClick={() =>
                        onDeleteContact(
                          contact.id,
                          contact.name || contact.email || contact.phone || "contact",
                        )
                      }>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Stack>
                </SimpleGrid>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
