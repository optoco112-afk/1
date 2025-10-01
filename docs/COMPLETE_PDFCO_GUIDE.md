# Complete PDF.co Setup Guide for Make.com

## 🚀 Step-by-Step PDF.co Setup

### **PART 1: Create PDF.co Account**

#### Step 1: Sign Up
1. **Go to** → https://pdf.co
2. **Click "Sign Up"** (top right)
3. **Enter your details:**
   - Email address
   - Password
   - Company name (optional)
4. **Click "Create Account"**
5. **Verify your email** if required

#### Step 2: Get API Key
1. **Login to PDF.co Dashboard**
2. **Look for "API Key"** section (usually top of dashboard)
3. **Copy your API Key** (looks like: `abc123def456ghi789`)
4. **Save this key** - you'll need it in Make.com

---

### **PART 2: Make.com Scenario Setup**

#### Step 3: Create Webhook
1. **Go to Make.com** → Login
2. **Click "Create a new scenario"**
3. **Click the "+" button** to add first module
4. **Search "Webhooks"**
5. **Select "Custom Webhook"**
6. **Click "Add"** to create new webhook
7. **Give it a name:** "Scorpion Tattoo PDF"
7. **Give it a name:** "Krampus Tattoo PDF"
8. **Click "Save"**
9. **Copy the webhook URL** (looks like: `https://hook.eu1.make.com/abc123`)
10. **Update your .env file** with this URL

#### Step 4: Add PDF.co Module
1. **Click the "+" button** after the webhook
2. **Search "PDF.co"**
3. **Select "Fill PDF Form"** (or "PDF Form Filler")
4. **Click "Add"**

#### Step 5: Configure PDF.co Connection
1. **Click "Add"** next to "Connection"
2. **Enter Connection Name:** "PDF.co API"
3. **Enter API Key:** [Paste your PDF.co API key from Step 2]
4. **Click "Save"**
5. **Test connection** - should show green checkmark

---

### **PART 3: Upload and Configure PDF**

#### Step 6: Upload Your PDF Template
1. **In PDF.co module settings, find "PDF File" field**
2. **Click the field** - you'll see options:
   - Upload from computer
   - From previous module  
   - From URL
3. **Select "Upload from computer"**
4. **Choose your fillable PDF file**
5. **Wait for upload** (progress bar will show)
6. **PDF.co will analyze** your form fields

#### Step 7: Map Form Fields (EXACT MAPPING)
After upload, you'll see form fields detected. Map them exactly like this:

```
PDF Form Field Name → Make.com Mapping
─────────────────────────────────────
FirstName           → {{1.FirstName}}
LastName            → {{1.LastName}}
Phone               → {{1.Phone}}
Price               → {{1.Price}}
Deposit             → {{1.Deposit}}
Rest                → {{1.Rest}}
AppointmentDate     → {{1.AppointmentDate}}
Time                → {{1.Time}}
Note                → {{1.Note}}
```

**Visual Mapping in Make.com:**
1. **Click each form field** in PDF.co module
2. **Select "Map"** (magic wand icon)
3. **Choose from webhook data:**
   - For FirstName field → Select `{{1.FirstName}}`
   - For LastName field → Select `{{1.LastName}}`
   - For Phone field → Select `{{1.Phone}}`
   - For Price field → Select `{{1.Price}}`
   - For Deposit field → Select `{{1.Deposit}}`
   - For Rest field → Select `{{1.Rest}}`
   - For AppointmentDate field → Select `{{1.AppointmentDate}}`
   - For Time field → Select `{{1.Time}}`
   - For Note field → Select `{{1.Note}}`

---

### **PART 4: Setup Response**

#### Step 8: Add Webhook Response
1. **Click "+" after PDF.co module**
2. **Search "Webhooks"**
3. **Select "Webhook Response"**
4. **Configure response:**
   - **Status:** 200
   - **Body Type:** JSON
   - **JSON Body:**
   ```json
   {
     "success": true,
     "pdfUrl": "{{2.url}}"
   }
   ```

#### Step 8.1: PDF.co Output Selection
**In the PDF.co module, you'll see these output options:**
- **url** ← Select this one (the filled PDF download link)
- **file** (binary data)
- **pages** (page count)
- **credits** (API credits used)

**For Webhook Response mapping:**
1. **Click in the JSON Body field**
2. **For "pdfUrl" value, click the mapping icon**
3. **Select "url" from PDF.co module output**
4. **It should show: `{{2.url}}`**

#### Step 8.2: Complete Webhook Response Setup
```json
{
  "success": true,
  "pdfUrl": "{{2.url}}"
}
```

**Visual Mapping:**
```
Webhook Response Module:
┌─────────────────────────────────┐
│ Status: 200                     │
│ Body Type: JSON                 │
│ JSON Body:                      │
│ {                               │
│   "success": true,              │
│   "pdfUrl": "{{2.url}}" ←── MAP │
│ }                               │
└─────────────────────────────────┘
```
---

### **PART 5: Test and Activate**

#### Step 9: Test the Scenario
1. **Click "Save"** (bottom right)
2. **Click "Run once"** to test
3. **In your Scorpion Tattoo app:**
   - Create a test reservation
   - Try to generate PDF
4. **Check Make.com execution:**
   - Should show green checkmarks
   - PDF should be generated
   - Response should return PDF URL

#### Step 10: Activate Scenario
1. **Toggle the switch** to "ON" (top left)
2. **Scenario is now live!**

---

### **PART 6: Troubleshooting**

#### If PDF fields don't map:
- **Check field names** in your PDF exactly match: FirstName, LastName, etc.
- **Ensure PDF is fillable** (not just editable text)
- **Try re-uploading** the PDF

#### If webhook doesn't trigger:
- **Check .env file** has correct webhook URL
- **Restart your development server** after updating .env
- **Check Make.com logs** for incoming requests

#### If PDF.co fails:
- **Verify API key** is correct
- **Check PDF.co dashboard** for usage limits
- **Ensure PDF file** is not corrupted

---

### **PART 7: Complete Flow Diagram**

```
Your App → Make.com Webhook → PDF.co Fill Form → Response
    ↓              ↓                ↓              ↓
Send Data    Receive Data     Fill PDF Form   Return PDF URL
(9 fields)   (FirstName,      (Your template)  (Download link)
             LastName, etc.)
```

---

### **📋 Final Checklist**

- [ ] PDF.co account created
- [ ] API key copied
- [ ] Make.com webhook created
- [ ] Webhook URL in .env file
- [ ] PDF.co module added
- [ ] Connection configured
- [ ] PDF template uploaded
- [ ] All 9 fields mapped correctly
- [ ] Webhook response configured
- [ ] Scenario tested
- [ ] Scenario activated

**Your PDF generation should now work perfectly!** 🎉