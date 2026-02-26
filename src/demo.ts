/**
 * Demo script showing the Content Intelligence Platform in action
 */

import { ContentProcessor } from './services/ContentProcessor';
import { DomainAdapter } from './services/DomainAdapter';
import { AnalysisEngine } from './services/AnalysisEngine';
import { GenerationEngine } from './services/GenerationEngine';
import { HumanLoopController } from './services/HumanLoopController';
import { SSTManager } from './services/SSTManager';
import { SSTSerializer } from './services/SSTSerializer';

async function runDemo() {
  console.log('🚀 Content Intelligence Platform Demo\n');

  // Initialize services
  const contentProcessor = new ContentProcessor();
  const domainAdapter = new DomainAdapter();
  const analysisEngine = new AnalysisEngine();
  const generationEngine = new GenerationEngine();
  const humanLoopController = new HumanLoopController();
  const sstManager = new SSTManager();
  const sstSerializer = new SSTSerializer();

  // Example 1: Process text content
  console.log('📝 Example 1: Processing Text Content');
  console.log('=====================================\n');

  const textContent = Buffer.from(`
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves.

Key Concepts:
- Supervised Learning: Learning from labeled data
- Unsupervised Learning: Finding patterns in unlabeled data
- Reinforcement Learning: Learning through trial and error

Applications of machine learning include image recognition, natural language processing, recommendation systems, and autonomous vehicles.
  `.trim());

  const textInput = {
    file: textContent,
    filename: 'ml-intro.txt',
    mimeType: 'text/plain'
  };

  // Step 1: Validate and create metadata
  const validation = contentProcessor.validateContent(textInput);
  console.log('✓ Content validation:', validation.valid ? 'PASSED' : 'FAILED');

  const metadata = contentProcessor.createMetadata(textInput);
  console.log('✓ Content metadata created:', {
    id: metadata.id,
    type: metadata.type,
    size: metadata.size
  });

  // Step 2: Extract content
  const extractedContent = await contentProcessor.routeContent(metadata, textInput.file);
  console.log('✓ Content extracted:', extractedContent.rawText?.substring(0, 50) + '...');

  // Step 3: Detect domain
  const domainAnalysis = await domainAdapter.detectDomain(extractedContent);
  console.log('✓ Domain detected:', domainAnalysis.domain, `(confidence: ${domainAnalysis.confidence})`);

  // Step 4: Analyze content
  const conceptualAnalysis = await analysisEngine.analyzeContent(extractedContent);
  const structuralAnalysis = await analysisEngine.analyzeStructure(extractedContent);
  console.log('✓ Content analyzed:', {
    sentiment: conceptualAnalysis.sentiment,
    complexity: conceptualAnalysis.complexity
  });

  // Step 5: Create Single Source of Truth
  const sst = sstManager.createSST(
    metadata,
    extractedContent,
    structuralAnalysis,
    conceptualAnalysis,
    domainAnalysis.domain,
    domainAnalysis.confidence
  );
  console.log('✓ Single Source of Truth created:', {
    id: sst.metadata.id,
    version: sst.version
  });

  // Step 6: Save SST
  await sstSerializer.save(sst);
  console.log('✓ SST saved to storage\n');

  // Example 2: Generate content
  console.log('📄 Example 2: Generating Content');
  console.log('=================================\n');

  const generatedScript = await generationEngine.generateContent(sst, 'script');
  console.log('✓ Script generated:', {
    type: generatedScript.type,
    aiAssisted: generatedScript.aiAssisted,
    editable: generatedScript.editable
  });

  // Step 7: Human approval workflow
  const approvalRequest = await humanLoopController.createApprovalRequest(
    sst.metadata.id,
    generatedScript
  );
  console.log('✓ Approval request created:', {
    id: approvalRequest.id,
    status: approvalRequest.status
  });

  // Simulate creator approval
  const approved = await humanLoopController.processDecision(
    approvalRequest.id,
    'approved',
    'Looks great!'
  );
  console.log('✓ Creator decision:', approved.status, '-', approved.creatorFeedback);

  // Example 3: CSV processing
  console.log('\n📊 Example 3: Processing Structured Data');
  console.log('=========================================\n');

  const csvContent = Buffer.from(`
name,age,city,score
Alice,25,New York,95
Bob,30,San Francisco,87
Charlie,35,Boston,92
  `.trim());

  const csvInput = {
    file: csvContent,
    filename: 'users.csv',
    mimeType: 'text/csv'
  };

  const csvMetadata = contentProcessor.createMetadata(csvInput);
  const csvExtracted = await contentProcessor.routeContent(csvMetadata, csvInput.file);
  
  console.log('✓ CSV processed:', {
    rowCount: (csvExtracted.structuredData as any)?.rowCount,
    schema: (csvExtracted.structuredData as any)?.schema
  });

  // Summary
  console.log('\n✅ Demo Complete!');
  console.log('=================\n');
  console.log('The Content Intelligence Platform successfully:');
  console.log('  • Processed multiple content types (text, CSV)');
  console.log('  • Created Single Source of Truth objects');
  console.log('  • Generated AI-assisted content');
  console.log('  • Implemented human-in-the-loop approval');
  console.log('  • Persisted data with version control\n');
}

// Run demo
runDemo().catch(console.error);
