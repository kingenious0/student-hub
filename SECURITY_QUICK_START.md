# 🚀 OMNI SECURITY - QUICK START GUIDE

## ⚡ Test Your New Security System

### Prerequisites
✅ Database schema migrated (npx prisma db push)
✅ Security packages installed (face-api.js, speakeasy, qrcode)
✅ Face-API models downloaded (in public/models/)
✅ Development server running (npm run dev)

---

## 🧪 TESTING STEPS

### 1. Test with New Account (Recommended First Test)

```bash
# Step 1: Open your browser to localhost:3000
http://localhost:3000

# Step 2: Sign out if logged in
Click "Sign Out" in navbar

# Step 3: Create a new account
Go to /sign-up
Complete Clerk registration

# Step 4: You'll be auto-redirected to /security-setup
✓ See the security wizard
✓ Read the introduction page
✓ Click "Begin Security Setup"

# Step 5: Complete Biometric Setup
✓ Click "Activate Camera"
✓ Allow camera permissions when prompted
✓ Position your face in the frame
✓ Wait for green "Face Detected" indicator
✓ Click "Capture Face" (do this 3 times from different angles)
✓ See "Captured 1/3", "Captured 2/3", "Captured 3/3"
✓ Automatically proceeds to 2FA step

# Step 6: Complete 2FA Setup
✓ Click "Generate 2FA Setup"
✓ See QR code displayed
✓ Open Google Authenticator on your phone
✓ Scan the QR code
✓ See 6-digit code in authenticator app
✓ Enter the code in the input field
✓ Click "Verify & Complete"

# Step 7: Save Backup Codes
✓ See 8 backup codes displayed
✓ Screenshot or write them down (important!)
✓ Click "Verify & Complete" after saving codes

# Step 8: Success!
✓ See "Security Setup Complete!" message
✓ See green checkmarks for Face Recognition and 2FA
✓ Click "Continue to Dashboard"
✓ You should be redirected to /dashboard
✓ You now have full access to the app
```

---

### 2. Test with Existing Account (Security Enforcement)

```bash
# Step 1: Use an existing account that hasn't completed security
Sign in at /sign-in
Complete Clerk authentication

# Step 2: Auto-redirect to Security Setup
✓ After Clerk login, you're immediately redirected to /security-setup
✓ Cannot access /dashboard or any other page
✓ All routes redirect to /security-setup until complete

# Step 3: Try to bypass (should fail)
Try navigating to /dashboard manually
✓ Still redirected to /security-setup
✓ Security enforcement is working!

# Step 4: Complete the security setup
Follow steps 5-8 from "New Account" test above

# Step 5: Verify access granted
✓ After completion, you can access all pages
✓ Dashboard, marketplace, profile, etc. all work
```

---

### 3. Test Security Verification Modal (Advanced)

```bash
# This will be tested when you implement sensitive actions
# Example: Payment processing, settings changes, admin actions

# Usage in your components:
import SecurityVerificationModal from "@/components/security/SecurityVerificationModal"

const [showModal, setShowModal] = useState(false)

<button onClick={() => setShowModal(true)}>
  Make Payment
</button>

<SecurityVerificationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={handlePayment}
  requireBiometric={true}
  require2FA={true}
  message="Verify your identity to complete payment"
/>
```

---

## 🐛 TROUBLESHOOTING

### Camera Issues

**Problem**: "Camera access denied" error
**Solutions**:
1. Check browser permissions (camera icon in address bar)
2. Use HTTPS (camera requires secure context)
3. Try a different browser (Chrome recommended)
4. Restart browser and try again

**Problem**: Camera activates but no video shows
**Solutions**:
1. Check if another app is using the camera
2. Close other browser tabs using camera
3. Restart your computer
4. Check camera drivers

---

### Face Detection Issues

**Problem**: "No face detected" error
**Solutions**:
1. Improve lighting (face should be well-lit)
2. Move closer to the camera
3. Remove glasses, hats, or face coverings
4. Center your face in the frame
5. Wait a moment for detection to initialize

**Problem**: Face detection is slow
**Solutions**:
1. This is normal on first load (models loading)
2. Wait 2-3 seconds after camera activates
3. Ensure good internet connection
4. Check browser console for model loading errors

---

### 2FA Issues

**Problem**: "Invalid code" error
**Solutions**:
1. Check device time synchronization (Settings → Date & Time → Auto)
2. Try the next code (codes change every 30 seconds)
3. Re-scan the QR code if needed
4. Use a backup code if all else fails

**Problem**: QR code not displaying
**Solutions**:
1. Check console for errors
2. Verify QR code package installed: `npm list qrcode`
3. Try refreshing the page
4. Use manual secret key entry in authenticator

---

### Models Not Loading

**Problem**: Console shows "Failed to load model" errors
**Solutions**:
1. Verify models exist in `public/models/` folder
2. Re-run: `.\scripts\download-face-models.ps1`
3. Check file permissions
4. Clear browser cache
5. Check network tab in DevTools

**Problem**: 404 errors for model files
**Solutions**:
1. Restart development server
2. Verify model files in public/models/
3. Check Next.js public folder configuration
4. Try hard refresh (Ctrl+Shift+R)

---

## 🔍 VERIFICATION CHECKLIST

After testing, verify:

- [ ] New users can complete security setup
- [ ] Existing users are redirected to security setup
- [ ] Camera activates and shows video feed
- [ ] Face detection works (green indicator appears)
- [ ] Can capture 3 face samples
- [ ] 2FA QR code generates successfully
- [ ] Authenticator app can scan QR code
- [ ] 6-digit codes verify correctly
- [ ] Backup codes are displayed
- [ ] Setup marks as complete in database
- [ ] Users can access dashboard after completion
- [ ] Cannot bypass security by navigating directly
- [ ] Security status persists across sessions

---

## 📊 DATABASE VERIFICATION

Check if data is saved correctly:

```bash
# Open Prisma Studio
npx prisma studio

# Check your user record
1. Navigate to "User" table
2. Find your test account
3. Verify these fields:
   - has2FA = true
   - hasBiometric = true
   - securitySetupComplete = true
   - faceDescriptor = (should contain JSON array)
   - twoFactorSecret = (should contain base64 string)
   - mfaBackupCodes = (should contain 8 encrypted codes)
   - lastSecurityCheck = (recent timestamp)
```

---

## 🎯 EXPECTED RESULTS

### Security Setup Page
- ✅ Beautiful wizard interface
- ✅ 3-step progress indicator
- ✅ Camera preview with face detection overlay
- ✅ Real-time face detection feedback
- ✅ QR code for 2FA setup
- ✅ Backup codes display
- ✅ Success confirmation page

### After Completion
- ✅ User has `securitySetupComplete = true` in database
- ✅ Can access all protected routes
- ✅ No more redirects to security-setup
- ✅ Face and 2FA data stored securely

### Security Enforcement
- ✅ New users must complete setup after signup
- ✅ Existing users redirected until setup complete
- ✅ Cannot bypass by URL manipulation
- ✅ All routes protected except public ones

---

## 🚨 COMMON FIRST-TIME ISSUES

### Issue 1: "Module not found: face-api.js"
**Solution**: 
```bash
npm install face-api.js speakeasy qrcode @types/speakeasy @types/qrcode
```

### Issue 2: "Prisma Client validation error"
**Solution**:
```bash
npx prisma generate
npx prisma db push
```

### Issue 3: Models 404 errors
**Solution**:
```bash
.\scripts\download-face-models.ps1
# Or manually download from:
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights
```

### Issue 4: Camera permission prompt not showing
**Solution**:
- Must be on HTTPS (localhost is exempt)
- Check browser settings → Site permissions → Camera
- Try incognito/private mode
- Use Chrome (best support)

---

## 📱 MOBILE TESTING

Test on mobile devices:

1. **Connect to same network as dev server**
2. **Find your computer's local IP**: `ipconfig` (Windows)
3. **Access via**: `http://YOUR_IP:3000`
4. **Note**: Camera may not work without HTTPS on mobile

For mobile testing with HTTPS:
```bash
# Use ngrok or similar service
ngrok http 3000
# Access via https://xyz.ngrok.io
```

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:

✅ Security setup wizard loads correctly
✅ Camera preview shows your face
✅ Green "Face Detected" indicator appears
✅ Face captures save successfully (shows "Captured X/3")
✅ 2FA QR code generates and displays
✅ Google Authenticator can scan the QR code
✅ Verification codes from authenticator work
✅ "Setup Complete" page shows after verification
✅ Database shows security fields populated
✅ No console errors during the flow
✅ Can access dashboard after completion

---

## 🎉 CONGRATULATIONS!

If all tests pass, your security system is working perfectly! 

You now have:
- ✅ Biometric face recognition
- ✅ Two-factor authentication
- ✅ Mandatory security enforcement
- ✅ Production-ready security architecture

Next steps:
1. Test on different browsers
2. Test on mobile devices
3. Deploy to staging environment
4. Conduct security audit
5. Deploy to production

---

**Need Help?**
- Check [SECURITY_SYSTEM_COMPLETE.md](./SECURITY_SYSTEM_COMPLETE.md) for detailed documentation
- Check [SECURITY_IMPLEMENTATION_COMPLETE.md](./SECURITY_IMPLEMENTATION_COMPLETE.md) for implementation details
- Review console errors in DevTools
- Check Prisma Studio for database state

**Status**: 🚀 Ready for Testing!
