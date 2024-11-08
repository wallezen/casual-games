import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { games } from "~/data/games";
import { addToRecentlyPlayed } from "~/utils/localStorage";
import { useLanguage } from "~/contexts/LanguageContext";

export const loader: LoaderFunction = async ({ params }) => {
  const game = games.find((g) => g.id === params.gameId);
  if (!game) {
    throw new Response("Game not found", { status: 404 });
  }
  return json({ game });
};

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  if (!data?.game) {
    return [
      { title: "Game Not Found - Casual Games" },
      { name: "description", content: "The requested game could not be found." }
    ];
  }

  const { game } = data;
  const canonicalUrl = `https://casualgames.studio${location.pathname}`;

  return [
    { title: game.metaTitle || `${game.title} - Play Online | Casual Games` },
    { name: "description", content: game.metaDescription || game.description },
    { name: "keywords", content: game.tags.join(", ") },
    // OpenGraph tags
    { property: "og:title", content: game.metaTitle || game.title },
    { property: "og:description", content: game.metaDescription || game.description },
    { property: "og:image", content: game.thumbnail },
    { property: "og:type", content: "game" },
    // Twitter tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: game.metaTitle || game.title },
    { name: "twitter:description", content: game.metaDescription || game.description },
    { name: "twitter:image", content: game.thumbnail },
    { rel: "canonical", href: canonicalUrl },
    { name: "language", content: "en" },
    { property: "article:published_time", content: game.releaseDate },
  ];
};

export default function GamePage() {
  const { game } = useLoaderData<typeof loader>();
  const { t, language } = useLanguage();

  useEffect(() => {
    addToRecentlyPlayed(game.id);
  }, [game.id]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    image: game.thumbnail,
    genre: game.category,
    numberOfPlayers: game.tags.includes("Multiplayer") ? "MultiPlayer" : "SinglePlayer",
    gameRating: `${game.rating}/5`,
    datePublished: game.releaseDate,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: game.rating,
      ratingCount: Math.floor(game.plays / 10), // Estimate rating count
      bestRating: "5",
      worstRating: "1"
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/PlayGameAction",
      userInteractionCount: game.plays
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://casualgames.studio"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": game.category,
        "item": `https://casualgames.studio/categories/${game.category.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": game.title,
        "item": `https://casualgames.studio/games/${game.slug}`
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />

      <nav className="mb-4 text-base" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {/* <li>
            <a href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t("popular_games")}
            </a>
          </li> */}
          <li className="text-gray-400">/</li>
          <li>
            <a href={`/categories/${game.category.toLowerCase()}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {game.category}
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-300" aria-current="page">
            {game.title}
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <div
          className="aspect-video w-full rounded-2xl bg-gray-900 shadow-5xl ring-1 ring-white/10 dark:ring-white/20"
          dangerouslySetInnerHTML={{ __html: game.iframeHtml }}
          aria-label={game.alternativeText}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-transform hover:scale-[1.01]">
          <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t("how_to_play")}
          </h2>
          <div className="prose prose-sm dark:prose-invert">
            <ul className="list-none space-y-3">
              {[
                t("move_keys"),
                t("jump_key"),
                t("mouse_click"),
                t("pause_key")
              ].map((instruction) => (
                <li key={instruction} className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-3 text-indigo-500 dark:text-indigo-400">→</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-transform hover:scale-[1.01]">
          <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t("game_details")}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t("category")}</h3>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{game.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t("description")}</h3>
              <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">{game.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t("release_date")}</h3>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {new Date(game.releaseDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : language)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t("rating")}</h3>
              <div className="mt-1 flex items-center">
                <span className="text-yellow-500 dark:text-yellow-400 text-xl">★</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">{game.rating}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t("total_plays")}</h3>
              <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">{game.plays.toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t("tags")}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {game.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium ring-1 ring-indigo-100 dark:ring-indigo-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
