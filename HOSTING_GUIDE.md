# 🚀 Free Hosting Instructions for Kirana Invoice Generator

## Option 1: Vercel (Recommended) ⭐

Vercel is perfect for React apps with serverless functions and offers excellent free tier.

### Prerequisites
- A GitHub account
- Git installed on your system

### Step 1: Prepare Your Code
```bash
# Build the project to ensure everything works
npm install
npm run build
```

### Step 2: Push to GitHub
1. Create a new repository on GitHub (e.g., "kirana-invoice-generator")
2. Initialize git in your project folder:
```bash
git init
git add .
git commit -m "Initial commit: Kirana Invoice Generator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kirana-invoice-generator.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect it's a Vite project
6. Click "Deploy"

Your app will be live at: `https://your-project-name.vercel.app`

### Step 4: Configure Environment (if needed)
- Vercel automatically handles the serverless function in `/api/generate-excel.js`
- No additional configuration needed!

---

## Option 2: Netlify + Render (Frontend + Backend)

### Frontend on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Backend on Render
1. Create a separate repository for just the backend:
```bash
mkdir kirana-backend
cd kirana-backend
# Copy server folder contents
cp -r ../server/* .
# Create package.json for backend
```

2. Create `package.json` for backend:
```json
{
  "name": "kirana-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "exceljs": "^4.4.0"
  }
}
```

3. Deploy to Render:
   - Go to [render.com](https://render.com)
   - Connect GitHub
   - Create "Web Service"
   - Choose your backend repository
   - Start command: `npm start`

4. Update frontend to use Render backend URL

---

## Option 3: GitHub Pages (Frontend Only - No Excel Generation)

If you don't need Excel generation, you can use GitHub Pages for free:

1. Build the project:
```bash
npm run build
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add to package.json:
```json
"homepage": "https://YOUR_USERNAME.github.io/kirana-invoice-generator",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. Deploy:
```bash
npm run deploy
```

---

## Option 4: Railway (Full-Stack)

Railway offers great free tier for full-stack apps:

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect and deploy both frontend and backend

---

## Recommended Setup: Vercel

**Why Vercel is recommended:**
- ✅ Zero configuration
- ✅ Serverless functions (your Excel generation works automatically)
- ✅ Excellent free tier
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains supported

## Post-Deployment Checklist

After deployment, test these features:
1. ✅ Add items to the invoice
2. ✅ Try different packaging types
3. ✅ Test auto-calculation of opening stock
4. ✅ Generate Excel file
5. ✅ Download Excel file
6. ✅ Verify Excel numbers are formatted correctly

## Free Tier Limits

### Vercel Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 100 deployments/day
- ✅ Serverless Functions: 100GB-Hrs/month
- ✅ Custom domains supported

### Netlify Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month

### Render Free Tier:
- ✅ 750 hours/month
- ⚠️ Apps sleep after 15 minutes of inactivity

## Troubleshooting

### Excel Download Not Working?
- Check browser console for errors
- Ensure the API route is accessible
- Verify serverless function logs in Vercel dashboard

### Build Failures?
- Check that all dependencies are in package.json
- Ensure TypeScript compilation passes: `npm run build`
- Check Vercel build logs for specific errors

### Domain Issues?
- Allow 24-48 hours for custom domain propagation
- Ensure DNS settings are correct

## Support
If you face any issues during deployment, check:
1. Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Build logs in your hosting platform dashboard
3. Browser developer console for runtime errors

Your Kirana Invoice Generator is now ready for the world! 🎉
