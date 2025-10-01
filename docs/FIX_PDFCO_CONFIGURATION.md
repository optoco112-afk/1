# Fix PDF.co Configuration in Make.com

## The Problem
Your PDF.co module is configured for "Text Annotations" but you have a fillable PDF form. You need to use "Fields" instead.

## Solution Steps

### Step 1: Turn OFF Text Annotations
1. **In your PDF.co module**, find the "Text Annotations" section
2. **Turn OFF the toggle** next to "Text Annotations" (it should be purple/on currently)
3. **This will disable the annotation fields** you currently have mapped

### Step 2: Turn ON Fields
1. **Find the "Fields" section** (below Text Annotations)
2. **Turn ON the toggle** next to "Fields" (it should show "Map")
3. **The Fields text box will become active**

### Step 3: Map Form Fields
1. **Click in the Fields text box**
2. **Enter this JSON mapping:**
```json
{
  "FirstName": "{{1.FirstName}}",
  "LastName": "{{1.LastName}}",
  "Phone": "{{1.Phone}}",
  "Price": "{{1.Price}}",
  "Deposit": "{{1.Deposit}}",
  "Rest": "{{1.Rest}}",
  "AppointmentDate": "{{1.AppointmentDate}}",
  "Time": "{{1.Time}}",
  "Note": "{{1.Note}}"
}
```

### Step 4: Save and Test
1. **Click "Save"** in Make.com
2. **Test from your app** - the error should be resolved

## Why This Fixes It
- **Text Annotations** = Adding text at X,Y coordinates (requires annotations array)
- **Fields** = Filling form fields by name (requires field name/value pairs)

Since you have a fillable PDF form, you need Fields mode, not Text Annotations mode.