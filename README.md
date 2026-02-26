# Content Intelligence Platform

AI-assisted content understanding and generation system using AWS AI services.

## Features

- Multi-format content processing (video, text, image, structured data)
- Domain-specific content analysis (Education, Food, Travel, Product Reviews)
- AI-powered content generation with human-in-the-loop approval
- AWS Bedrock Claude 3.5 Sonnet integration
- Microservices architecture with TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials:
```bash
cp .env.example .env
# Edit .env with your AWS credentials
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Architecture

- **ContentProcessor**: Handles content input validation and routing
- **DomainAdapter**: Detects and applies domain-specific analysis
- **AIServiceManager**: Manages AWS AI service integrations
- **AnalysisEngine**: Performs content analysis using Claude
- **GenerationEngine**: Generates content based on analysis
- **HumanLoopController**: Manages approval workflows

## Development

```bash
# Run in development mode
npm run dev

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Requirements

- Node.js 18+
- AWS account with Bedrock access
- TypeScript 5+
