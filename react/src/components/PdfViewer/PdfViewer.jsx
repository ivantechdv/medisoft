import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { saveAs } from 'file-saver';
import { BsZoomIn, BsZoomOut, BsDownload, BsX } from 'react-icons/bs';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const PdfViewer = ({ url, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    if (scale > 0.2) {
      setScale(scale - 0.1);
    }
  };

  const handleSavePdf = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, 'documento.pdf');
    } catch (error) {
      console.error('Error al guardar el PDF:', error);
    }
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-center mb-4'>
        <button
          className='mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleZoomIn}
        >
          <BsZoomIn size={20} />
        </button>
        <button
          className='mr-4 bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleZoomOut}
        >
          <BsZoomOut size={20} />
        </button>
        <button
          className='mr-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleSavePdf}
        >
          <BsDownload size={20} />
        </button>
        <button
          onClick={onClose}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
        >
          <BsX size={20} />
        </button>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className='mb-8'>
              <Page pageNumber={index + 1} width={scale * 800} />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
