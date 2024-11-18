import { OAuthConfig } from '@/model/oauth';
export const redditOAuthConfig: OAuthConfig = {
    service: 'Reddit',
    clientId: process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID!,
    scope: 'identity',
    authUrl: 'https://www.reddit.com/api/v1/authorize',
};

export const linkedinOAuthConfig: OAuthConfig = {
    service: 'LinkedIn',
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
    scope: 'profile email w_member_social',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
};

export const googleBloggersOAuthConfig: OAuthConfig = {
    service: 'Google Bloggers',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_BLOGGERS_CLIENT_ID!,
    scope: 'https://www.googleapis.com/auth/blogger',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
};

export const tumblrOAuthConfig: OAuthConfig = {
    service: 'Tumblr',
    clientId: process.env.NEXT_PUBLIC_TUMBLR_CLIENT_ID!,
    scope: 'write offline_access',
    authUrl: 'https://www.tumblr.com/oauth2/authorize',
};
export const googleOAuthConfig: OAuthConfig = {
    service: 'Google',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    scope: 'profile email',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
};
export const googleYoutubeOAuthConfig: OAuthConfig = {
    service: 'Google Youtube',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    scope: 'https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    extraParams: {
        access_type: 'offline',
        response_type: 'code',
    },
};
