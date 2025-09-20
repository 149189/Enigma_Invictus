/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, 
  },
  images: {
    domains: ["lh3.googleusercontent.com","res.cloudinary.com","img.freepik.com","cdn.pixabay.com","stimg.cardekho.com","d9s1543upwp3n.cloudfront.net","s.driving-tests.org","www.freshbooks.com","techdrive.co","wallpapercave.com","st.depositphotos.com","media.sciencephoto.com"],
  },
};

export default nextConfig;