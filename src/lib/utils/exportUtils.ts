import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const EXPORT_PIXEL_RATIO = 3; // high-res, print-quality output

interface ExportOptions {
  filename?: string;
}

async function nodeToDataUrl(
  node: HTMLElement,
  type: 'png' | 'jpeg'
): Promise<string> {
  const opts = {
    pixelRatio: EXPORT_PIXEL_RATIO,
    cacheBust: true,
    backgroundColor: type === 'jpeg' ? '#ffffff' : undefined,
    style: {
      // ensure the captured node renders at its natural (unscaled/unzoomed) size
      transform: 'none'
    }
  };
  return type === 'png' ? toPng(node, opts) : toJpeg(node, { ...opts, quality: 0.97 });
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportAsPng(node: HTMLElement, { filename = 'poster.png' }: ExportOptions = {}) {
  const dataUrl = await nodeToDataUrl(node, 'png');
  triggerDownload(dataUrl, filename);
}

export async function exportAsJpg(node: HTMLElement, { filename = 'poster.jpg' }: ExportOptions = {}) {
  const dataUrl = await nodeToDataUrl(node, 'jpeg');
  triggerDownload(dataUrl, filename);
}

export async function exportAsPdf(node: HTMLElement, { filename = 'poster.pdf' }: ExportOptions = {}) {
  const dataUrl = await nodeToDataUrl(node, 'png');
  // A4 landscape in mm
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  pdf.save(filename);
}

export async function printNode(node: HTMLElement) {
  const dataUrl = await nodeToDataUrl(node, 'png');
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head><title>Print Poster</title>
      <style>
        @page { size: A4 landscape; margin: 0; }
        html, body { margin: 0; padding: 0; }
        img { width: 100%; height: auto; display: block; }
      </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.focus(); window.print();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}
