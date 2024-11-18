/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({ test: /\.(pdf)$/, type: 'asset/resource' });
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
        turbo: {
            resolveAlias: {
                canvas: './empty-module.ts',
            },
        },
    },
};

export default nextConfig;
