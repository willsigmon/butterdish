# 🚀 Deployment Guide for ButterDish

## Quick Deploy to Vercel (Recommended)

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Navigate to project directory
cd /Volumes/Ext-code/GitHub\ Repos/butterdish

# Deploy!
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your Vercel account
- **Link to existing project?** No (for first deployment)
- **Project name?** butterdish (or your preferred name)
- **Directory?** ./ (current directory)
- **Want to override settings?** No

The CLI will give you:
- ✅ A preview URL (e.g., `butterdish-abc123.vercel.app`)
- ✅ Automatic HTTPS
- ✅ Global CDN deployment

For production deployment:
```bash
vercel --prod
```

### Option 2: GitHub + Vercel (Automated)

1. **Create GitHub Repository**:
   ```bash
   # Create a new repo on GitHub, then:
   cd /Volumes/Ext-code/GitHub\ Repos/butterdish
   git remote add origin git@github.com:YOUR_USERNAME/butterdish.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
   - Click "Deploy"

3. **Auto-Deployments**: Every push to `main` will auto-deploy!

## After Deployment

### Testing Checklist

1. **Visit Your Dashboard**: Open the deployed URL
2. **Check API Endpoint**: `https://your-url.vercel.app/api/campaign`
3. **Wait for Auto-Refresh**: Dashboard updates every 45 seconds
4. **Test on Mobile**: Open on your phone
5. **Test Animations**: Watch for smooth counter and progress bar

### Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., `butterdish.hubzonetech.org`)
3. Follow DNS configuration instructions
4. Vercel handles HTTPS automatically!

### Environment Variables

**Good news**: ButterDish doesn't need any environment variables! It works out of the box.

## Monitoring

### Check if it's working:

```bash
# Test the API endpoint
curl https://your-url.vercel.app/api/campaign

# Should return JSON with campaign data
```

### View Logs:

```bash
# With Vercel CLI
vercel logs

# Or in Vercel dashboard: Project → Logs
```

## Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# If successful locally, check Vercel build logs
```

### API Returns 500

- Check Givebutter campaign is still accessible
- Verify URL in `app/api/campaign/route.ts`
- Check Vercel function logs for errors

### Slow Loading

- Vercel automatically optimizes on first deploy
- Check your internet connection
- API has 30-second cache to avoid hammering Givebutter

## Updating the Dashboard

### After making changes:

```bash
# Option 1: If using Vercel CLI
vercel --prod

# Option 2: If using GitHub integration
git add .
git commit -m "Update dashboard"
git push
# Vercel auto-deploys!
```

## Share with HTI Team

Once deployed, share:
- **Dashboard URL**: https://your-url.vercel.app
- **Bookmark it** on office computers/devices
- **Add to home screen** on mobile devices for app-like experience

---

**Questions?** Check the main [README.md](./README.md) or HTI's internal docs!
