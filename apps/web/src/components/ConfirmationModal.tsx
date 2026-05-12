import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

type ConfirmationModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
};

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmColor = "red",
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        {typeof children === "string" ? <Text>{children}</Text> : children}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
