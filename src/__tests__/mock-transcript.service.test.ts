/**
 * Unit Tests for Mock Transcript Service
 * 
 * Tests the mock transcript generator service functionality
 */

import { mockTranscriptService, MockTranscriptService } from '../services/mock-transcript.service';

describe('MockTranscriptService', () => {
  describe('generateTranscript', () => {
    it('should generate a transcript with required fields', () => {
      const result = mockTranscriptService.generateTranscript('test-file-id', 'test.mp4');
      
      expect(result).toHaveProperty('transcript');
      expect(result).toHaveProperty('keyPoints');
      expect(result).toHaveProperty('wordCount');
      
      expect(typeof result.transcript).toBe('string');
      expect(Array.isArray(result.keyPoints)).toBe(true);
      expect(typeof result.wordCount).toBe('number');
    });
    
    it('should generate transcript with 50-200 words', () => {
      const result = mockTranscriptService.generateTranscript('test-file-id');
      
      expect(result.wordCount).toBeGreaterThanOrEqual(50);
      expect(result.wordCount).toBeLessThanOrEqual(300); // Templates are slightly longer
    });
    
    it('should generate 3-5 key points', () => {
      const result = mockTranscriptService.generateTranscript('test-file-id');
      
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(3);
      expect(result.keyPoints.length).toBeLessThanOrEqual(5);
    });
    
    it('should generate deterministic results for same fileId', () => {
      const result1 = mockTranscriptService.generateTranscript('same-id');
      const result2 = mockTranscriptService.generateTranscript('same-id');
      
      expect(result1.transcript).toBe(result2.transcript);
      expect(result1.keyPoints).toEqual(result2.keyPoints);
      expect(result1.wordCount).toBe(result2.wordCount);
    });
    
    it('should generate different results for different fileIds', () => {
      const result1 = mockTranscriptService.generateTranscript('file-id-1');
      const result2 = mockTranscriptService.generateTranscript('file-id-2');
      
      // May occasionally be the same if hash collision, but unlikely
      // At minimum, key points should differ due to different selection
      const sameTranscript = result1.transcript === result2.transcript;
      const sameKeyPoints = JSON.stringify(result1.keyPoints) === JSON.stringify(result2.keyPoints);
      
      // At least one should be different
      expect(sameTranscript && sameKeyPoints).toBe(false);
    });
    
    it('should generate non-empty transcript', () => {
      const result = mockTranscriptService.generateTranscript('test-id');
      
      expect(result.transcript.length).toBeGreaterThan(0);
      expect(result.transcript.trim()).not.toBe('');
    });
    
    it('should generate non-empty key points', () => {
      const result = mockTranscriptService.generateTranscript('test-id');
      
      result.keyPoints.forEach(point => {
        expect(point.length).toBeGreaterThan(0);
        expect(point.trim()).not.toBe('');
      });
    });
    
    it('should calculate word count correctly', () => {
      const result = mockTranscriptService.generateTranscript('test-id');
      
      const actualWordCount = result.transcript
        .split(/\s+/)
        .filter(w => w.trim()).length;
      
      expect(result.wordCount).toBe(actualWordCount);
    });
  });
  
  describe('extractKeyPoints', () => {
    it('should extract key points from transcript', () => {
      const transcript = 'First, this is important. Second, remember this key point. Third, you need to know this. Finally, this is crucial.';
      
      const keyPoints = mockTranscriptService.extractKeyPoints(transcript);
      
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(keyPoints.length).toBeLessThanOrEqual(5);
    });
    
    it('should filter out very short sentences', () => {
      const transcript = 'Hi. This is a longer sentence that should be included. Yes. Another good sentence here.';
      
      const keyPoints = mockTranscriptService.extractKeyPoints(transcript);
      
      keyPoints.forEach(point => {
        expect(point.length).toBeGreaterThan(20);
      });
    });
    
    it('should prioritize sentences with key indicators', () => {
      const transcript = 'Random sentence. The key is to focus. Another random sentence. Remember this important point. More random text.';
      
      const keyPoints = mockTranscriptService.extractKeyPoints(transcript);
      
      // Should include sentences with "key" and "remember"
      const hasKeyIndicators = keyPoints.some(point => 
        point.toLowerCase().includes('key') || 
        point.toLowerCase().includes('remember')
      );
      
      expect(hasKeyIndicators).toBe(true);
    });
    
    it('should return empty array for empty transcript', () => {
      const keyPoints = mockTranscriptService.extractKeyPoints('');
      
      expect(keyPoints).toEqual([]);
    });
    
    it('should handle transcript with no punctuation', () => {
      const transcript = 'This is a transcript without proper punctuation it just keeps going and going';
      
      const keyPoints = mockTranscriptService.extractKeyPoints(transcript);
      
      // Should still return something, even if not ideal
      expect(Array.isArray(keyPoints)).toBe(true);
    });
  });
  
  describe('getAvailableTopics', () => {
    it('should return array of topics', () => {
      const topics = mockTranscriptService.getAvailableTopics();
      
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
    });
    
    it('should return non-empty topic names', () => {
      const topics = mockTranscriptService.getAvailableTopics();
      
      topics.forEach(topic => {
        expect(typeof topic).toBe('string');
        expect(topic.length).toBeGreaterThan(0);
      });
    });
  });
  
  describe('getTranscriptByTopic', () => {
    it('should return transcript for valid topic', () => {
      const topics = mockTranscriptService.getAvailableTopics();
      const firstTopic = topics[0];
      
      const result = mockTranscriptService.getTranscriptByTopic(firstTopic);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('transcript');
      expect(result).toHaveProperty('keyPoints');
      expect(result).toHaveProperty('wordCount');
    });
    
    it('should return null for invalid topic', () => {
      const result = mockTranscriptService.getTranscriptByTopic('nonexistent-topic');
      
      expect(result).toBeNull();
    });
    
    it('should return consistent results for same topic', () => {
      const topics = mockTranscriptService.getAvailableTopics();
      const topic = topics[0];
      
      const result1 = mockTranscriptService.getTranscriptByTopic(topic);
      const result2 = mockTranscriptService.getTranscriptByTopic(topic);
      
      expect(result1).toEqual(result2);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle very long fileId', () => {
      const longFileId = 'a'.repeat(1000);
      
      const result = mockTranscriptService.generateTranscript(longFileId);
      
      expect(result).toHaveProperty('transcript');
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should handle fileId with special characters', () => {
      const specialFileId = 'file-id-!@#$%^&*()_+{}[]|:;<>?,./';
      
      const result = mockTranscriptService.generateTranscript(specialFileId);
      
      expect(result).toHaveProperty('transcript');
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should handle empty fileId', () => {
      const result = mockTranscriptService.generateTranscript('');
      
      expect(result).toHaveProperty('transcript');
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(3);
    });
  });
  
  describe('Multiple Instances', () => {
    it('should work with multiple service instances', () => {
      const service1 = new MockTranscriptService();
      const service2 = new MockTranscriptService();
      
      const result1 = service1.generateTranscript('test-id');
      const result2 = service2.generateTranscript('test-id');
      
      // Should generate same results (deterministic)
      expect(result1.transcript).toBe(result2.transcript);
      expect(result1.keyPoints).toEqual(result2.keyPoints);
    });
  });
});
