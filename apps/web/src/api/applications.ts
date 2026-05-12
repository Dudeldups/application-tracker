import type {
  Application,
  ApplicationContact,
  ApplicationCommunication,
  ApplicationStatus,
  ApplicationWithRelations,
} from "../types/application";

const apiUrl = import.meta.env.VITE_API_URL ?? "";

type ApiErrorPayload = {
  error?: string;
};

type UpdateStatusInput = {
  status: ApplicationStatus;
  note?: string;
};

type ContactInput = {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
};

type CommunicationInput = {
  type: string;
  direction: string;
  summary: string;
  body?: string;
  date?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.error ?? message;
    } catch {
      // Fall back to the generic message when no JSON body exists.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApplications(): Promise<ApplicationWithRelations[]> {
  return request<ApplicationWithRelations[]>("/api/applications");
}

export function getApplication(id: string): Promise<ApplicationWithRelations> {
  return request<ApplicationWithRelations>(`/api/applications/${id}`);
}

export function createApplication(
  input: Partial<Application>,
): Promise<ApplicationWithRelations> {
  return request<ApplicationWithRelations>("/api/applications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateApplication(
  id: string,
  input: Partial<Application>,
): Promise<ApplicationWithRelations> {
  return request<ApplicationWithRelations>(`/api/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteApplication(id: string): Promise<void> {
  return request<void>(`/api/applications/${id}`, {
    method: "DELETE",
  });
}

export function updateApplicationStatus(
  id: string,
  input: UpdateStatusInput,
): Promise<ApplicationWithRelations> {
  return request<ApplicationWithRelations>(`/api/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteApplicationStatusHistoryEntry(
  applicationId: string,
  statusHistoryId: string,
): Promise<ApplicationWithRelations> {
  return request<ApplicationWithRelations>(
    `/api/applications/${applicationId}/status-history/${statusHistoryId}`,
    {
      method: "DELETE",
    },
  );
}

export function createApplicationContact(
  id: string,
  input: ContactInput,
): Promise<ApplicationContact> {
  return request<ApplicationContact>(`/api/applications/${id}/contacts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteApplicationContact(
  applicationId: string,
  contactId: string,
): Promise<void> {
  return request<void>(
    `/api/applications/${applicationId}/contacts/${contactId}`,
    {
      method: "DELETE",
    },
  );
}

export function createApplicationCommunication(
  id: string,
  input: CommunicationInput,
): Promise<ApplicationCommunication> {
  return request<ApplicationCommunication>(
    `/api/applications/${id}/communications`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function deleteApplicationCommunication(
  applicationId: string,
  communicationId: string,
): Promise<void> {
  return request<void>(
    `/api/applications/${applicationId}/communications/${communicationId}`,
    {
      method: "DELETE",
    },
  );
}
