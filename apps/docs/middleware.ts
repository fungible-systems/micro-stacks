import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore TODO: should be fixed soon upstream
import { locales } from 'nextra/locales';

const redirects: Record<string, string> = {
  '/docs': '/docs/getting-started',
  '/reference': '/reference/core/overview',
};

export function middleware(request: NextRequest) {
  // Handle redirect in `_middleware.ts` because of bug using `next.config.js`
  // https://github.com/shuding/nextra/issues/384
  if (request.nextUrl.pathname in redirects) {
    const url = request.nextUrl.clone();
    const pathname = redirects[request.nextUrl.pathname] ?? '/';
    url.pathname = pathname;
    return NextResponse.redirect(url);
  }
  return locales(request);
}
