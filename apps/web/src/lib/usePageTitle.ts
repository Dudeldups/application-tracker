import { useEffect } from "react";

const appName = "Application Tracker";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${appName}`;
  }, [title]);
}
