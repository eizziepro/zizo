import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/Icons';

export default function NotFound() {
  return (
    <section className="bg-dark text-white py-20 min-h-[60vh] flex items-center justify-center text-center">
      <div className="wrap max-w-xl flex flex-col items-center gap-4">
        <span className="label-mono label-mono-inverse">404 &bull; Page Not Found</span>
        <h1 className="display-hero text-white">Looking for family care?</h1>
        <p className="text-base text-inverse-muted leading-relaxed">
          The page you requested could not be located. You can return to our homepage or connect directly with our coordination team in Surulere, Lagos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/" className="btn btn-primary">
            <span>Return to Home</span>
            <ArrowRightIcon size={16} />
          </Link>
          <Link href="/book-a-call/" className="btn btn-ghost-inverse">
            <span>Book a Call</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
