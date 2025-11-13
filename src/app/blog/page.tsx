import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import AgentBadge from '@/components/ui/agentBadge';
import { ArrowRight } from 'lucide-react';
import { type SanityDocument } from 'next-sanity';
import { client } from '@/sanity/client';

// Calculate estimated reading time based on plain text content
function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} minut${minutes === 1 ? 'a' : minutes < 5 ? 'y' : ''} czytania`;
}

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(date desc)[0...12]{
  _id,
  title,
  slug,
  date,
  excerpt,
  content,
  "plainTextBody": pt::text(content),
  author->{
    firstName,
    lastName,
    image
  },
  coverImage {
    asset->{
      url
    },
    alt
  }
}`;

const options = { next: { revalidate: 30 } };

export default async function Page() {
  const posts: SanityDocument[] = await client.fetch<SanityDocument[]>(
    POSTS_QUERY,
    {},
    options
  );

  // Ostatni (najnowszy) post to featured article
  const featuredPost = posts[0];
  // Pozostałe posty to grid
  const gridPosts = posts.slice(1, 7);

  return (
    <div className='my-22 max-w-[1140px] mx-auto'>
      <Breadcrumbs className='full-bleed p-12 pt-4 mb-3' />

      {/* Featured Article */}
      {featuredPost && (
        <article className='mb-12 bg-white rounded-2xl overflow-hidden shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-0'>
            {/* Image */}
            <div className='relative h-[300px] lg:h-auto lg:min-h-[400px]'>
              <Image
                src={featuredPost.coverImage?.asset?.url || '/rent-1.png'}
                alt={featuredPost.coverImage?.alt || featuredPost.title}
                fill
                sizes='(max-width: 1024px) 100vw, 50vw'
                className='object-cover'
              />
            </div>

            {/* Content */}
            <div className='p-8 lg:p-12 flex flex-col justify-center'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='inline-flex items-center px-3 py-1 rounded-full bg-green-primary text-white text-sm font-medium'>
                  Nowy artykuł
                </span>
                {featuredPost.plainTextBody && (
                  <span className='text-sm text-gray-600'>
                    {calculateReadingTime(featuredPost.plainTextBody)}
                  </span>
                )}
              </div>

              <h2 className='text-[32px]/[40px] lg:text-[40px]/[48px] font-bold mb-4 line-clamp-2'>
                {featuredPost.title}
              </h2>

              <p className='text-base lg:text-lg text-gray-700 mb-6 line-clamp-3'>
                {featuredPost.excerpt ||
                  (featuredPost.plainTextBody
                    ? featuredPost.plainTextBody.slice(0, 200) + '...'
                    : 'Przeczytaj więcej o tym artykule...')}
              </p>

              <div className='flex items-center justify-between'>
                {featuredPost.author?.firstName && (
                  <AgentBadge
                    name={featuredPost.author.firstName}
                    fullNameForImage={`${featuredPost.author.firstName} ${featuredPost.author.lastName}`}
                    placement='listing'
                  />
                )}

                <Link
                  href={`/blog/${featuredPost.slug.current}`}
                  className='inline-flex items-center gap-2 text-green-primary font-bold hover:gap-3 transition-all'
                >
                  Przejdź do artykułu
                  <ArrowRight className='size-4' />
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Blog Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10'>
        {gridPosts.map(post => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            className='group bg-white rounded-2xl overflow-hidden shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] hover:shadow-[0_12px_48px_0_rgba(164,167,174,0.18)] transition-all'
          >
            {/* Image with Author Badge */}
            <div className='relative h-[240px]'>
              <Image
                src={post.coverImage?.asset?.url || '/rent-1.png'}
                alt={post.coverImage?.alt || post.title}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                className='object-cover'
              />
              {post.author?.firstName && (
                <div className='absolute top-4 left-4'>
                  <AgentBadge
                    name={post.author.firstName}
                    fullNameForImage={`${post.author.firstName} ${post.author.lastName}`}
                    placement='homepage'
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className='p-6'>
              <h3 className='text-xl font-bold mb-3 line-clamp-2 group-hover:text-green-primary transition-colors'>
                {post.title}
              </h3>
              <p className='text-sm text-gray-700 mb-4 line-clamp-3'>
                {post.excerpt ||
                  (post.plainTextBody
                    ? post.plainTextBody.slice(0, 150) + '...'
                    : 'Przeczytaj więcej...')}
              </p>
              {post.date && (
                <time className='text-sm text-gray-500'>
                  {new Date(post.date).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      <div className='flex justify-center'>
        <Button variant='outline' className='gap-2'>
          Zobacz więcej
          <ArrowRight className='size-4' />
        </Button>
      </div>
    </div>
  );
}
