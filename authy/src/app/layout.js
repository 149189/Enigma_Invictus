import { Geist, Geist_Mono } from "next/font/google"; 
import './globals.css';
import GoogleAuthProvider from '../components/GoogleAuthProvider.js';
import HeaderWrapper from '../components//HeaderWrapper/HeaderWrapper'; // import the client wrapper

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'CommunityFund',
  description: 'Micro-donations platform for local causes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HeaderWrapper />
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
