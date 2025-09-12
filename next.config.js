/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure all pages are included in the build
    trailingSlash: false,
    // Enable standalone output for Docker
    output: 'standalone',
}

module.exports = nextConfig
