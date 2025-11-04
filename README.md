# 🧈 ButterDish

**Live Campaign Dashboard for HUBZone Technology Initiative**

ButterDish is a real-time fundraising dashboard that tracks the "Gift of Access" Givebutter campaign for HTI employees. It features live data updates, animated counters, confetti celebrations, and a beautiful responsive design.

## ✨ Features

- **Live Tracking**: Auto-refreshes campaign data every 45 seconds
- **Animated Counters**: Smooth number animations when donations come in
- **Milestone Celebrations**: Confetti effects at 25%, 50%, 75%, and 100% goal completion
- **Circular Progress Indicator**: Visual percentage display
- **Mobile-Responsive**: Works flawlessly on phones, tablets, and desktops
- **Real-time Indicators**: Shows last updated time and refresh status
- **HTI Branding**: Uses official colors (#F67B16 orange, #1e3a5f navy)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone or navigate to the project
cd butterdish

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard in action!

## 📁 Project Structure

```
butterdish/
├── app/
│   ├── api/
│   │   └── campaign/
│   │       └── route.ts       # Serverless API endpoint
│   ├── page.tsx               # Main dashboard component
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── public/                    # Static assets
├── package.json              
├── tsconfig.json             
├── tailwind.config.ts        
└── README.md                 
```

## 🔧 How It Works

### Data Source

ButterDish fetches campaign data from the Givebutter campaign page (https://givebutter.com/giftofaccess) using a serverless API endpoint that:

1. Makes a server-side HTTP request to the Givebutter page (bypasses CORS)
2. Parses the HTML to extract the embedded `window.GB_CAMPAIGN` JavaScript object
3. Extracts and structures the following data:
   - Campaign ID and title
   - Goal amount and raised amount
   - Percentage raised
   - Supporter count
   - Cover image URL
   - Theme color

### Architecture

- **Frontend**: React/Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Data Fetching**: Cheerio for HTML parsing
- **Animations**: canvas-confetti for celebrations, CSS animations for counters
- **Hosting**: Optimized for Vercel deployment

### Auto-Refresh Logic

```typescript
// Fetches every 45 seconds
useEffect(() => {
  fetchData();
  const interval = setInterval(() => fetchData(true), 45000);
  return () => clearInterval(interval);
}, []);
```

### Milestone Detection

The dashboard automatically detects when the campaign reaches 25%, 50%, 75%, or 100% of its goal and triggers celebratory confetti animations (only once per milestone).

## 🎨 Design System

### Colors

- **Primary Orange**: `#F67B16` (Givebutter theme)
- **Navy Blue**: `#1e3a5f` (HTI brand)
- **Accent Gold**: `#ffd700` (celebrations)
- **Background**: Gradient from slate-900 to blue-900

### Typography

- **Headings**: Bold, large sizes (4xl to 8xl)
- **Body**: Clean, readable with proper contrast
- **Numbers**: Extra bold for emphasis on key metrics

### Animations

- **Fade In**: Smooth page load
- **Slide Up**: Staggered card appearances
- **Pulse**: Subtle breathing effect on live elements
- **Counter**: Ease-out-quart easing for number animations
- **Confetti**: Particle effects on donations and milestones

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Via CLI**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Via GitHub**:
   - Push to GitHub
   - Import project in Vercel dashboard
   - Deploy automatically

### Environment Variables

No environment variables required! The app works out of the box.

### Build Commands

```bash
# Production build
npm run build

# Start production server (after build)
npm start

# Lint code
npm run lint
```

## 📱 Mobile Optimization

- Responsive breakpoints: 360px (mobile), 768px (tablet), 1024px+ (desktop)
- Touch-friendly buttons (minimum 44px tap targets)
- Optimized images and lazy loading
- Smooth scroll and animations on mobile devices

## 🛠️ Development

### Adding New Features

The dashboard is built with modularity in mind. Key areas:

- **API Endpoint**: Modify `/app/api/campaign/route.ts` to change data source
- **Dashboard UI**: Edit `/app/page.tsx` for layout and components
- **Styling**: Use Tailwind classes or add custom CSS in the jsx `<style>` block

### Testing Locally

```bash
# Run dev server
npm run dev

# Test API endpoint directly
curl http://localhost:3000/api/campaign
```

## 🎯 Use Cases

- **Employee Dashboard**: Monitor campaign progress in real-time
- **Office Display**: Show on screens in HTI office
- **Mobile Monitoring**: Check progress on phones during events
- **Donor Engagement**: Share live progress with team members

## 🤝 Contributing

This dashboard was built specifically for HTI's "Gift of Access" campaign. To adapt for other campaigns:

1. Update the Givebutter URL in `/app/api/campaign/route.ts`
2. Adjust branding colors in `/app/page.tsx`
3. Modify goal amounts and messaging as needed

## 📄 License

Built with 💛 for HUBZone Technology Initiative

## 🐛 Troubleshooting

### Data Not Loading

- Check that https://givebutter.com/giftofaccess is accessible
- Verify the API endpoint is running: `http://localhost:3000/api/campaign`
- Check browser console for error messages

### Animations Not Working

- Ensure JavaScript is enabled
- Try refreshing the page
- Check that canvas-confetti is installed: `npm list canvas-confetti`

### Mobile Issues

- Clear browser cache
- Ensure viewport meta tag is present
- Test in multiple browsers (Chrome, Safari, Firefox)

## 📞 Support

For questions or issues specific to HTI:
- **Website**: https://hubzonetech.org
- **Email**: info@hubzonetech.org

---

**Built with Next.js, TypeScript, Tailwind CSS, and ✨**
