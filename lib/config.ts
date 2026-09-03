const fallbackSiteUrl = "http://localhost:3000";

function validUrl(value: string | undefined, fallback?: string) {
  if (!value) return fallback;

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export const siteUrl = validUrl(process.env.SITE_URL, fallbackSiteUrl)!;
export const repositoryUrl = validUrl(process.env.REPOSITORY_URL);
