import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID as string;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Token exchange failed: ${resp.status} ${err}`);
  }

  return await resp.json();
}

async function getGoogleUserInfo(accessToken: string, idToken?: string) {
  // Prefer id_token (JWT) for basic profile; fallback to userinfo endpoint
  if (idToken) {
    // decode without verify just to read payload (Google signs it; optional verify here)
    try {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      return {
        sub: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
        name: payload.name,
        picture: payload.picture
      };
    } catch {}
  }

  const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!resp.ok) throw new Error('Failed to fetch user info');
  return await resp.json();
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const storedState = req.cookies.get('oauth_state')?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(`${url.origin}/login?error=oauth_state`);
    }

    if (!code) {
      return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
    }

    // Validate OAuth env config early for clearer errors
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${url.origin}/login?error=oauth_config`);
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/oauth/google/callback`;

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const { access_token, id_token } = tokens;

    const profile: any = await getGoogleUserInfo(access_token, id_token);
    const email = profile.email as string;
    const name = (profile.name as string) || email?.split('@')[0];

    if (!email) {
      return NextResponse.redirect(`${url.origin}/(auth)/login?error=no_email`);
    }

    // Find or create a user (Prisma model). Ensure there is a password for compatibility (set placeholder).
    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'PARENT', // Explicitly set role for OAuth users
          // Social accounts don't have local password; use a placeholder
          password: 'oauth-google',
          accountStatus: 'TRIAL',
          isTrialAccount: true,
          trialExpiresAt,
        }
      });
    }

    // Sign JWT and set cookie (mirrors email login behavior)
    const userRole = (user as any).role || 'PARENT';
    const token = jwt.sign({ userId: user.id, email: user.email, role: userRole }, JWT_SECRET, { expiresIn: '1d' });

    // Redirect based on role
    const roleMap: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'PARENT': '/parents/dashboard',
      'CLUB': '/club/dashboard',
      'TEACHER': '/profesor/dashboard',
      'PROFESOR': '/profesor/dashboard'
    };
    const redirectPath = roleMap[userRole.toUpperCase()] || '/parents/dashboard';
    
    // Add success message parameter
    const successParam = isNewUser ? 'new_user' : 'login_success';
    const res = NextResponse.redirect(`${url.origin}${redirectPath}?oauth=${successParam}`);
    
    res.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24, sameSite: 'none', secure: true });
    // Clear state cookie
    res.cookies.set('oauth_state', '', { httpOnly: true, path: '/', maxAge: 0 });

    return res;
  } catch (err: any) {
    console.error('Google OAuth error:', err?.message || err);
    const url = new URL(req.url);
    return NextResponse.redirect(`${url.origin}/login?error=google_oauth`);
  }
}
