import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { type SanityDocument } from 'next-sanity';
import { client } from '@/sanity/client';
import { PortableText } from '@portabletext/react';
import { Mail, Phone } from 'lucide-react';
import TableOfContents from '@/components/blog/TableOfContents';
import AuthorAvatar from '@/components/blog/AuthorAvatar';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Calculate estimated reading time
function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} minut${minutes === 1 ? 'a' : minutes < 5 ? 'y' : ''} czytania`;
}

// Query single post by slug
const POST_QUERY = `*[
  _type == "post"
  && slug.current == $slug
][0]{
  _id,
  title,
  slug,
  date,
  excerpt,
  content,
  "plainTextBody": pt::text(content),
  "headings": content[style in ["h2", "h3", "h4", "heading2", "heading3", "heading4"]]{
    style,
    "text": pt::text(@)
  },
  author->{
    firstName,
    lastName,
    slug,
    image {
      asset->{
        url
      }
    },
    email,
    phone
  },
  coverImage {
    asset->{
      url
    },
    alt
  }
}`;

const options = { next: { revalidate: 30 } };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post: SanityDocument = await client.fetch(
    POST_QUERY,
    { slug },
    options
  );

  if (!post) {
    notFound();
  }

  return (
    <div className='mt-22'>
      {/* Hero Image */}

      <div className='max-w-[1320px] mx-auto'>
        <Breadcrumbs className='py-5' />

        <div className='mt-10 relative h-[300px] md:h-[440px] overflow-hidden rounded-[20px]'>
          <Image
            src={post.coverImage?.asset?.url}
            alt={post.coverImage?.alt || post.title}
            fill
            priority
            quality={100}
            sizes='100vw'
            className='object-cover'
          />
        </div>

        {/* Title and Meta - Full Width Centered */}
        <header className='mt-14 mb-18 text-center max-w-[1000px] mx-auto'>
          <h1 className='text-[32px]/[40px] md:text-[40px]/[48px] font-semibold mb-4'>
            {post.title}
          </h1>
          <div className='flex items-center justify-center gap-4 text-sm text-gray-600'>
            {post.date && (
              <time>
                {new Date(post.date).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            )}
            {post.plainTextBody && (
              <>
                <span>•</span>
                <span>{calculateReadingTime(post.plainTextBody)}</span>
              </>
            )}
          </div>
        </header>

        {/* 3 Column Layout: TOC | Content | Author */}
        <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-8 xl:gap-12'>
          {/* Left Sidebar - Table of Contents */}
          {post.headings && post.headings.length > 0 && (
            <TableOfContents headings={post.headings} />
          )}

          {/* Center - Article Content */}
          <article className='min-w-0 mb-14 lg:mb-0'>
            <div className='prose prose-lg max-w-none'>
              {post.content && (
                <PortableText
                  value={post.content}
                  components={{
                    block: {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      h2: ({ children, value }: any) => {
                        const index = post.headings?.findIndex(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (h: any) => h.text === value?.children?.[0]?.text
                        );
                        return (
                          <h2
                            id={index !== -1 ? `heading-${index}` : undefined}
                            className='text-2xl font-bold mt-10 mb-4'
                          >
                            {children}
                          </h2>
                        );
                      },
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      h3: ({ children, value }: any) => {
                        const index = post.headings?.findIndex(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (h: any) => h.text === value?.children?.[0]?.text
                        );
                        return (
                          <h3
                            id={index !== -1 ? `heading-${index}` : undefined}
                            className='text-xl font-bold mt-6 mb-3'
                          >
                            {children}
                          </h3>
                        );
                      },
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      h4: ({ children, value }: any) => {
                        const index = post.headings?.findIndex(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (h: any) => h.text === value?.children?.[0]?.text
                        );
                        return (
                          <h4
                            id={index !== -1 ? `heading-${index}` : undefined}
                            className='text-xl font-bold mt-6 mb-3'
                          >
                            {children}
                          </h4>
                        );
                      },
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      normal: ({ children }: any) => (
                        <p className='mb-4 text-gray-700 leading-relaxed text-[18px]/[28px]'>
                          {children}
                        </p>
                      ),
                    },
                    list: {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      bullet: ({ children }: any) => (
                        <ul className='list-disc pl-6 mb-4 space-y-2 text-[18px]/[28px]'>
                          {children}
                        </ul>
                      ),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      number: ({ children }: any) => (
                        <ol className='list-decimal pl-6 mb-4 space-y-2 text-[18px]/[28px]'>
                          {children}
                        </ol>
                      ),
                    },
                    listItem: {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      bullet: ({ children }: any) => (
                        <li className='text-gray-700 text-[18px]/[28px]'>
                          {children}
                        </li>
                      ),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      number: ({ children }: any) => (
                        <li className='text-gray-700 text-[18px]/[28px]'>
                          {children}
                        </li>
                      ),
                    },
                    marks: {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      strong: ({ children }: any) => (
                        <strong className='font-bold'>{children}</strong>
                      ),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      em: ({ children }: any) => (
                        <em className='italic'>{children}</em>
                      ),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      link: ({ children, value }: any) => (
                        <a
                          href={value?.href}
                          className='text-green-primary hover:underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {children}
                        </a>
                      ),
                    },
                    types: {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      image: ({ value }: any) => (
                        <figure className='my-8'>
                          <Image
                            src={value.asset.url}
                            alt={value.alt || ''}
                            width={800}
                            height={600}
                            className='rounded-xl'
                          />
                          {value.caption && (
                            <figcaption className='text-sm text-gray-600 text-center mt-2'>
                              {value.caption}
                            </figcaption>
                          )}
                        </figure>
                      ),
                    },
                  }}
                />
              )}
            </div>
          </article>

          {/* Right Sidebar - Author Info */}
          {post.author && (
            <aside>
              <div className='lg:sticky lg:top-8'>
                <div className='bg-white rounded-2xl shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] p-6'>
                  {/* Author Avatar */}
                  <AuthorAvatar
                    firstName={post.author.firstName}
                    lastName={post.author.lastName}
                  />

                  {/* Author Name */}
                  <h3 className='text-xl font-bold text-center mb-1'>
                    {post.author.firstName} {post.author.lastName}
                  </h3>
                  <p className='text-sm text-gray-600 text-center mb-6'>
                    Specjalista ds. nieruchomości
                  </p>

                  {/* Contact Info */}
                  <div className='space-y-3 mb-6'>
                    {post.author.phone && (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-green-primary/10 flex items-center justify-center'>
                          <Phone className='size-5 text-green-primary' />
                        </div>
                        <a
                          href={`tel:${post.author.phone}`}
                          className='text-sm font-medium hover:text-green-primary transition-colors'
                        >
                          {post.author.phone}
                        </a>
                      </div>
                    )}
                    {post.author.email && (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-green-primary/10 flex items-center justify-center'>
                          <Mail className='size-5 text-green-primary' />
                        </div>
                        <a
                          href={`mailto:${post.author.email}`}
                          className='text-sm font-medium hover:text-green-primary transition-colors'
                        >
                          {post.author.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {post.author.slug?.current ? (
                    <Link href={`/agenci/${post.author.slug.current}`}>
                      <Button className='w-full'>Odwiedź profil</Button>
                    </Link>
                  ) : (
                    <Button className='w-full'>Odwiedź profil</Button>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
