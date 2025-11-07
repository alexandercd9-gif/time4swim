import { NextRequest, NextResponse } from 'next/server';

// Generates a simple random string for state parameter
function generateState(length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/oauth/google/callback`;

  if (!clientId) {
    return NextResponse.json({
      success: false,
      message: 'Falta GOOGLE_CLIENT_ID en el entorno.'
    }, { status: 500 });
  }

  // Generate state to mitigate CSRF; store in cookie (short lived)
  const state = generateState();
  const scope = [
    'openid',
    'email',
    'profile'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    include_granted_scopes: 'true',
    state,
    prompt: 'consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const res = NextResponse.redirect(authUrl);
  // Set cookie with state (5 min)
  res.cookies.set('oauth_state', state, { httpOnly: true, path: '/', maxAge: 300, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res;
}
