import Link from 'next/link';
import Image from 'next/image';

interface AnimatedServiceCardProps {
  href: string;
  image: string;
  title: string;
  body: string;
  cta: string;
}

export function AnimatedServiceCard({
  href,
  image,
  title,
  body,
  cta,
}: AnimatedServiceCardProps) {
  return (
    <Link prefetch={false} href={href} className="group block">
        <article className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-shadow duration-500">
        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px]">
            <div className="w-full h-full rounded-3xl bg-card" />
          </div>
        </div>

        {/* Image container */}
        <div className="relative aspect-[4/3] md:aspect-[3/4] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-2 md:mb-3 font-[var(--font-heading)]">
            {title}
          </h3>
          <p className="text-white/75 text-sm md:text-base leading-relaxed mb-4 max-w-xs">
            {body}
          </p>
          <span className="inline-flex items-center text-sm font-semibold text-white/90 group-hover:text-white">
            {cta}
            <span className="ml-2">→</span>
          </span>
        </div>

        {/* Floating icon badge */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white">→</span>
        </div>
        </article>
    </Link>
  );
}
