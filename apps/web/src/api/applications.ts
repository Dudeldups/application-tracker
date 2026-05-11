import type { Application } from "../types/application";

const apiUrl = import.meta.env.VITE_API_URL;

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${apiUrl}/applications`);

  if (!response.ok) {
    throw new Error("Bewerbungen konnten nicht geladen werden.");
  }

  return response.json();
}
