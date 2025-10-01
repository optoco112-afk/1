# PDF.co Setup Guide for Make.com

## 🚀 Complete PDF.co Setup Steps

### Step 1: Create PDF.co Account
1. **Go to PDF.co** → https://pdf.co
2. **Sign up for free account**
3. **Get your API Key:**
   - Go to Dashboard
   - Copy your API Key (you'll need this)

### Step 2: Make.com Scenario Setup

#### A. Add Webhook Module
1. **Create new scenario** in Make.com
2. **Add Custom Webhook:**
   - Click "+" button
   - Search "Webhooks"
   - Select "Custom Webhook"
   - Click "Add" to create new webhook
   - **Copy the webhook URL** (save this for your .env file)

#### B. Add PDF.co Module
1. **Add PDF.co Module:**
   - Click "+" after webhook
   - Search "PDF.co"
   - Select "Fill PDF Form"

2. **Configure PDF.co Connection:**
   - Click "Add" next to Connection
   - Enter your PDF.co API Key
   - Test connection

3. **Configure PDF Form Filling:**
   - **PDF File:** Upload your fillable PDF template
   - **Form Data:** Map the fields exactly:
   ```
   FirstName: {{1.FirstName}}
   LastName: {{1.LastName}}
   Phone: {{1.Phone}}
   Price: {{1.Price}}
   Deposit: {{1.Deposit}}
   Rest: {{1.Rest}}
   AppointmentDate: {{1.AppointmentDate}}
   Time: {{1.Time}}
   Note: {{1.Note}}
   ```

#### C. Add Webhook Response
1. **Add Webhook Response Module:**
   - Click "+" after PDF.co module
   - Search "Webhooks"
   - Select "Webhook Response"

2. **Configure Response:**
   - **Status:** 200
   - **Body Type:** JSON
   - **JSON Body:**
   ```json
   {
     "success": true,
     "pdfUrl": "{{2.url}}"
   }
   ```

### Step 3: Test the Scenario
1. **Save scenario** → Click "Save"
2. **Turn ON scenario** → Toggle switch to ON
3. **Test from your app** → Generate a PDF
4. **Check results** → Verify PDF is filled and returned

## 📋 Field Mapping Reference

Your PDF form fields → Webhook data:
- FirstName → {{1.FirstName}}
- LastName → {{1.LastName}}
- Phone → {{1.Phone}}
- Price → {{1.Price}}
- Deposit → {{1.Deposit}}
- Rest → {{1.Rest}}
- AppointmentDate → {{1.AppointmentDate}}
- Time → {{1.Time}}
- Note → {{1.Note}}

## 🔧 Troubleshooting

### If PDF.co module not found:
1. Try searching "PDF" and look for any PDF-related modules
2. Use HTTP module with PDF.co API directly
3. Alternative: Use Documint or PDFShift

### If fields don't fill:
1. Check PDF field names match exactly
2. Verify PDF is truly fillable (not just editable)
3. Test with simple text first

## 📞 Support
- PDF.co Documentation: https://pdf.co/documentation
- Make.com Help: https://www.make.com/en/help