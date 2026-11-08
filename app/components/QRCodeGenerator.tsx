'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import {ClipboardCopy, Download} from 'lucide-react'
import { jsPDF } from 'jspdf';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [inputVal, setInputVal] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setText(inputVal);
  };

  // Helper to extract SVG markup
  const getSvgElementAndString = () => {
    const svgElement = document.querySelector('#qr-code-container svg');
    if (!svgElement) return null;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    return { svgElement, svgString };
  };

  // 1. Download as SVG
  const handleDownloadSVG = () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qrcode.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Download as PNG
  const handleDownloadPNG = () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');

      if (context) {
        context.fillStyle = '#FFFFFF'; // White background
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  // 3. Download as PDF
  const handleDownloadPDF = () => {
    const data = getSvgElementAndString();
    if (!data) return;

    const blob = new Blob([data.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');

      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        const imgData = canvas.toDataURL('image/png');
        
        // Initialize jsPDF (A4 size, portrait)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Add title text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Generated QR Code', 105, 30, { align: 'center' });

        // Embed QR Code image into the center of the PDF page (width: 60mm, height: 60mm)
        pdf.addImage(imgData, 'PNG', 75, 45, 60, 60);

        // Save PDF file
        pdf.save('qrcode.pdf');
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const handleCopy = async () => {
  const svgElement = document.querySelector('#qr-code-container svg');
  if (!svgElement) return;

  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    if (context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('QR code copied to clipboard!');
          } catch (err) {
            console.error('Failed to copy QR code: ', err);
          }
          }
        }, 'image/png');
      }
      };
      image.src = blobURL;
    };

  return (
    <div className='w-full flex flex-col gap-10 m-10  sm:flex-row items-center sm:items-start sm:justify-between'>  
      <div className='w-full'>
        <form onSubmit={handleGenerate} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-1'>
            <label htmlFor="input" className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Content</label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter URL or text..."
              className='flex h-9 w-full rounded-md border border-black/40 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none '
            />
          </div>
          
          <button type="submit" className='inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer active:scale-95 transition-all duration-300'>
            Generate
          </button>
        </form>
      </div>

      <div className='w-full flex flex-col gap-10 items-center bg-white rounded-2xl p-5 shadow-xs border border-black/20'>
        <div>
          <h1 className='text-lg font-semibold'>QR Code Preview</h1>
        </div>
        <div>
          <div id="qr-code-container" style={{ height: 'auto', margin: '0 auto', maxWidth: 256, width: '100%' }}>
            <QRCode
              size={256}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={text}
              viewBox={`0 0 256 256`}
            />
          </div>
        </div>
        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='flex gap-2'>
          <div className='w-20 h-20 border rounded border-black/20 active:scale-95 transition-all duration-150'>
            <button 
            onClick={handleCopy}
            className='w-full h-full flex flex-col gap-2 justify-center items-center text-sm cursor-pointer'>
              <ClipboardCopy size={18}/>
              Copy
            </button>
          </div>
          <div className='w-20 h-20 border rounded border-black/20 active:scale-95 transition-all duration-150'>
            <button 
            onClick={handleDownloadPNG}
            className='w-full h-full flex flex-col gap-2 justify-center items-center text-sm cursor-pointer'>
              <Download size={18}/>
              PNG
            </button>
          </div>
          <div className='w-20 h-20 border rounded border-black/20 active:scale-95 transition-all duration-150'>
            <button 
            onClick={handleDownloadSVG}
            className='w-full h-full flex flex-col gap-2 justify-center items-center text-sm cursor-pointer'>
              <Download size={18}/>
              SVG
            </button>
          </div>
          <div className='w-20 h-20 border rounded border-black/20 active:scale-95 transition-all duration-150'>
            <button 
            onClick={handleDownloadPDF}
            className='w-full h-full flex flex-col gap-2 justify-center items-center text-sm cursor-pointer'>
              <Download size={18}/>
              PDF
            </button>
          </div>
        </div>
          <p className='text-black/60 text-sm'>Click any button to copy or download your qr code</p>
        </div>
      </div>
    </div>
  );
}