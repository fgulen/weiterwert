import { NextResponse, type NextRequest } from 'next/server';
import { getAppEnv } from '@/lib/env';
import { checkBasicAuth } from '@/lib/basic-auth';
import { requiresAuth } from '@/lib/auth-required';
import { trenneSprache } from '@/lib/i18n/sprache';

export function proxy(request: NextRequest) {
  // /tr/... and /en/... are served by the German page paths; the language goes in a request header.
  const { lang, rest } = trenneSprache(request.nextUrl.pathname);
  const headers = new Headers(request.headers);
  headers.set('x-lang', lang);
  headers.set('x-pfad', rest);
  let res: NextResponse;
  if (lang === 'de') {
    res = NextResponse.next({ request: { headers } });
  } else {
    const url = request.nextUrl.clone();
    url.pathname = rest;
    res = NextResponse.rewrite(url, { request: { headers } });
  }

  const protectedSite = requiresAuth({
    vercelEnv: process.env.VERCEL_ENV,
    basicAuthUser: process.env.BASIC_AUTH_USER,
  });
  if (!protectedSite) {
    if (getAppEnv() === 'test') res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  const ok = checkBasicAuth(
    request.headers.get('authorization'),
    process.env.BASIC_AUTH_USER,
    process.env.BASIC_AUTH_PASSWORD,
  );
  if (!ok) {
    return new NextResponse('Anmeldung erforderlich', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="WeiterWert Test", charset="UTF-8"' },
    });
  }
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|fonts/).*)'],
};
