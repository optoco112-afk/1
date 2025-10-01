import { Reservation } from '../context/DataContext';

export const generatePDF = async (reservation: Reservation, artistName: string) => {
  try {
    // Prepare data for PDF.co fillable form
    const webhookData = {
      fields: [
        {
          "name": "first_name",
          "text": reservation.firstName
        },
        {
          "name": "last_name", 
          "text": reservation.lastName
        },
        {
          "name": "phone",
          "text": reservation.phone
        },
        {
          "name": "reservation_number",
          "text": reservation.reservationNumber.toString()
        },
        {
          "name": "price",
          "text": `€${reservation.totalPrice.toFixed(2)}`
        },
        {
          "name": "deposit",
          "text": `€${reservation.depositPaid.toFixed(2)}`
        },
        {
          "name": "rest",
          "text": `€${(reservation.totalPrice - reservation.depositPaid).toFixed(2)}`
        },
        {
          "name": "appointment_date",
          "text": new Date(reservation.appointmentDate).toLocaleDateString()
        },
        {
          "name": "appointment_time",
          "text": reservation.appointmentTime
        },
        {
          "name": "notes",
          "text": reservation.notes || ""
        }
      ],
      "FirstName": reservation.firstName,
      "LastName": reservation.lastName,
      "Phone": reservation.phone,
      "Price": reservation.totalPrice.toString(),
      "Deposit": reservation.depositPaid.toString(),
      "Rest": (reservation.totalPrice - reservation.depositPaid).toString(),
      "AppointmentDate": new Date(reservation.appointmentDate).toLocaleDateString(),
      "Time": reservation.appointmentTime,
      "Note": reservation.notes || ""
    };

    // Get the Make.com webhook URL from environment variables
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('Make.com webhook URL not configured. Please add VITE_MAKE_WEBHOOK_URL to your environment variables.');
    }

    // Show loading state
    const loadingToast = showLoadingToast('Generating PDF...');

    // Send data to Make.com webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        sentData: webhookData
      });
      throw new Error(`Webhook request failed: ${response.status} - ${response.statusText}. Check console for details.`);
    }

    // Check if response is JSON or plain text
    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      // If response is "Accepted", it means Make.com scenario doesn't have Webhook Response module
      if (responseText.trim() === 'Accepted') {
        throw new Error('Make.com scenario is missing Webhook Response module. Please add a Webhook Response module with Body Type set to "JSON" and JSON Body as {"success": true, "pdfUrl": "{{2.url}}"}.');
      } else {
        throw new Error(`Invalid JSON response from webhook: ${responseText}`);
      }
    }
    
    // Hide loading toast
    hideLoadingToast(loadingToast);

    // Handle the response from Make.com
    if (result.success && result.url) {
      // Download the PDF directly
      downloadPDFFromUrl(result.url, `reservation-${reservation.reservationNumber}.pdf`);
      showSuccessToast('PDF generated and downloaded successfully!');
    } else if (result.url) {
      // PDF.co returns 'url'
      downloadPDFFromUrl(result.url, `reservation-${reservation.reservationNumber}.pdf`);
      showSuccessToast('PDF generated and downloaded successfully!');
    } else {
      throw new Error(result.error || 'PDF generation failed - no PDF URL returned');
    }

  } catch (error) {
    console.error('Error generating PDF via webhook:', error);
    
    // Fallback to browser-based PDF generation
    console.log('Falling back to browser-based PDF generation...');
    generateBrowserPDF(reservation, artistName);
    
    showWarningToast('Using fallback PDF generation. Please check your Make.com webhook configuration.');
  }
};

// Helper function to download PDF from URL
const downloadPDFFromUrl = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Fallback browser-based PDF generation (your original code)
const generateBrowserPDF = (reservation: Reservation, artistName: string) => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to download the PDF');
    return;
  }

  const htmlContent = generateHTMLContent(reservation, artistName);

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);
};

// Toast notification helpers
const showLoadingToast = (message: string) => {
  const toast = document.createElement('div');
  toast.id = 'pdf-loading-toast';
  toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
  toast.innerHTML = `
    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  return toast;
};

const hideLoadingToast = (toast: HTMLElement) => {
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast);
  }
};

const showSuccessToast = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
};

const showWarningToast = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 7000);
};
// Fallback HTML generation for browser printing
const generateHTMLContent = (reservation: Reservation, artistName: string) => {
  return '';
};