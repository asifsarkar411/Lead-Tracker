# ApexLead Growth CRM - Agency Sales & WhatsApp Leads Tracker

A high-converting, modern, dynamic web application designed specifically for sales executives in digital agencies offering **Website Development**, **SEO**, **Digital Marketing**, **Paid Ads**, and **GBP (Google Business Profile)**.

---

## 🌟 Key Features

### 1. Inbound WhatsApp Leads & Ads Tracker
- **Records Client Information**: Client Name, WhatsApp Phone Number (with 1-click direct WhatsApp chat link), Requirements, Estimated Budget, and Services Requested.
- **Potentiality Status**: Mark leads as **Hot 🔥**, **Warm ☀️**, **Cold ❄️**, **Converted 🏆**, or **Lost ❌**.
- **Proposal Sent Status**: Track proposals through **Drafted**, **Sent**, **Under Review**, **Accepted**, and **Rejected**.
- **Follow-Up Date & Time Notice Alarm**: Set exact follow-up dates and times with automatic urgency alerts:
  - 🚨 **Overdue Notice**: Pulsing red alert for missed follow-ups.
  - ⏰ **Due Today**: High-priority amber badge with Web Audio notification chime.
  - 📅 **Upcoming**: Scheduled contact calendar.
- **Multiple Follow-up Notes Timeline**: Record multiple timestamped notes (`Note #1`, `Note #2`, `Note #3`...) with specific outcomes (Connected, Sent Details, Meeting Requested, etc.).

### 2. Cold Outreach & CSV Arranged Sheet
- **CSV File Import**: Drag-and-drop CSV files or paste raw text from outreach campaigns.
- **Arranged Spreadsheet Grid**: Automatically arranges leads into an interactive spreadsheet with sticky headers.
- **In-line Dropdown Editing**: Change potentiality status, meeting status, and proposal status directly in the table.
- **Multiple Outreach Notes**: Log multiple follow-up touchpoints per cold lead.
- **1-Click Onboarding**: Convert any cold lead directly into an **Onboarded Client** or **Inbound Lead**.
- **Export Arranged CSV**: Download enriched, cleaned spreadsheets anytime.

### 3. Onboarded Clients & Revenue Management
- **Deal Financials**: Track **Asking Cost (Quoted)** vs **Won Deal Cost (Closed)** with automatic discount variance calculation.
- **Payment Status**: Track **Paid in Full**, **Partial Deposit**, **Pending Invoice**, and **Overdue**.
- **Cash Flow Tracking**: Real-time totals for **Won Revenue**, **Cash Collected**, and **Outstanding Balance**.
- **Client Project Status**: **Onboarding**, **Active**, **In Progress**, **Delivered**, **Monthly Retainer**, and **Completed**.

### 4. Dynamic Admin Control Panel
- **100% Dynamic Frontend**:
  - Website Name and Tagline can be changed dynamically from the Admin Panel.
  - Website Logo can be updated via custom URL or preset.
  - Currency Symbol switchable (`$`, `৳`, `₹`, `£`, `€`, `AED`, etc.).
  - Primary agency contact phone and email editable.
- **Dynamic Services Portfolio Manager**: Add, edit, or remove services (e.g. Website development, SEO, Paid Ads, GBP, TikTok Ads, AI Chatbots) which immediately reflect in all dropdowns and filters.
- **WhatsApp Message Templates**: Customize default WhatsApp message scripts with variables like `{name}` and `{service}` for fast 1-click follow-ups.
- **Dark & Light Mode**: Built-in sleek dark and light mode toggle with persistent state.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Database**: MongoDB Atlas with Mongoose (with built-in zero-config in-memory fallback for immediate out-of-the-box local testing)
- **Hosting & Deployment**: Vercel via GitHub

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🍃 MongoDB Atlas Configuration

The application works immediately out-of-the-box with pre-loaded demo agency data. To persist your data in MongoDB Atlas:

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User under **Database Access**.
3. Allow IP access (`0.0.0.0/0`) under **Network Access**.
4. Copy your connection string and add it to `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/leadtracker?retryWrites=true&w=majority
```
Restart the dev server and your app is now connected to MongoDB Atlas!

---

## 🌐 Deploy to Vercel via GitHub

1. Initialize git and commit your files:
```bash
git init
git add .
git commit -m "Initial commit of ApexLead Growth CRM"
```
2. Create a new repository on [GitHub](https://github.com) and push your code:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```
3. Go to [Vercel](https://vercel.com) and click **"Add New" > "Project"**.
4. Import your GitHub repository.
5. In **Environment Variables**, add:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
6. Click **Deploy**. Your app is live with SSL on a free `.vercel.app` domain!

