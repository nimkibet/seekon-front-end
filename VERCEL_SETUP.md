# 🚀 Vercel Deployment Configuration Guide

## ✅ Frontend Deployment
Your frontend is successfully deployed at: **https://seekon-apparel.vercel.app/**

---

## 🔧 Required Environment Variables

You need to configure these environment variables in Vercel:

### 1. Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your `seekon-frontend` project
3. Go to **Settings** → **Environment Variables**

### 2. Add This Variable:

```
Name: VITE_API_URL
Value: https://your-backend-url.com
```

**Options for backend:**
- **Option A**: Deploy backend to Vercel (serverless functions)
- **Option B**: Deploy backend to Railway/Render/Heroku
- **Option C**: Use your own server/VPS

**Example values:**
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`
- Custom: `https://api.seekon-apparel.com`

---

## 🔄 After Setting Environment Variables

1. **Redeploy** your Vercel project (Settings → Deployments → Redeploy)
	Gren2. **Verify** the frontend can connect to your backend

---

## 🌐 Backend Deployment Options

### Option 1: Vercel Serverless Functions
Convert backend to Vercel serverless functions

### Option 2: Railway (Recommended)
1. Push backend code to GitHub
2. Connect Railway to your repo
3. Set environment variables in Railway
4. Deploy!

### Option 3: Render
1. Create new Web Service
2. Connect your repo
3. Set build command: `cd src/backend && npm install && npm start`
4. Set start command: `cd src/backend && npm start`

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] Frontend redeployed with new env vars
- [ ] Test API connection from frontend
- [ ] CORS configured on backend to allow `https://seekon-apparel.vercel.app`
- [ ] MongoDB connection string set (backend)
- [ ] JWT_SECRET set (backend)
- [ ] Test login/register functionality
- [ ] Test product fetching
- [ ] Test admin dashboard

---

## 🔍 Testing Your Deployment

1. **Visit**: https://seekon-apparel.vercel.app/
2. **Open Browser Console** (F12)
3. **Check Network Tab** for API calls
4. **Verify** no CORS errors
5. **Test** login, product display, cart

---

## 🐛 Common Issues

### CORS Errors
If you see CORS errors, update backend CORS config:
```javascript
app.use(cors({
  origin: ['https://seekon-apparel.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### API Not Connecting
1. Verify `VITE_API_URL` is set in Vercel
2. Check backend is running and accessible
3. Verify backend CORS allows your Vercel domain

### Environment Variables Not Working
- Vercel requires **redeploy** after adding env vars
- Variables must start with `VITE_` for Vite projects
- Check Vercel logs for errors

---

## 📞 Next Steps

1. Deploy your backend
2. Set `VITE_API_URL` in Vercel
3. Configure CORS on backend
4. Test everything!
5. Set up custom domain (optional)

