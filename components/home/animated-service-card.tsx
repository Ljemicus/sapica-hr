'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
// import { TiltCard } from '@/components/animations/tilt-card';

interface AnimatedServiceCardProps {
  href: string;
  image: string;
  title: string;
  body: string;
  cta: string;
  index: number;
}

export function AnimatedServiceCard({
  href,
  image,
  title,
  body,
  cta,
  index,
}: AnimatedServiceCardProps) {
  return (
    <Link href={href} className="group block">
      {/* <TiltCard tiltAmount={8} scale={1.02}> */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-shadow duration-500"
        >
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
          <motion.h3
            className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-2 md:mb-3 font-[var(--font-heading)]"
            initial={{ y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          <p className="text-white/75 text-sm md:text-base leading-relaxed mb-4 max-w-xs">
            {body}
          </p>
          <motion.span
            className="inline-flex items-center text-sm font-semibold text-white/90 group-hover:text-white"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            {cta}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.span>
        </div>

        {/* Floating icon badge */}
        <motion.div
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
        >
          <ArrowRight className="h-5 w-5 text-white" />
        </motion.div>
        </motion.article>
      {/* </TiltCard> */}
    </Link>
  );
}
