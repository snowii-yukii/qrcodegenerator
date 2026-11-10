'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { ClipboardCopy, Download, RefreshCcw, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import DownloadButton from './DownloadButton';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const SIZE_OPTIONS = [
  { value: 128, label: 'Small (128 × 128 px)' },
  { value: 256, label: 'Medium (256 × 256 px)' },
  { value: 384, label: 'Large (384 × 384 px)' },
  { value: 512, label: 'Extra Large (512 × 512 px)' },
];

const ERROR_CORRECTION_OPTIONS: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'Low (7%)', desc: 'Recovers up to 7% data loss. Ideal for high density payloads.' },
  { value: 'M', label: 'Medium (15%)', desc: 'Recovers up to 15% data loss. Standard recommended balance.' },
  { value: 'Q', label: 'Quartile (25%)', desc: 'Recovers up to 25% data loss. Great for print media.' },
  { value: 'H', label: 'High (30%)', desc: 'Recovers up to 30% data loss. Maximum durability and damage resistance.' },
];

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [size, setSize] = useState<number>(256);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M');
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setText(inputVal);
  };

  const handleReset = () => {
    setInputVal('');
    setText('');
    setSize(256);
    setErrorLevel('M');
  };

  const getSvgElementAndString = () => {
    const svgElement = document.querySelector('#qr-code-container svg');
    if (!svgElement) return null;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    return { svgElement, svgString };
  };

  const handleDownloadSVG = () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-${size}x${size}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');

      if (context) {
        context.fillStyle = '#FFFFFF'; // White background
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, size, size);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `qrcode-${size}x${size}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const handleDownloadPDF = () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');

      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, size, size);

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Generated QR Code', 105, 30, { align: 'center' });

        // Calculate mm display size centered on A4 page
        const displayMm = Math.min(100, Math.max(45, Math.round((size / 256) * 60)));
        const xPos = (210 - displayMm) / 2;

        pdf.addImage(imgData, 'PNG', xPos, 45, displayMm, displayMm);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Resolution: ${size} × ${size} px  |  Error Correction: Level ${errorLevel}`,
          105,
          45 + displayMm + 12,
          { align: 'center' }
        );

        pdf.save(`qrcode-${size}x${size}.pdf`);
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const handleCopy = async () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(blob);

    const image = new Image();
    image.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');

      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, size, size);

        canvas.toBlob(async (pngBlob) => {
          if (pngBlob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': pngBlob })
              ]);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch (err) {
              console.error('Failed to copy QR code: ', err);
            }
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const currentErrorOption = ERROR_CORRECTION_OPTIONS.find((opt) => opt.value === errorLevel);

  return (
    <div className='w-full max-w-5xl flex flex-col gap-10 mt-6 sm:flex-row items-center sm:items-start sm:justify-between'>  
      
      {/* Forms */}
      <div className='w-full sm:max-w-md'>
        <form onSubmit={handleGenerate} className='flex flex-col gap-5'>
          
          {/* Content Input */}
          <div className='flex flex-col gap-2 p-5 border border-black/20 rounded-xl bg-white shadow-xs'>
            <label htmlFor="qr-content" className='text-sm font-medium leading-none'>
              Content
            </label>
            <input
              id="qr-content"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter URL or text..."
              className='flex h-9 w-full rounded-md border border-black/40 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus:border-black'
            />
            <p className='text-xs text-black/60'>Supports URLs, text, email addresses, phone numbers and more</p>
          </div>
          
          {/* Size Selection */}
          <div className='flex flex-col gap-2 p-5 border border-black/20 rounded-xl bg-white shadow-xs'>
            <div className='flex items-center justify-between'>
              <label htmlFor="qr-size" className='text-sm font-medium leading-none'>
                Size
              </label>
              <span className='text-xs font-semibold px-2 py-0.5 bg-black/5 rounded text-black/70'>
                {size} × {size} px
              </span>
            </div>
            <select
              id="qr-size"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className='flex h-9 w-full rounded-md border border-black/40 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:border-black cursor-pointer'
            >
              {SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className='text-xs text-black/60'>Adjusts rendering dimensions and PNG/SVG export resolution</p>
          </div>

          {/* Error Correction Selection */}
          <div className='flex flex-col gap-2 p-5 border border-black/20 rounded-xl bg-white shadow-xs'>
            <div className='flex items-center justify-between'>
              <label htmlFor="qr-error-level" className='text-sm font-medium leading-none'>
                Error Correction
              </label>
              <span className='text-xs font-semibold px-2 py-0.5 bg-black/5 rounded text-black/70'>
                Level {errorLevel}
              </span>
            </div>
            <select
              id="qr-error-level"
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
              className='flex h-9 w-full rounded-md border border-black/40 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:border-black cursor-pointer'
            >
              {ERROR_CORRECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className='text-xs text-black/60'>
              {currentErrorOption?.desc || 'Higher error correction ensures readability even if partially obscured or damaged.'}
            </p>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            className='primary inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 p-6 cursor-pointer active:scale-95 transition-all duration-300'
          >
            Generate QR Code
          </button>

          {/* Secondary Action Buttons */}
          <div className='flex justify-center gap-4'>
            <button
              type="button"
              onClick={handleCopy}
              className='flex-1 inline-flex gap-2 items-center justify-center rounded-md text-sm font-medium border border-black/20 bg-white text-black shadow-xs hover:bg-black/5 h-10 px-4 cursor-pointer active:scale-95 transition-all duration-300'
            >
              {copied ? (
                <>
                  <Check size={18} className='text-emerald-600' />
                  <span className='text-emerald-600 font-semibold'>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy size={18} />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className='flex-1 inline-flex gap-2 items-center justify-center rounded-md text-sm font-medium border border-black/20 bg-white text-black shadow-xs hover:bg-black/5 h-10 px-4 cursor-pointer active:scale-95 transition-all duration-300'
            >
              <RefreshCcw size={18} />
              <span>Reset</span>
            </button>
          </div>

        </form>
      </div>

      {/* QR Code Container */}
      <div className='w-full flex-1 flex flex-col gap-6 items-center bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-black/20'>
        <div className='w-full flex items-center justify-between border-b border-black/10 pb-3'>
          <h2 className='text-lg font-semibold'>QR Code Preview</h2>
          <div className='flex gap-2 text-xs text-black/60'>
            <span className='bg-zinc-100 px-2 py-1 rounded'>{size} × {size}</span>
            <span className='bg-zinc-100 px-2 py-1 rounded'>Level {errorLevel}</span>
          </div>
        </div>

        {/* The QR Code itself */}
        <div className='w-full flex items-center justify-center min-h-[280px] p-4 bg-zinc-50/50 rounded-xl border border-dashed border-black/10'>
          {text ? (
            <div
              id="qr-code-container"
              style={{
                height: 'auto',
                margin: '0 auto',
                maxWidth: `${Math.min(size, 320)}px`,
                width: '100%',
              }}
              className='transition-all duration-300 flex items-center justify-center'
            >
              <QRCode
                size={size}
                level={errorLevel}
                value={text}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              />
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-black/40 text-center gap-2'>
              <p className='text-sm font-medium'>No QR Code Generated</p>
              <p className='text-xs max-w-xs'>Enter text or a URL and click Generate to see your QR code preview.</p>
            </div>
          )}
        </div>

        {/* Download Buttons */}
        <div className='w-full flex flex-col gap-3 justify-center items-center pt-2'>
          <div className='flex gap-3 justify-center w-full'>
            <DownloadButton title="SVG" icon={Download} handleclick={handleDownloadSVG} />
            <DownloadButton title="PNG" icon={Download} handleclick={handleDownloadPNG} />
            <DownloadButton title="PDF" icon={Download} handleclick={handleDownloadPDF} />
          </div>
          <p className='text-black/50 text-xs text-center'>
            Downloads will export in {size} × {size} px with Level {errorLevel} error correction
          </p>
        </div>
      </div>
    </div>
  );
}
