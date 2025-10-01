# Add Webhook Response Module to Make.com

## CRITICAL: You need to add a Webhook Response module to your Make.com scenario

### Step 1: Add Webhook Response Module
1. **In your Make.com scenario**, click the "+" button after your PDF.co module
2. **Search for "Webhooks"**
3. **Select "Webhook Response"**
4. **Click "Add"**

### Step 2: Configure Webhook Response
1. **Status Code:** 200
2. **Body Type:** JSON
3. **JSON Body:**
```json
{
  "success": true,
  "pdfUrl": "{{3.url}}"
}
```

### Step 3: Map the PDF URL
1. **Click in the JSON Body field where it says `{{3.url}}`**
2. **Click the mapping icon (magic wand)**
3. **Select "url" from the PDF.co module output**
4. **It should show as `{{3.url}}` or similar**

### Step 4: Save and Test
1. **Click "Save"** in Make.com
2. **Make sure scenario is ON** (toggle switch)
3. **Test from your app** - you should now get a response with the PDF URL

## Your scenario flow should be:
```
Webhook → PDF.co Fill Form → Webhook Response
```

Without the Webhook Response module, Make.com just returns "Accepted" and your app can't get the PDF URL.