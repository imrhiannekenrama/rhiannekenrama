'use client';
import Link from 'next/link';
import { useNav } from './Providers';

// Internal link that triggers the page-wipe transition.
export default function TLink({ href, onClick, children, ...rest }) {
  const { go } = useNav();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(href);
      }}
    >
      {children}
    </Link>
  );
}
