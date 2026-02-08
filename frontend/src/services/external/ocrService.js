// OCR (Optical Character Recognition) Service

class OCRService {
  constructor() {
    this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  // Check if file type is supported
  isSupported(fileType) {
    return this.supportedFormats.includes(fileType);
  }

  // Validate file
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    if (!this.isSupported(file.type)) {
      return { valid: false, error: `Unsupported file type: ${file.type}` };
    }
    if (file.size > this.maxFileSize) {
      return { valid: false, error: 'File too large (max 10MB)' };
    }
    return { valid: true };
  }

  // Extract text from image
  async extractText(file) {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Simulate OCR processing
    await new Promise(r => setTimeout(r, 2000));

    // Return mock extracted text
    return {
      text: this.generateMockExtractedText(),
      confidence: 0.85 + Math.random() * 0.1,
      language: 'en',
      blocks: this.generateMockBlocks(),
      processingTime: Math.round(1500 + Math.random() * 1000),
    };
  }

  // Extract text with structure
  async extractStructuredText(file) {
    const result = await this.extractText(file);

    return {
      ...result,
      structure: {
        title: 'Document Title',
        sections: [
          { heading: 'Section 1', content: 'Content of section 1...' },
          { heading: 'Section 2', content: 'Content of section 2...' },
        ],
        tables: [],
        lists: [],
      },
    };
  }

  // Extract from business card
  async extractBusinessCard(file) {
    await new Promise(r => setTimeout(r, 1500));

    return {
      name: 'John Doe',
      title: 'Software Engineer',
      company: 'Tech Company Inc.',
      email: 'john.doe@techcompany.com',
      phone: '+1-555-123-4567',
      address: '123 Tech Street, City, ST 12345',
      website: 'www.techcompany.com',
      confidence: 0.9,
    };
  }

  // Extract from receipt
  async extractReceipt(file) {
    await new Promise(r => setTimeout(r, 2000));

    return {
      merchant: 'Store Name',
      date: new Date().toISOString().split('T')[0],
      total: (10 + Math.random() * 100).toFixed(2),
      tax: (1 + Math.random() * 10).toFixed(2),
      items: [
        { name: 'Item 1', quantity: 1, price: '9.99' },
        { name: 'Item 2', quantity: 2, price: '14.99' },
        { name: 'Item 3', quantity: 1, price: '24.99' },
      ],
      paymentMethod: 'Credit Card',
      confidence: 0.88,
    };
  }

  // Extract from invoice
  async extractInvoice(file) {
    await new Promise(r => setTimeout(r, 2500));

    return {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      vendor: {
        name: 'Vendor Company',
        address: '456 Business Ave',
        email: 'billing@vendor.com',
      },
      items: [
        { description: 'Service A', quantity: 1, unitPrice: '500.00', total: '500.00' },
        { description: 'Service B', quantity: 2, unitPrice: '250.00', total: '500.00' },
      ],
      subtotal: '1000.00',
      tax: '100.00',
      total: '1100.00',
      confidence: 0.92,
    };
  }

  // Generate mock extracted text
  generateMockExtractedText() {
    return `Document Header
    
This is sample extracted text from the document. The OCR engine has processed the image and identified the following content:

1. First section with important information
2. Second section with additional details
3. Third section with conclusions

Contact Information:
Email: example@domain.com
Phone: +1-555-000-0000

Thank you for using our service.`;
  }

  // Generate mock text blocks
  generateMockBlocks() {
    return [
      { type: 'heading', text: 'Document Header', confidence: 0.95, boundingBox: { x: 10, y: 10, width: 200, height: 30 } },
      { type: 'paragraph', text: 'This is sample extracted text...', confidence: 0.88, boundingBox: { x: 10, y: 50, width: 300, height: 100 } },
      { type: 'list', text: '1. First section...', confidence: 0.90, boundingBox: { x: 10, y: 160, width: 280, height: 80 } },
    ];
  }

  // Batch process multiple files
  async batchProcess(files) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.extractText(file);
        results.push({ file: file.name, success: true, result });
      } catch (error) {
        results.push({ file: file.name, success: false, error: error.message });
      }
    }

    return results;
  }

  // Create task from extracted text
  parseTaskFromText(text) {
    // Simple task extraction
    const taskPatterns = [
      /(?:todo|task|action):?\s*(.+)/gi,
      /(?:need to|must|should)\s+(.+)/gi,
    ];

    const tasks = [];
    
    for (const pattern of taskPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        tasks.push({
          title: match[1].trim(),
          source: 'ocr',
        });
      }
    }

    return tasks;
  }
}

export const ocrService = new OCRService();
export default ocrService;

