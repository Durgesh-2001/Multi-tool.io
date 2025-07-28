import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { authMiddleware, checkCredits } from '../middleware/auth.js';

const router = express.Router();

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/convert';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Convert PDF to Word document
const convertPdfToWord = async (inputBuffer) => {
  try {
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(inputBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    // Split text into paragraphs
    const paragraphs = fullText.split('\n').filter(p => p.trim().length > 0);
    
    // Create Word document with actual content
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.map(text => 
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                size: 24, // 12pt
                font: 'Arial'
              })
            ]
          })
        )
      }]
    });
    
    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
    
  } catch (error) {
    throw new Error(`Failed to convert PDF to Word: ${error.message}`);
  }
};

// Convert Word document to PDF
const convertWordToPdf = async (inputBuffer) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Extract text from Word document using mammoth
      const result = await mammoth.extractRawText({ buffer: inputBuffer });
      const wordText = result.value;
      
      // console.log('Extracted Word content:', wordText.substring(0, 200) + '...');
      
      // Create PDF using jsPDF
      const doc = new jsPDF();
      
      // Add content to PDF
      doc.setFontSize(12);
      doc.setFont('Helvetica');
      
      // Split text into lines and add to PDF
      const lines = wordText.split('\n');
      let yPosition = 20;
      
      for (const line of lines) {
        if (line.trim()) {
          // Check if we need a new page
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(line, 20, yPosition);
          yPosition += 7;
        }
      }
      
      // Get PDF as buffer
      const pdfArrayBuffer = doc.output('arraybuffer');
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      resolve(pdfBuffer);
      
    } catch (error) {
      reject(new Error(`Failed to convert Word to PDF: ${error.message}`));
    }
  });
};

// Extract text from PDF
const extractPdfText = async (inputBuffer) => {
  try {
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(inputBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

// Convert file route
router.post('/file', authMiddleware, checkCredits, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { targetFormat } = req.body;
    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }

    const inputPath = req.file.path;
    const outputDir = 'uploads/convert/output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${uuidv4()}.${targetFormat}`;
    const outputPath = path.join(outputDir, outputFileName);

    // Read the uploaded file
    const inputBuffer = fs.readFileSync(inputPath);
        
    let outputBuffer;
    
    try {
      const inputExt = path.extname(req.file.originalname).toLowerCase();
      
      // Handle different conversion scenarios
      if (inputExt === '.pdf' && (targetFormat === 'docx' || targetFormat === 'doc')) {
        // console.log('Converting PDF to Word document...');
        outputBuffer = await convertPdfToWord(inputBuffer);
        // console.log('PDF successfully converted to Word document with actual content.');
      } else if ((inputExt === '.docx' || inputExt === '.doc') && targetFormat === 'pdf') {
        // console.log('Converting Word document to PDF...');
        outputBuffer = await convertWordToPdf(inputBuffer);
      } else {
        // For other formats, we'll use a simple text-based conversion
        // console.log('Using text-based conversion...');
        
        if (targetFormat === 'txt') {
          // Convert to plain text
          if (inputExt === '.pdf') {
            const pdfData = await extractPdfText(inputBuffer);
            outputBuffer = Buffer.from(pdfData);
          } else {
            // For other formats, create a simple text file
            outputBuffer = Buffer.from('Converted document content');
          }
        } else {
          throw new Error(`Conversion from ${inputExt} to ${targetFormat} is not yet supported`);
        }
      }
      
      // console.log('Conversion completed successfully');
      
    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      
      // Clean up the input file on error
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
      
      return res.status(500).json({
        error: 'File conversion failed',
        message: 'Unable to convert the file to the requested format',
        details: conversionError.message,
        suggestions: [
          'Check if the file format is supported',
          'Try a different target format',
          'Ensure the file is not corrupted',
          'Try with a smaller file'
        ]
      });
    }
    
    // Write the converted file
    fs.writeFileSync(outputPath, outputBuffer);

    // Clean up the input file
    fs.unlinkSync(inputPath);

    // Send the converted file
    res.download(outputPath, outputFileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up the output file after download
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('File conversion error:', error);
    res.status(500).json({ 
      error: 'File conversion failed', 
      details: error.message,
      message: 'An unexpected error occurred during file conversion'
    });
  }
});

export default router; 