import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  API: DurableObjectNamespace<VikunjaApi>;
  ASSETS: Fetcher;
  PUBLIC_URL: string;
  ENABLE_REGISTRATION: string;
  R2_ENDPOINT: string;
  R2_BUCKET: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  VIKUNJA_SECRET: string;
}

/** The Vikunja API. One instance only: Litestream allows a single writer per database. */
export class VikunjaApi extends Container<Env> {
  defaultPort = 3456;
  // Waking up restores the database from R2 (seconds), so stay up a while between visits.
  sleepAfter = "30m";

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.envVars = {
      R2_ENDPOINT: env.R2_ENDPOINT,
      R2_BUCKET: env.R2_BUCKET,
      R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
      VIKUNJA_SERVICE_PUBLICURL: env.PUBLIC_URL,
      VIKUNJA_SERVICE_ENABLEREGISTRATION: env.ENABLE_REGISTRATION,
      VIKUNJA_SERVICE_SECRET: env.VIKUNJA_SECRET,
      VIKUNJA_SERVICE_JWTSECRET: env.VIKUNJA_SECRET,
      VIKUNJA_FILES_TYPE: "s3",
      VIKUNJA_FILES_BASEPATH: "files",
      VIKUNJA_FILES_S3_ENDPOINT: env.R2_ENDPOINT,
      VIKUNJA_FILES_S3_BUCKET: env.R2_BUCKET,
      VIKUNJA_FILES_S3_REGION: "auto",
      VIKUNJA_FILES_S3_ACCESSKEY: env.R2_ACCESS_KEY_ID,
      VIKUNJA_FILES_S3_SECRETKEY: env.R2_SECRET_ACCESS_KEY,
      VIKUNJA_FILES_S3_USEPATHSTYLE: "true",
      VIKUNJA_SERVICE_ENABLEEMAILREMINDERS: "false",
    };
  }
}

export default {
  // The frontend is static files; only the API goes to the container (same origin, so the
  // frontend's API_URL stays empty).
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return getContainer(env.API).fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
