import { Router } from "express";

type HealthRouterOptions = {
  demoMode: boolean;
};

export function createHealthRouter(options: HealthRouterOptions) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      ok: true,
      mode: options.demoMode ? "demo" : "live",
    });
  });

  return router;
}
