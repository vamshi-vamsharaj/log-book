import { APP_DESCRIPTION, APP_NAME } from "@/constants";
import { env } from "@/lib/env";

export const siteConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  links: {
    github: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;