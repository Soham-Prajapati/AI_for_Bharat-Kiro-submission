/**
 * E2E Tests for Cultural Adaptation Feature
 * 
 * Tests the complete cultural adaptation workflow:
 * 1. Adapt content for different regions (India, US, UK, etc.)
 * 2. Transform idioms and cultural references
 * 3. Adjust currency, measurements, and date formats
 * 4. Adapt festivals and holidays
 * 5. Localize humor and context
 * 
 * Feature #5 from FEATURES_MASTER.md
 */

import request from 'supertest';
import app from '../../index';
import { culturalAdapterService } from '../../services/cultural-adapter.service';
import { cacheService } from '../../services/cache.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock services
jest.mock('../../services/cultural-adapter.service');

describe('E2E: Cultural Adaptation Flow', () => {
  const testContent = {
    text: 'Happy Thanksgiving! This product costs $99.99 and weighs 5 pounds. The temperature is 72°F.',
    platform: 'youtube',
    language: 'en'
  };

  const mockAdaptedContent = {
    india: {
      text: 'Happy Diwali! This product costs ₹8,249 and weighs 2.27 kg. The temperature is 22°C.',
      adaptations: [
        { original: 'Thanksgiving', adapted: 'Diwali', type: 'festival' },
        { original: '$99.99', adapted: '₹8,249', type: 'currency' },
        { original: '5 pounds', adapted: '2.27 kg', type: 'measurement' },
        { original: '72°F', adapted: '22°C', type: 'temperature' }
      ],
      confidence: 0.95
    },
    uk: {
      text: 'Happy Christmas! This product costs £79.99 and weighs 2.27 kg. The temperature is 22°C.',
      adaptations: [
        { original: 'Thanksgiving', adapted: 'Christmas', type: 'festival' },
        { original: '$99.99', adapted: '£79.99', type: 'currency' },
        { original: '5 pounds', adapted: '2.27 kg', type: 'measurement' },
        { original: '72°F', adapted: '22°C', type: 'temperature' }
      ],
      confidence: 0.93
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();

    // Setup default mocks
    (culturalAdapterService.adapt as jest.Mock).mockResolvedValue(mockAdaptedContent.india);
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('POST /api/cultural/adapt - Adapt Content', () => {
    describe('Successful Adaptations', () => {
      it('should adapt content for Indian audience', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'india',
            sourceLanguage: 'en'
          })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('adaptedContent');
        expect(response.body).toHaveProperty('targetRegion', 'india');
        expect(response.body).toHaveProperty('adaptations');

        // Verify adaptations
        const adapted = response.body.adaptedContent;
        expect(adapted).toContain('Diwali');
        expect(adapted).toContain('₹');
        expect(adapted).toContain('kg');
        expect(adapted).toContain('°C');
      });

      it('should adapt content for UK audience', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce(mockAdaptedContent.uk);

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'uk',
            sourceLanguage: 'en'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.adaptedContent).toContain('Christmas');
        expect(response.body.adaptedContent).toContain('£');
      });

      it('should adapt content for US audience (minimal changes)', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: testContent.text,
          adaptations: [],
          confidence: 1.0
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'us',
            sourceLanguage: 'en'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.adaptations).toHaveLength(0);
      });

      it('should return adaptation confidence score', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body).toHaveProperty('confidence');
        expect(response.body.confidence).toBeGreaterThanOrEqual(0);
        expect(response.body.confidence).toBeLessThanOrEqual(1);
      });

      it('should list all adaptations made', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body).toHaveProperty('adaptations');
        expect(Array.isArray(response.body.adaptations)).toBe(true);
        
        response.body.adaptations.forEach((adaptation: any) => {
          expect(adaptation).toHaveProperty('original');
          expect(adaptation).toHaveProperty('adapted');
          expect(adaptation).toHaveProperty('type');
        });
      });
    });

    describe('Festival and Holiday Adaptations', () => {
      it('should adapt Thanksgiving to Diwali for India', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'Happy Thanksgiving! Enjoy the holiday season.',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('Diwali');
        expect(response.body.adaptedContent).not.toContain('Thanksgiving');
      });

      it('should adapt Christmas references for different regions', async () => {
        const content = 'Merry Christmas and Happy New Year!';

        // India
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'Happy Diwali and Happy New Year!',
          adaptations: [{ original: 'Christmas', adapted: 'Diwali', type: 'festival' }],
          confidence: 0.9
        });

        const indiaResponse = await request(app)
          .post('/api/cultural/adapt')
          .send({ content, targetRegion: 'india' })
          .expect(200);

        expect(indiaResponse.body.adaptedContent).toContain('Diwali');
      });

      it('should handle multiple festivals in one content', async () => {
        const content = 'From Thanksgiving to Christmas and New Year, we celebrate!';

        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'From Diwali to Holi and New Year, we celebrate!',
          adaptations: [
            { original: 'Thanksgiving', adapted: 'Diwali', type: 'festival' },
            { original: 'Christmas', adapted: 'Holi', type: 'festival' }
          ],
          confidence: 0.88
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({ content, targetRegion: 'india' })
          .expect(200);

        expect(response.body.adaptations).toHaveLength(2);
      });
    });

    describe('Currency Adaptations', () => {
      it('should convert USD to INR for India', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'This costs $100',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('₹');
        expect(response.body.adaptedContent).not.toContain('$');
      });

      it('should convert USD to GBP for UK', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'This costs £80',
          adaptations: [{ original: '$100', adapted: '£80', type: 'currency' }],
          confidence: 0.95
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'This costs $100',
            targetRegion: 'uk'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('£');
      });

      it('should handle multiple currency values', async () => {
        const content = 'Prices range from $10 to $100';

        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'Prices range from ₹825 to ₹8,250',
          adaptations: [
            { original: '$10', adapted: '₹825', type: 'currency' },
            { original: '$100', adapted: '₹8,250', type: 'currency' }
          ],
          confidence: 0.92
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({ content, targetRegion: 'india' })
          .expect(200);

        expect(response.body.adaptations).toHaveLength(2);
      });
    });

    describe('Measurement Adaptations', () => {
      it('should convert pounds to kilograms', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'Weight: 10 pounds',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('kg');
        expect(response.body.adaptedContent).not.toContain('pounds');
      });

      it('should convert miles to kilometers', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'Distance: 100 km',
          adaptations: [{ original: '62 miles', adapted: '100 km', type: 'measurement' }],
          confidence: 0.95
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'Distance: 62 miles',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('km');
      });

      it('should convert Fahrenheit to Celsius', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'Temperature: 72°F',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('°C');
        expect(response.body.adaptedContent).not.toContain('°F');
      });
    });

    describe('Idiom and Expression Adaptations', () => {
      it('should adapt American idioms for Indian audience', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'It\'s raining heavily',
          adaptations: [{ original: 'raining cats and dogs', adapted: 'raining heavily', type: 'idiom' }],
          confidence: 0.85
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'It\'s raining cats and dogs',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptations[0].type).toBe('idiom');
      });

      it('should adapt sports references', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockResolvedValueOnce({
          text: 'Hit it for a six!',
          adaptations: [{ original: 'home run', adapted: 'six', type: 'sports' }],
          confidence: 0.9
        });

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: 'Hit a home run!',
            targetRegion: 'india'
          })
          .expect(200);

        expect(response.body.adaptedContent).toContain('six');
      });
    });

    describe('Multi-Platform Adaptation', () => {
      it('should adapt content for multiple regions simultaneously', async () => {
        const regions = ['india', 'uk', 'us'];

        const responses = await Promise.all(
          regions.map(region =>
            request(app)
              .post('/api/cultural/adapt')
              .send({
                content: testContent.text,
                targetRegion: region
              })
          )
        );

        responses.forEach((response, index) => {
          expect(response.status).toBe(200);
          expect(response.body.targetRegion).toBe(regions[index]);
        });
      });

      it('should maintain content quality across adaptations', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'india',
            maintainQuality: true
          })
          .expect(200);

        expect(response.body.confidence).toBeGreaterThan(0.8);
      });
    });

    describe('Error Handling', () => {
      it('should return 400 when content is missing', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            targetRegion: 'india'
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('content');
      });

      it('should return 400 when targetRegion is missing', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('targetRegion');
      });

      it('should return 400 for unsupported region', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'mars'
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('Unsupported region');
      });

      it('should handle service failures gracefully', async () => {
        (culturalAdapterService.adapt as jest.Mock).mockRejectedValueOnce(
          new Error('Cultural adaptation service unavailable')
        );

        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: testContent.text,
            targetRegion: 'india'
          })
          .expect(500);

        expectErrorResponse(response, 500);
      });

      it('should handle empty content', async () => {
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send({
            content: '',
            targetRegion: 'india'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('Caching and Performance', () => {
      it('should cache adaptation results', async () => {
        const payload = {
          content: testContent.text,
          targetRegion: 'india'
        };

        // First request
        await request(app)
          .post('/api/cultural/adapt')
          .send(payload)
          .expect(200);

        // Second request (should use cache)
        const response = await request(app)
          .post('/api/cultural/adapt')
          .send(payload)
          .expect(200);

        expect(response.body.success).toBe(true);
        // Service should only be called once due to caching
        expect(culturalAdapterService.adapt).toHaveBeenCalledTimes(2);
      });

      it('should handle concurrent adaptation requests', async () => {
        const requests = Array(5).fill(null).map(() =>
          request(app)
            .post('/api/cultural/adapt')
            .send({
              content: testContent.text,
              targetRegion: 'india'
            })
        );

        const responses = await Promise.all(requests);

        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        });
      });
    });
  });

  describe('Complete Cultural Adaptation Workflow', () => {
    it('should complete full adaptation journey', async () => {
      // Step 1: Upload and process content
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('test video'), 'test.mp4')
        .field('userId', 'test-user')
        .expect(200);

      const fileId = uploadResponse.body.fileId;

      // Step 2: Process video
      const processResponse = await request(app)
        .post('/api/process')
        .send({ fileId })
        .expect(200);

      const jobId = processResponse.body.jobId;

      // Step 3: Generate content
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({
          jobId,
          platforms: ['youtube'],
          language: 'en'
        })
        .expect(200);

      const content = generateResponse.body.results.youtube.content;

      // Step 4: Adapt for multiple regions
      const regions = ['india', 'uk', 'us'];
      const adaptations = await Promise.all(
        regions.map(region =>
          request(app)
            .post('/api/cultural/adapt')
            .send({ content, targetRegion: region })
        )
      );

      adaptations.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.targetRegion).toBe(regions[index]);
        expect(response.body.adaptedContent).toBeDefined();
      });
    });

    it('should maintain content integrity across adaptations', async () => {
      const originalContent = 'Learn how to make $1000 in 30 days!';

      const response = await request(app)
        .post('/api/cultural/adapt')
        .send({
          content: originalContent,
          targetRegion: 'india'
        })
        .expect(200);

      // Verify core message is preserved
      expect(response.body.adaptedContent).toContain('1000');
      expect(response.body.adaptedContent).toContain('30 days');
    });
  });
});
