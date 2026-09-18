# Music Ministry Monitor

A web application for tracking weekly music ministry activities. Members can submit their weekly monitoring reports and view their submission history.

## Features

- **Weekly Monitoring Form**: Track attendance, practices, performances, requirements, and personal spiritual growth
- **Personal Submission History**: View all previous submissions
- **Support for Multiple Ministries**: Choir and Orchestra with specific forms for each
- **Cloud Deployment**: Ready to deploy on Vercel
- **Responsive Design**: Works on desktop and mobile

## Getting Started

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment to Vercel

1. **Initialize Git**:
```bash
cd music-ministry-monitor
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your local code to GitHub

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Your app will be live and accessible from a Vercel URL.

## Form Fields

### Personal Information
- Name
- Voice/Instrument
- Bible Verse
- Week Starting Date
- Ministry Type (Choir/Orchestra)

### Tracking Sections
1. **Attendance**: Track presence at church services and events
2. **Practices**: Record practice attendance
3. **Performances**: Log performance participation
4. **Ministry Requirements**: Monitor uniform, music sheets, and memorization
5. **Personal Walk**: Track spiritual activities (Bible reading, souls won, tithes, etc.)

## Data Storage

- Submissions are stored in `data/submissions.json` (created automatically)
- Each user's submissions are stored with their name for easy retrieval
- No external database required for initial deployment

## Tech Stack

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **API Routes**: Backend endpoints
