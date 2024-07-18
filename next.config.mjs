import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns:[
          {  protocol: 'https',
            hostname: 'utfs.io',
            pathname: '**'
        },
        ],
        
    },
};

export default nextConfig;
