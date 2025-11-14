import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { client } from '@/sanity/client';
import { getAgentImagePath } from '@/lib/utils/agent';
import type {
  AgentPageApiResponse,
  ListingApiResponse,
  AgentArticle,
} from '@/types/api.types';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * Zapytanie do Sanity CMS o artykuły autora
 */
const AUTHOR_POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
  && author->firstName + " " + author->lastName == $authorFullName
]|order(date desc){
  _id,
  title,
  slug,
  date,
  excerpt,
  coverImage {
    asset->{
      url
    },
    alt
  }
}`;

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    // Znajdź agenta po slug z tabeli Agent
    const agent = await prisma.agent.findUnique({
      where: { slug },
      include: {
        listings: {
          where: {
            asariStatus: 'Active',
            isVisible: true,
          },
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: {
            dbUpdatedAt: 'desc',
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent nie został znaleziony' },
        { status: 404 }
      );
    }

    const listings = agent.listings;

    // Konwertuj daty na stringi dla JSON
    const listingsResponse: ListingApiResponse[] = listings.map(listing => ({
      ...listing,
      createdAtSystem: listing.createdAtSystem?.toISOString() || null,
      updatedAtSystem: listing.updatedAtSystem?.toISOString() || null,
      dbCreatedAt: listing.dbCreatedAt.toISOString(),
      dbUpdatedAt: listing.dbUpdatedAt.toISOString(),
      lastUpdatedAsari: listing.lastUpdatedAsari?.toISOString() || null,
      soldAt: listing.soldAt?.toISOString() || null,
      images: listing.images.map(img => ({
        id: img.id,
        asariId: img.asariId,
        urlNormal: img.urlNormal,
        urlThumbnail: img.urlThumbnail,
        urlOriginal: img.urlOriginal,
        description: img.description,
        order: img.order,
        isScheme: img.isScheme,
        dbCreatedAt: img.dbCreatedAt.toISOString(),
        dbUpdatedAt: img.dbUpdatedAt.toISOString(),
      })),
    }));

    // Pobierz artykuły z Sanity dla tego agenta
    const authorFullName = agent.fullName;
    let articles: AgentArticle[] = [];

    try {
      const sanityPosts = await client.fetch<
        Array<{
          _id: string;
          title: string;
          slug: { current: string };
          date: string;
          excerpt: string | null;
          coverImage?: {
            asset?: {
              url: string;
            };
            alt: string;
          };
        }>
      >(AUTHOR_POSTS_QUERY, { authorFullName }, { next: { revalidate: 60 } });

      articles = sanityPosts.map(post => ({
        _id: post._id,
        title: post.title,
        slug: post.slug.current,
        date: post.date,
        excerpt: post.excerpt,
        coverImage: post.coverImage?.asset?.url
          ? {
              url: post.coverImage.asset.url,
              alt: post.coverImage.alt || post.title,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Error fetching articles from Sanity:', error);
      // Kontynuuj bez artykułów, nie przerywaj całego requestu
    }

    // Przygotuj odpowiedź
    const response: AgentPageApiResponse = {
      agent: {
        asariId: agent.asariId,
        name: agent.firstName,
        surname: agent.lastName,
        fullName: agent.fullName,
        slug: agent.slug,
        phone: agent.phone,
        email: agent.email,
        imagePath:
          agent.imageFull || getAgentImagePath(agent.firstName, agent.lastName),
      },
      listings: listingsResponse,
      articles,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/agents/[slug]:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}
