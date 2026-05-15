import type { LoaderFunctionArgs } from "react-router";

import { getApplication } from "../api/applications";
import type { ApplicationWithRelations } from "../types/application";

export type ApplicationPageLoaderData = {
  application: ApplicationWithRelations | null;
  error: string | null;
};

async function loadApplicationForPage(
  id: string,
  request: Request,
): Promise<ApplicationPageLoaderData> {
  try {
    const application = await getApplication(id, { signal: request.signal });

    return {
      application,
      error: null,
    };
  } catch (loadError) {
    return {
      application: null,
      error:
        loadError instanceof Error
          ? loadError.message
          : "Application could not be loaded.",
    };
  }
}

export function applicationDetailLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  return loadApplicationForPage(params.id ?? "", request);
}

export function editApplicationLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  return loadApplicationForPage(params.id ?? "", request);
}
