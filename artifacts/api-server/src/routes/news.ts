import { Router } from "express";
import crypto from "node:crypto";

const router = Router();

const GNEWS_API_URL = "https://gnews.io/api/v4/search";
const GNEWS_API_KEY = process.env.GNEWS_API_KEY ?? "";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2:latest";

const SEARCH_QUERY =
  "procurement OR supplier OR sourcing OR manufacturing OR logistics OR semiconductor OR commodity OR tariff OR shipping";

const CACHE_TTL_MS = 10 * 60 * 1000;

let cachedNews: any[] | null = null;
let cachedAt = 0;

const RELEVANCE_KEYWORDS = [
  "procurement",
  "purchasing",
  "supplier",
  "suppliers",
  "sourcing",
  "supply chain",
  "manufacturing",
  "logistics",
  "shipment",
  "shipping",
  "freight",
  "warehouse",
  "inventory",
  "raw material",
  "commodity",
  "semiconductor",
  "chip supply",
  "production",
  "factory",
  "tariff",
  "trade restriction",
  "export control",
  "import",
  "port",
  "container",
  "shortage",
  "lead time",
  "cost pressure",
  "material cost",
];

const STRONG_RELEVANCE_KEYWORDS = [
  "procurement",
  "supplier",
  "sourcing",
  "manufacturing",
  "semiconductor",
  "commodity",
  "raw material",
  "tariff",
  "export control",
  "trade restriction",
  "shortage",
  "lead time",
  "freight",
  "shipping",
  "inventory",
];

const IRRELEVANT_KEYWORDS = [
  "war",
  "military",
  "missile",
  "soldier",
  "ukraine",
  "russia",
  "iran",
  "iranian",
  "gulf conflict",
  "hormuz",
  "strait of hormuz",
  "ceasefire",
  "peace plan",
  "nuclear",
  "election",
  "politics",
  "president",
  "un general assembly",
  "unga",
  "murder",
  "death",
  "dead",
  "crime",
  "liquor",
  "hooch",
  "alcohol",
  "celebrity",
  "movie",
  "sports",
  "football",
  "cricket",
  "weather",
  "horoscope",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "after",
  "before",
  "over",
  "under",
  "will",
  "supply",
  "chain",
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitleTokens(title: string): Set<string> {
  return new Set(
    normalizeText(title)
      .split(" ")
      .filter(
        (token) =>
          token.length > 2 &&
          !STOP_WORDS.has(token),
      ),
  );
}

function calculateTitleSimilarity(
  first: string,
  second: string,
): number {
  const firstTokens = getTitleTokens(first);
  const secondTokens = getTitleTokens(second);

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([
    ...firstTokens,
    ...secondTokens,
  ]).size;

  return union === 0
    ? 0
    : intersection / union;
}

function getCombinedText(article: any): string {
  return normalizeText(
    `${article.title ?? ""} ${
      article.description ?? ""
    } ${article.content ?? ""}`,
  );
}

function isProcurementRelevant(article: any): boolean {
  const text = getCombinedText(article);

  const strongMatches =
    STRONG_RELEVANCE_KEYWORDS.filter(
      (keyword) =>
        text.includes(keyword),
    );

  const relevanceMatches =
    RELEVANCE_KEYWORDS.filter(
      (keyword) =>
        text.includes(keyword),
    );

  const irrelevantMatches =
    IRRELEVANT_KEYWORDS.filter(
      (keyword) =>
        text.includes(keyword),
    );

  if (irrelevantMatches.length > 0) {
    const strategicSupplyChainMatch =
      strongMatches.some((keyword) =>
        [
          "procurement",
          "supplier",
          "sourcing",
          "manufacturing",
          "semiconductor",
          "commodity",
          "raw material",
          "tariff",
          "export control",
          "trade restriction",
          "shortage",
          "lead time",
        ].includes(keyword),
      );

    if (!strategicSupplyChainMatch) {
      return false;
    }
  }

  if (strongMatches.length >= 1) {
    return true;
  }

  return relevanceMatches.length >= 2;
}

function getEventKey(article: any): string {
  const text = normalizeText(
    `${article.title ?? ""} ${
      article.description ?? ""
    }`,
  );

  const eventGroups = [
    {
      key: "us_china_tariff_relief",
      terms: [
        "us china",
        "trump xi",
        "tariff relief",
        "tariff cuts",
        "favourable tariff",
        "favorable tariff",
      ],
    },
    {
      key: "semiconductor_manufacturing",
      terms: [
        "semiconductor",
        "chip manufacturing",
        "chip supply",
      ],
    },
    {
      key: "medicine_procurement",
      terms: [
        "medicine procurement",
        "medical procurement",
        "pharmaceutical procurement",
      ],
    },
    {
      key: "commodity_supply",
      terms: [
        "commodity",
        "raw material",
        "material cost",
        "commodity prices",
      ],
    },
    {
      key: "supplier_sourcing",
      terms: [
        "supplier",
        "sourcing",
        "procurement",
      ],
    },
  ];

  for (const group of eventGroups) {
    const matches = group.terms.filter(
      (term) =>
        text.includes(term),
    );

    if (matches.length > 0) {
      return group.key;
    }
  }

  return [
    ...getTitleTokens(
      article.title ?? "",
    ),
  ]
    .filter(
      (token) =>
        token.length >= 5,
    )
    .sort()
    .slice(0, 8)
    .join("|");
}

function deduplicateArticles(
  articles: any[],
): any[] {
  const accepted: any[] = [];
  const eventKeys = new Set<string>();

  for (const article of articles) {
    const eventKey =
      getEventKey(article);

    if (
      eventKey &&
      eventKeys.has(eventKey)
    ) {
      continue;
    }

    const duplicate =
      accepted.some(
        (existing) => {
          const similarity =
            calculateTitleSimilarity(
              article.title ?? "",
              existing.title ?? "",
            );

          return similarity >= 0.45;
        },
      );

    if (duplicate) {
      continue;
    }

    if (eventKey) {
      eventKeys.add(eventKey);
    }

    accepted.push(article);
  }

  return accepted;
}

function classifyImpact(
  sentimentScore: number,
  article: any,
): string {
  const text =
    getCombinedText(article);

  const highImpactKeywords = [
    "shortage",
    "tariff",
    "export control",
    "trade restriction",
    "factory shutdown",
    "production halt",
    "supply disruption",
    "shipping disruption",
    "port closure",
    "commodity prices",
    "material cost",
    "semiconductor shortage",
  ];

  const hasHighImpactKeyword =
    highImpactKeywords.some(
      (keyword) =>
        text.includes(keyword),
    );

  if (
    hasHighImpactKeyword ||
    Math.abs(sentimentScore) >= 0.75
  ) {
    return "high";
  }

  if (
    Math.abs(sentimentScore) >= 0.35
  ) {
    return "medium";
  }

  return "low";
}

async function analyzeSentiment(
  text: string,
): Promise<{
  sentiment: string;
  sentimentScore: number;
}> {
  const prompt = `
Analyze the sentiment of this procurement and supply-chain news article.

Return JSON only.

Allowed sentiment values:
positive
neutral
negative

Return:
{
  "sentiment": "positive",
  "sentimentScore": 0.0
}

The score must be between -1 and 1.

Article:
${text}
`;

  try {
    const response =
      await fetch(
        OLLAMA_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            format: "json",
            options: {
              temperature: 0,
            },
          }),
        },
      );

    if (!response.ok) {
      return {
        sentiment: "neutral",
        sentimentScore: 0,
      };
    }

    const data =
      (await response.json()) as {
        response?: string;
      };

    if (!data.response) {
      return {
        sentiment: "neutral",
        sentimentScore: 0,
      };
    }

    const parsed =
      JSON.parse(
        data.response,
      ) as {
        sentiment?: string;
        sentimentScore?: number;
      };

    const sentiment =
      parsed.sentiment ===
        "positive" ||
      parsed.sentiment ===
        "negative" ||
      parsed.sentiment ===
        "neutral"
        ? parsed.sentiment
        : "neutral";

    const score = Number(
      parsed.sentimentScore,
    );

    return {
      sentiment,
      sentimentScore:
        Number.isFinite(score)
          ? Math.max(
              -1,
              Math.min(1, score),
            )
          : 0,
    };
  } catch {
    return {
      sentiment: "neutral",
      sentimentScore: 0,
    };
  }
}

async function fetchNews(): Promise<any[]> {
  if (
    cachedNews &&
    Date.now() - cachedAt <
      CACHE_TTL_MS
  ) {
    return cachedNews;
  }

  if (!GNEWS_API_KEY) {
    throw new Error(
      "GNEWS_API_KEY is not configured.",
    );
  }

  const url =
    new URL(GNEWS_API_URL);

  url.searchParams.set(
    "q",
    SEARCH_QUERY,
  );

  url.searchParams.set(
    "lang",
    "en",
  );

  url.searchParams.set(
    "max",
    "10",
  );

  url.searchParams.set(
    "sortby",
    "publishedAt",
  );

  url.searchParams.set(
    "apikey",
    GNEWS_API_KEY,
  );

  const response =
    await fetch(
      url.toString(),
    );

  if (!response.ok) {
    throw new Error(
      `GNews request failed with HTTP ${response.status}`,
    );
  }

  const data =
    (await response.json()) as {
      articles?: any[];
    };

  const rawArticles =
    Array.isArray(
      data.articles,
    )
      ? data.articles
      : [];

  const relevantArticles =
    rawArticles.filter(
      isProcurementRelevant,
    );

  const uniqueArticles =
    deduplicateArticles(
      relevantArticles,
    );

  const enrichedArticles =
    await Promise.all(
      uniqueArticles.map(
        async (article) => {
          const sentiment =
            await analyzeSentiment(
              `${article.title ?? ""}\n${
                article.description ??
                ""
              }`,
            );

          return {
            id: crypto
              .createHash("md5")
              .update(
                article.url ??
                  article.title ??
                  "",
              )
              .digest("hex"),

            title:
              article.title ??
              "Untitled article",

            source:
              article.source?.name ??
              "Unknown source",

            summary:
              article.description ??
              article.content ??
              "No summary available.",

            sentiment:
              sentiment.sentiment,

            sentimentScore:
              Number(
                sentiment.sentimentScore.toFixed(
                  2,
                ),
              ),

            tags: [
              "supply_chain",
              "market_intelligence",
            ],

            supplierId: null,
            supplierName: null,

            publishedAt:
              article.publishedAt ??
              new Date().toISOString(),

            url:
              article.url ?? "#",

            impactLevel:
              classifyImpact(
                sentiment.sentimentScore,
                article,
              ),
          };
        },
      ),
    );

  cachedNews =
    enrichedArticles;

  cachedAt =
    Date.now();

  return enrichedArticles;
}

router.get(
  "/news",
  async (req, res) => {
    try {
      const limit =
        Math.min(
          Math.max(
            Number.parseInt(
              String(
                req.query.limit ??
                  "10",
              ),
              10,
            ) || 10,
            1,
          ),
          10,
        );

      const news =
        await fetchNews();

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );

      res.set(
        "Pragma",
        "no-cache",
      );

      res.set(
        "Expires",
        "0",
      );

      res.json({
        value:
          news.slice(
            0,
            limit,
          ),

        Count:
          Math.min(
            news.length,
            limit,
          ),
      });
    } catch (error) {
      console.error(
        "News fetch failed:",
        error,
      );

      res.status(500).json({
        message:
          "Unable to fetch current market intelligence news.",
      });
    }
  },
);

router.get(
  "/news/supplier/:supplierId",
  async (
    req,
    res,
  ) => {
    try {
      const news =
        await fetchNews();

      const supplierNews =
        news.filter(
          (article) =>
            article.supplierId ===
            req.params.supplierId,
        );

      res.json({
        value:
          supplierNews,
        Count:
          supplierNews.length,
      });
    } catch (error) {
      console.error(
        "Supplier news fetch failed:",
        error,
      );

      res.status(500).json({
        message:
          "Unable to fetch supplier news.",
      });
    }
  },
);

router.get(
  "/news/timeline",
  async (
    _req,
    res,
  ) => {
    try {
      const news =
        await fetchNews();

      const timelineMap =
        new Map<
          string,
          {
            date: string;
            positive: number;
            neutral: number;
            negative: number;
          }
        >();

      for (const article of news) {
        const date =
          new Date(
            article.publishedAt,
          )
            .toISOString()
            .slice(0, 10);

        if (
          !timelineMap.has(
            date,
          )
        ) {
          timelineMap.set(
            date,
            {
              date,
              positive: 0,
              neutral: 0,
              negative: 0,
            },
          );
        }

        const entry =
          timelineMap.get(
            date,
          )!;

        if (
          article.sentiment ===
          "positive"
        ) {
          entry.positive +=
            1;
        } else if (
          article.sentiment ===
          "negative"
        ) {
          entry.negative +=
            1;
        } else {
          entry.neutral +=
            1;
        }
      }

      const timeline =
        [
          ...timelineMap.values(),
        ].sort(
          (a, b) =>
            new Date(
              a.date,
            ).getTime() -
            new Date(
              b.date,
            ).getTime(),
        );

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );

      res.set(
        "Pragma",
        "no-cache",
      );

      res.set(
        "Expires",
        "0",
      );

      res.json({
        value: timeline,
        Count:
          timeline.length,
      });
    } catch (error) {
      console.error(
        "News timeline fetch failed:",
        error,
      );

      res.status(500).json({
        message:
          "Unable to fetch news timeline.",
      });
    }
  },
);

export default router;