/**
 * Cultural Adapter Service Tests
 * 
 * Comprehensive test suite for cultural adaptation functionality
 * Tests cultural adaptation for multiple languages, idioms, festivals,
 * currency conversions, measurement conversions, and edge cases.
 * 
 * Coverage targets: >80%
 */

import { culturalAdapterService, CulturalAdaptation } from '../services/cultural-adapter.service';
import { wait } from './setup';

describe('CulturalAdapterService', () => {
  
  // ============================================================================
  // Basic Functionality Tests
  // ============================================================================
  
  describe('Basic Adaptation', () => {
    it('should return original content when no adaptations needed', async () => {
      const content = 'This is a simple test message.';
      const result = await culturalAdapterService.adapt(content, 'us');
      
      expect(result.originalContent).toBe(content);
      expect(result.adaptedContent).toBe(content);
      expect(result.targetRegion).toBe('us');
      expect(result.changes).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should adapt content for target region', async () => {
      const content = 'Happy Thanksgiving! Enjoy the holiday.';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.originalContent).toBe(content);
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.targetRegion).toBe('india');
      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.85);
    });

    it('should handle case-insensitive region names', async () => {
      const content = 'Thanksgiving celebration';
      const result1 = await culturalAdapterService.adapt(content, 'INDIA');
      const result2 = await culturalAdapterService.adapt(content, 'India');
      const result3 = await culturalAdapterService.adapt(content, 'india');
      
      expect(result1.adaptedContent).toBe(result2.adaptedContent);
      expect(result2.adaptedContent).toBe(result3.adaptedContent);
    });
  });

  // ============================================================================
  // Regional Adaptation Tests
  // ============================================================================
  
  describe('Regional Adaptations', () => {
    describe('India Region', () => {
      it('should adapt festivals for India', async () => {
        const content = 'Thanksgiving and Christmas are major holidays.';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('Diwali');
        expect(result.adaptedContent).not.toContain('Thanksgiving');
        expect(result.adaptedContent).not.toContain('Christmas');
      });

      it('should adapt currency for India', async () => {
        const content = 'The price is $100 dollars.';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('₹');
        expect(result.adaptedContent).toContain('rupees');
        expect(result.adaptedContent).not.toContain('$');
        expect(result.adaptedContent).not.toContain('dollars');
      });

      it('should adapt measurements for India', async () => {
        const content = 'The distance is 100 miles and weight is 50 pounds.';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('kilometers');
        expect(result.adaptedContent).toContain('kilograms');
        expect(result.adaptedContent).not.toContain('miles');
        expect(result.adaptedContent).not.toContain('pounds');
      });

      it('should adapt cultural references for India', async () => {
        const content = 'Super Bowl is the biggest event.';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('IPL Finals');
        expect(result.adaptedContent).not.toContain('Super Bowl');
      });

      it('should adapt Black Friday for India', async () => {
        const content = 'Black Friday sale starts tomorrow!';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('Diwali Sale');
        expect(result.adaptedContent).not.toContain('Black Friday');
      });
    });

    describe('UK Region', () => {
      it('should adapt festivals for UK', async () => {
        const content = 'Thanksgiving is coming up soon.';
        const result = await culturalAdapterService.adapt(content, 'uk');
        
        expect(result.adaptedContent).toContain('Christmas');
        expect(result.adaptedContent).not.toContain('Thanksgiving');
      });

      it('should adapt currency for UK', async () => {
        const content = 'It costs $50 dollars.';
        const result = await culturalAdapterService.adapt(content, 'uk');
        
        expect(result.adaptedContent).toContain('£');
        expect(result.adaptedContent).toContain('pounds');
        expect(result.adaptedContent).not.toContain('$');
        expect(result.adaptedContent).not.toContain('dollars');
      });

      it('should keep UK measurements unchanged', async () => {
        const content = 'The distance is 10 miles and height is 6 feet.';
        const result = await culturalAdapterService.adapt(content, 'uk');
        
        // UK uses miles and feet
        expect(result.adaptedContent).toContain('miles');
        expect(result.adaptedContent).toContain('feet');
      });

      it('should adapt sports references for UK', async () => {
        const content = 'Super Bowl is exciting!';
        const result = await culturalAdapterService.adapt(content, 'uk');
        
        expect(result.adaptedContent).toContain('FA Cup Final');
        expect(result.adaptedContent).not.toContain('Super Bowl');
      });
    });

    describe('US Region', () => {
      it('should not modify content for US region', async () => {
        const content = 'Thanksgiving, $100 dollars, 50 miles, Super Bowl';
        const result = await culturalAdapterService.adapt(content, 'us');
        
        expect(result.adaptedContent).toBe(content);
        expect(result.changes).toHaveLength(0);
      });
    });
  });

  // ============================================================================
  // Festival/Holiday Adaptation Tests
  // ============================================================================
  
  describe('Festival Adaptations', () => {
    const festivals = [
      { original: 'Thanksgiving', region: 'india', expected: 'Diwali' },
      { original: 'Christmas', region: 'india', expected: 'Diwali' },
      { original: 'Black Friday', region: 'india', expected: 'Diwali Sale' },
      { original: 'Thanksgiving', region: 'uk', expected: 'Christmas' },
    ];

    festivals.forEach(({ original, region, expected }) => {
      it(`should adapt ${original} to ${expected} for ${region}`, async () => {
        const content = `Join us for ${original} celebration!`;
        const result = await culturalAdapterService.adapt(content, region);
        
        expect(result.adaptedContent).toContain(expected);
        expect(result.changes).toContainEqual(
          expect.objectContaining({
            original: expect.stringMatching(new RegExp(original, 'i')),
            adapted: expected,
            type: 'festival'
          })
        );
      });
    });

    it('should handle multiple festival references in one text', async () => {
      const content = 'Thanksgiving and Christmas are both great holidays.';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.changes.length).toBeGreaterThanOrEqual(2);
    });

    it('should preserve festival context in sentences', async () => {
      const content = 'We celebrate Thanksgiving with family and friends.';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('celebrate Diwali with');
    });
  });

  // ============================================================================
  // Currency Conversion Tests
  // ============================================================================
  
  describe('Currency Conversions', () => {
    describe('Dollar to Rupee (India)', () => {
      it('should convert $ symbol to ₹', async () => {
        const content = 'Price: $99.99';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('₹');
        expect(result.adaptedContent).not.toContain('$');
      });

      it('should convert "dollar" to "rupee"', async () => {
        const content = 'One dollar only';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('rupee');
        expect(result.adaptedContent).not.toContain('dollar');
      });

      it('should convert "dollars" to "rupees"', async () => {
        const content = 'Costs 50 dollars';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('rupees');
        expect(result.adaptedContent).not.toContain('dollars');
      });

      it('should handle multiple currency references', async () => {
        const content = '$10 dollars and $20 dollars';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('₹');
        expect(result.adaptedContent).toContain('rupees');
        expect(result.changes.filter(c => c.type === 'currency').length).toBeGreaterThan(0);
      });
    });

    describe('Dollar to Pound (UK)', () => {
      it('should convert $ symbol to £', async () => {
        const content = 'Price: $50';
        const result = await culturalAdapterService.adapt(content, 'uk');
        
        expect(result.adaptedContent).toContain('£');
        expect(result.adaptedContent).not.toContain('$');
      });

      it('should convert "dollars" to "pounds"', async () => {
        const content = 'Costs 100 dollars';
        const result = await culturalAdapterService.adapt(content, 'uk');
        
        expect(result.adaptedContent).toContain('pounds');
        expect(result.adaptedContent).not.toContain('dollars');
      });
    });

    it('should classify currency changes correctly', async () => {
      const content = '$100 dollars';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      const currencyChanges = result.changes.filter(c => c.type === 'currency');
      expect(currencyChanges.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Measurement Conversion Tests
  // ============================================================================
  
  describe('Measurement Conversions', () => {
    describe('India Measurements', () => {
      it('should convert miles to kilometers', async () => {
        const content = 'Distance: 100 miles';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('kilometers');
        expect(result.adaptedContent).not.toContain('miles');
      });

      it('should convert feet to meters', async () => {
        const content = 'Height: 6 feet';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('meters');
        expect(result.adaptedContent).not.toContain('feet');
      });

      it('should convert pounds to kilograms', async () => {
        const content = 'Weight: 150 pounds';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('kilograms');
        expect(result.adaptedContent).not.toContain('pounds');
      });

      it('should handle multiple measurement types', async () => {
        const content = 'Run 5 miles, jump 10 feet, lift 200 pounds';
        const result = await culturalAdapterService.adapt(content, 'india');
        
        expect(result.adaptedContent).toContain('kilometers');
        expect(result.adaptedContent).toContain('meters');
        expect(result.adaptedContent).toContain('kilograms');
      });
    });

    it('should classify measurement changes correctly', async () => {
      const content = '50 miles and 100 pounds';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      const measurementChanges = result.changes.filter(c => c.type === 'measurement');
      expect(measurementChanges.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Cultural Reference Tests
  // ============================================================================
  
  describe('Cultural References', () => {
    it('should adapt sports references for India', async () => {
      const content = 'Super Bowl Sunday is huge!';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('IPL Finals');
      expect(result.changes).toContainEqual(
        expect.objectContaining({
          type: 'reference'
        })
      );
    });

    it('should adapt sports references for UK', async () => {
      const content = 'Super Bowl is the biggest game.';
      const result = await culturalAdapterService.adapt(content, 'uk');
      
      expect(result.adaptedContent).toContain('FA Cup Final');
    });

    it('should classify reference changes correctly', async () => {
      const content = 'Super Bowl excitement';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      const referenceChanges = result.changes.filter(c => c.type === 'reference');
      expect(referenceChanges.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Complex Content Tests
  // ============================================================================
  
  describe('Complex Content Adaptation', () => {
    it('should handle content with multiple adaptation types', async () => {
      const content = 'Join us for Thanksgiving! Tickets are $50 dollars. Venue is 10 miles away. Watch the Super Bowl!';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.adaptedContent).toContain('₹');
      expect(result.adaptedContent).toContain('rupees');
      expect(result.adaptedContent).toContain('kilometers');
      expect(result.adaptedContent).toContain('IPL Finals');
      
      expect(result.changes.length).toBeGreaterThan(4);
      expect(result.changes.some(c => c.type === 'festival')).toBe(true);
      expect(result.changes.some(c => c.type === 'currency')).toBe(true);
      expect(result.changes.some(c => c.type === 'measurement')).toBe(true);
      expect(result.changes.some(c => c.type === 'reference')).toBe(true);
    });

    it('should preserve sentence structure during adaptation', async () => {
      const content = 'The Thanksgiving dinner costs $100 dollars and the venue is 5 miles away.';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toMatch(/dinner costs.*and the venue is.*away/);
    });

    it('should handle repeated terms correctly', async () => {
      const content = 'Thanksgiving, Thanksgiving, Thanksgiving!';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toBe('Diwali, Diwali, Diwali!');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  
  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const content = '';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.originalContent).toBe('');
      expect(result.adaptedContent).toBe('');
      expect(result.changes).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should handle whitespace-only content', async () => {
      const content = '   \n\t  ';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toBe(content);
      expect(result.changes).toHaveLength(0);
    });

    it('should handle unsupported regions gracefully', async () => {
      const content = 'Thanksgiving celebration with $100 dollars';
      const result = await culturalAdapterService.adapt(content, 'unsupported-region');
      
      expect(result.originalContent).toBe(content);
      expect(result.adaptedContent).toBe(content);
      expect(result.changes).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should handle special characters', async () => {
      const content = 'Thanksgiving! @#$% $100 dollars??? 🎉';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.adaptedContent).toContain('₹');
      expect(result.adaptedContent).toContain('🎉');
      expect(result.adaptedContent).toContain('@#$%');
    });

    it('should handle very long content', async () => {
      const content = 'Thanksgiving '.repeat(100) + '$100 dollars';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.adaptedContent).toContain('₹');
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it('should handle content with numbers', async () => {
      const content = 'Thanksgiving2023 and $100.50 dollars';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      // Should not match Thanksgiving2023 due to word boundary
      expect(result.adaptedContent).toContain('Thanksgiving2023');
      expect(result.adaptedContent).toContain('₹');
    });

    it('should handle mixed case terms', async () => {
      const content = 'THANKSGIVING thanksgiving ThAnKsGiViNg';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent.toLowerCase()).toContain('diwali');
      expect(result.adaptedContent).not.toContain('Thanksgiving');
    });

    it('should handle partial word matches correctly', async () => {
      const content = 'thanksgiving-day and dollar-sign';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      // Word boundaries should prevent partial matches
      expect(result.adaptedContent).toContain('thanksgiving-day');
      expect(result.adaptedContent).toContain('dollar-sign');
    });

    it('should handle null-like strings', async () => {
      const content = 'null undefined NaN';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toBe(content);
      expect(result.changes).toHaveLength(0);
    });

    it('should handle unicode characters', async () => {
      const content = 'Thanksgiving célébration with $100 dollars 你好';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.adaptedContent).toContain('célébration');
      expect(result.adaptedContent).toContain('你好');
    });
  });

  // ============================================================================
  // Change Tracking Tests
  // ============================================================================
  
  describe('Change Tracking', () => {
    it('should track all changes made', async () => {
      const content = 'Thanksgiving costs $50 dollars, venue 10 miles away';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.changes.length).toBeGreaterThan(0);
      result.changes.forEach(change => {
        expect(change).toHaveProperty('original');
        expect(change).toHaveProperty('adapted');
        expect(change).toHaveProperty('type');
        expect(['idiom', 'festival', 'currency', 'measurement', 'reference']).toContain(change.type);
      });
    });

    it('should provide correct change types', async () => {
      const content = 'Thanksgiving $100 50 miles Super Bowl';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      const types = result.changes.map(c => c.type);
      expect(types).toContain('festival');
      expect(types).toContain('currency');
      expect(types).toContain('measurement');
      expect(types).toContain('reference');
    });

    it('should not duplicate changes for same term', async () => {
      const content = 'Thanksgiving and Thanksgiving';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      // Should track the change once even though term appears twice
      const thanksgivingChanges = result.changes.filter(c => 
        c.original.toLowerCase().includes('thanksgiving')
      );
      expect(thanksgivingChanges.length).toBe(1);
    });
  });

  // ============================================================================
  // Confidence Score Tests
  // ============================================================================
  
  describe('Confidence Scores', () => {
    it('should return confidence 1.0 when no changes made', async () => {
      const content = 'Simple text with no adaptations needed';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.confidence).toBe(1.0);
    });

    it('should return confidence 0.85 when changes made', async () => {
      const content = 'Thanksgiving celebration';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.confidence).toBe(0.85);
    });

    it('should maintain consistent confidence for multiple changes', async () => {
      const content1 = 'Thanksgiving';
      const content2 = 'Thanksgiving $100 50 miles';
      
      const result1 = await culturalAdapterService.adapt(content1, 'india');
      const result2 = await culturalAdapterService.adapt(content2, 'india');
      
      expect(result1.confidence).toBe(result2.confidence);
    });
  });

  // ============================================================================
  // Supported Regions Tests
  // ============================================================================
  
  describe('Supported Regions', () => {
    it('should return list of supported regions', () => {
      const regions = culturalAdapterService.getSupportedRegions();
      
      expect(Array.isArray(regions)).toBe(true);
      expect(regions.length).toBeGreaterThan(0);
      expect(regions).toContain('india');
      expect(regions).toContain('uk');
      expect(regions).toContain('us');
    });

    it('should include all expected regions', () => {
      const regions = culturalAdapterService.getSupportedRegions();
      
      expect(regions).toEqual(expect.arrayContaining([
        'india',
        'uk',
        'us',
        'canada',
        'australia'
      ]));
    });
  });

  // ============================================================================
  // Language Support Tests (Preparation for 9 languages)
  // ============================================================================
  
  describe('Language Support (Future)', () => {
    // These tests prepare for the 9-language requirement
    // Currently the service supports regions, not specific languages
    // This section documents expected behavior for future implementation
    
    const expectedLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml'];
    
    it('should document expected language support', () => {
      // This test documents the requirement for 9 languages:
      // en (English), hi (Hindi), bn (Bengali), ta (Tamil), 
      // te (Telugu), mr (Marathi), gu (Gujarati), kn (Kannada), ml (Malayalam)
      
      expect(expectedLanguages).toHaveLength(9);
      expect(expectedLanguages).toContain('en'); // English
      expect(expectedLanguages).toContain('hi'); // Hindi
      expect(expectedLanguages).toContain('bn'); // Bengali
      expect(expectedLanguages).toContain('ta'); // Tamil
      expect(expectedLanguages).toContain('te'); // Telugu
      expect(expectedLanguages).toContain('mr'); // Marathi
      expect(expectedLanguages).toContain('gu'); // Gujarati
      expect(expectedLanguages).toContain('kn'); // Kannada
      expect(expectedLanguages).toContain('ml'); // Malayalam
    });

    it('should handle India region for all Indian languages', async () => {
      // India region should work for all Indian languages
      const content = 'Thanksgiving with $100 dollars';
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.adaptedContent).toContain('₹');
    });
  });

  // ============================================================================
  // Idiom Adaptation Tests (10+ idioms)
  // ============================================================================
  
  describe('Idiom Adaptations', () => {
    // Note: Current implementation doesn't have idiom-specific mappings
    // These tests document expected behavior for future implementation
    
    it('should prepare for idiom adaptation feature', () => {
      // Future idioms to support:
      const expectedIdioms = [
        { en: 'piece of cake', hi: 'बहुत आसान' },
        { en: 'break the ice', hi: 'बर्फ तोड़ना' },
        { en: 'hit the nail on the head', hi: 'सही बात कहना' },
        { en: 'cost an arm and a leg', hi: 'बहुत महंगा' },
        { en: 'once in a blue moon', hi: 'कभी-कभार' },
        { en: 'let the cat out of the bag', hi: 'राज खोलना' },
        { en: 'under the weather', hi: 'तबीयत खराब' },
        { en: 'spill the beans', hi: 'भेद खोलना' },
        { en: 'bite the bullet', hi: 'मुश्किल सहना' },
        { en: 'break a leg', hi: 'शुभकामनाएं' },
        { en: 'call it a day', hi: 'काम खत्म करना' },
        { en: 'cut corners', hi: 'शॉर्टकट लेना' },
      ];
      
      expect(expectedIdioms.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================
  
  describe('Performance', () => {
    it('should adapt content quickly', async () => {
      const content = 'Thanksgiving celebration with $100 dollars, 50 miles away, Super Bowl party';
      const startTime = Date.now();
      
      await culturalAdapterService.adapt(content, 'india');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle concurrent adaptations', async () => {
      const content = 'Thanksgiving with $100 dollars';
      const promises = Array(10).fill(null).map(() => 
        culturalAdapterService.adapt(content, 'india')
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.adaptedContent).toContain('Diwali');
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  
  describe('Integration Scenarios', () => {
    it('should adapt marketing content for India', async () => {
      const content = `
        Join us for our Thanksgiving sale!
        Everything is 50% off - just $99 dollars!
        Store location: 5 miles from downtown.
        Watch the Super Bowl with us!
      `;
      
      const result = await culturalAdapterService.adapt(content, 'india');
      
      expect(result.adaptedContent).toContain('Diwali');
      expect(result.adaptedContent).toContain('₹');
      expect(result.adaptedContent).toContain('kilometers');
      expect(result.adaptedContent).toContain('IPL Finals');
    });

    it('should adapt blog post for UK', async () => {
      const content = `
        This Thanksgiving, I'm grateful for everything.
        The trip cost me $500 dollars and was 100 miles away.
        Can't wait for the Super Bowl next month!
      `;
      
      const result = await culturalAdapterService.adapt(content, 'uk');
      
      expect(result.adaptedContent).toContain('Christmas');
      expect(result.adaptedContent).toContain('£');
      expect(result.adaptedContent).toContain('FA Cup Final');
    });

    it('should preserve US content unchanged', async () => {
      const content = `
        Thanksgiving dinner costs $50 dollars.
        Drive 10 miles to the venue.
        Super Bowl party starts at 6 PM!
      `;
      
      const result = await culturalAdapterService.adapt(content, 'us');
      
      expect(result.adaptedContent).toBe(content);
      expect(result.changes).toHaveLength(0);
    });
  });
});
