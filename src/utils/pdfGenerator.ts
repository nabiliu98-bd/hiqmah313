import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  fileName?: string;
  quality?: number;
}

/**
 * Generates and downloads an authentic A4 PDF file from a DOM element
 * Uses html2canvas-pro which natively supports Tailwind CSS v4's oklch() color spaces
 * Works 100% in installed PWAs, mobile devices, desktop browsers, and offline environments.
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  options: PDFGenerationOptions = {}
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    const fileName = options.fileName || `Youth-of-Hiqmah-Report-${new Date().toISOString().split('T')[0]}.pdf`;

    // High resolution canvas (2x scale for razor-sharp Bengali text and vector lines)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Inject a dedicated style block to guarantee clean RGB colors for the printable document
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          .printable-report-area {
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
          .printable-report-area * {
            border-color: #cbd5e1 !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        // Ensure cloned element has solid white background and crisp width for A4 layout
        const el = clonedDoc.querySelector('.printable-report-area') as HTMLElement;
        if (el) {
          el.style.backgroundColor = '#ffffff';
          el.style.color = '#0f172a';
          el.style.boxShadow = 'none';
          el.style.border = '1px solid #cbd5e1';
          el.style.margin = '0 auto';
          el.style.maxWidth = '800px';
          el.style.width = '800px';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Standard A4 dimensions in millimeters
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Margins (10mm left/right, 12mm top/bottom)
    const marginX = 8;
    const marginY = 8;
    const contentWidth = pdfWidth - marginX * 2;

    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Check if multi-page is required
    let heightLeft = imgHeight;
    let position = marginY;

    pdf.addImage(imgData, 'JPEG', marginX, position, contentWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (pdfHeight - marginY * 2);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + marginY;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginX, position, contentWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - marginY * 2);
    }

    // Direct download via Blob URL for universal browser & PWA compatibility
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);

    return { success: true, blob };
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return { success: false, error: err?.message || 'PDF তৈরিতে সমস্যা হয়েছে' };
  }
}

/**
 * Share PDF file using Web Share API if supported on mobile/installed PWA
 */
export async function sharePDF(blob: Blob, fileName: string): Promise<boolean> {
  try {
    const file = new File([blob], fileName, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Youth of hiqmah প্রগ্রেস রিপোর্ট',
        text: 'Youth of hiqmah মুদির প্রগ্রেস ও মূল্যায়ন রিপোর্ট',
        files: [file],
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Share error or canceled:', err);
    return false;
  }
}
