'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import {ClipboardCopy, Download} from 'lucide-react'
import { jsPDF } from 'jspdf';
import DownloadButton from './DownloadButton';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [inputVal, setInputVal] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setText(inputVal);
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
    link.download = 'qrcode.svg';
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
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Generated QR Code', 105, 30, { align: 'center' });

        pdf.addImage(imgData, 'PNG', 75, 45, 60, 60);

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
      
      {/* Forms */}
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

      {/* QR Code Container */}
      <div className='w-full flex flex-col gap-10 items-center bg-white rounded-2xl p-5 shadow-xs border border-black/20'>
        <div>
          <h1 className='text-lg font-semibold'>QR Code Preview</h1>
        </div>

        {/* The QR Code itself */}
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

        {/* Download Buttons */}
        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='flex gap-2'>
            <DownloadButton title={'Copy'} icon={ClipboardCopy} handleclick={handleCopy}/>
            <DownloadButton title={'SVG'} icon={Download} handleclick={handleDownloadSVG}/>
            <DownloadButton title={'PNG'} icon={Download} handleclick={handleDownloadPNG}/>
            <DownloadButton title={'PDF'} icon={Download} handleclick={handleDownloadPDF}/>
          </div>
          <p className='text-black/60 text-sm'>Click any button to copy or download your qr code</p>
        </div>
      </div>
    </div>
  );
}