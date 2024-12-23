import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = () => {
  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://casualgames.studio/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
