import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FairCarRepair - Get Competitive Repair Quotes',
  description: 'Get competitive quotes from trusted mechanics in your area. Compare prices and reviews to find the best service for your car repair needs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        {/* You can keep your footer here if you have one */}
      </body>
    </html>
  )
}