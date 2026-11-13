import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'ApexLead Growth CRM - Agency Sales & WhatsApp Leads Tracker',
  description: 'Dynamic Sales & Lead Management Platform for Digital Marketing, Website Development, SEO, Paid Ads & GBP Agencies',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

