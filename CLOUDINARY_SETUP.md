# Cloudinary Setup Guide for Student Hub

## Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Credentials
After logging in, go to your Dashboard:
- **Cloud Name**: Found at the top (e.g., `dxxxxx`)
- **API Key**: Found in "Account Details"
- **API Secret**: Found in "Account Details" (click "Show")

## Step 3: Create Upload Presets

### For Product Images:
1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure:
   - **Preset name**: `student-hub-products`
   - **Signing Mode**: `Unsigned` (important!)
   - **Folder**: `student-hub/products`
   - **Use filename**: Yes
   - **Unique filename**: Yes
   - **Overwrite**: No
   - **Format**: Auto
   - **Quality**: Auto
   - **Transformations**:
     - Width: 800
     - Height: 800
     - Crop: Fill
     - Gravity: Auto
4. Click **Save**

### For Vendor Stories (Videos):
1. Add another upload preset
2. Configure:
   - **Preset name**: `student-hub-stories`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `student-hub/stories`
   - **Resource Type**: Video
   - **Use filename**: Yes
   - **Unique filename**: Yes
   - **Video Transformations**:
     - Width: 1080
     - Height: 1920 (vertical video for TikTok-style)
     - Quality: Auto
     - Format: mp4
3. Click **Save**

### For User Avatars:
1. Add another upload preset
2. Configure:
   - **Preset name**: `student-hub-avatars`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `student-hub/avatars`
   - **Transformations**:
     - Width: 200
     - Height: 200
     - Crop: Fill
     - Gravity: Face
     - Radius: Max (circular)
3. Click **Save**

## Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Upload Presets (must match what you created)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PRODUCTS=student-hub-products
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_STORIES=student-hub-stories
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_AVATARS=student-hub-avatars
```

## Step 5: Folder Structure in Cloudinary

Your Cloudinary media library will be organized like this:

```
student-hub/
├── products/          # Product images
│   ├── indomie_001.jpg
│   ├── textbook_002.jpg
│   └── ...
├── stories/           # Vendor video stories
│   ├── vendor_story_001.mp4
│   ├── vendor_story_002.mp4
│   └── ...
└── avatars/           # User profile pictures
    ├── user_001.jpg
    ├── user_002.jpg
    └── ...
```

## Step 6: Test Upload

1. Start your dev server: `npm run dev`
2. Navigate to `/products/new`
3. Click "Upload Product Image"
4. Select an image from your device
5. Check Cloudinary dashboard to see it in `student-hub/products/`

## Benefits of This Setup

✅ **Organized**: All media in dedicated folders
✅ **Optimized**: Automatic image/video optimization
✅ **Responsive**: Different sizes generated automatically
✅ **Fast**: CDN delivery worldwide
✅ **Free Tier**: 25GB storage, 25GB bandwidth/month

## Troubleshooting

### "Upload preset not found"
- Make sure the preset name in `.env.local` matches exactly
- Ensure "Signing Mode" is set to "Unsigned"

### "Upload failed"
- Check your cloud name is correct
- Verify the preset exists and is unsigned
- Check browser console for detailed error

### Images not showing
- Verify the URL format: `https://res.cloudinary.com/{cloud_name}/image/upload/...`
- Check if the image was actually uploaded in Cloudinary dashboard

## Advanced: Transformations

You can apply transformations on-the-fly in URLs:

```
# Original
https://res.cloudinary.com/demo/image/upload/sample.jpg

# Thumbnail (200x200)
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/sample.jpg

# Blur background
https://res.cloudinary.com/demo/image/upload/e_blur:1000/sample.jpg

# Add watermark
https://res.cloudinary.com/demo/image/upload/l_text:Arial_40:Student%20Hub/sample.jpg
```

## Next Steps

Once setup is complete:
1. Test product image upload
2. Implement video upload for Campus Pulse stories
3. Add user avatar upload
4. Configure automatic backups
