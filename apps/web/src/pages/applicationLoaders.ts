import type { LoaderFunctionArgs } from "react-router";

import { getApplication } from "../api/applications";
import { getLoadErrorMessage, isAbortError } from "../lib/errors";
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
    if (isAbortError(loadError)) {
      throw loadError;
    }

    return {
      application: null,
      error: getLoadErrorMessage(loadError, {
        fallbackMessage: "Application could not be loaded.",
        notFoundMessage: "Application not found.",
        networkMessage: "The application service could not be reached.",
      }),
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
