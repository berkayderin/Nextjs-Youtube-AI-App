/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['whisper']
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals.push('whisper')
		}
		return config
	}
}

export default nextConfig
