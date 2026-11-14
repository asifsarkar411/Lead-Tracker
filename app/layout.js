import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'Lead Tracker | Agency Sales & WhatsApp Leads CRM',
  description: 'Dynamic Sales & Lead Management Platform for Digital Marketing, Website Development, SEO, Paid Ads & GBP Agencies',
  applicationName: 'Lead Tracker CRM',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lead Tracker',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
