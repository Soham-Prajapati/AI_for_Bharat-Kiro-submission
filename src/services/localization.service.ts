/**
 * Localization Service
 * Consolidates: Cultural Adapter + Vernacular Service
 * 
 * Single service for all translation, cultural adaptation, and localization.
 */

import { CulturalAdapterService } from './cultural-adapter.service';
import { VernacularService, VernacularTranslateRequest, TranslationResult, LanguageProfile } from './vernacular.service';

// Re-export types
export { VernacularTranslateRequest, TranslationResult, LanguageProfile };

export interface CulturalAdaptationRequest {
  content: string;
  sourceRegion?: string;
  targetRegion: string;
  contentType?: 'video' | 'blog' | 'social' | 'marketing';
  preserveOriginalMeaning?: boolean;
}

export interface CulturalAdaptationResult {
  adaptedContent: string;
  changes: Array<{
    original: string;
    adapted: string;
    category: string;
    reasoning: string;
  }>;
  confidence: number;
  sourceRegion: string;
  targetRegion: string;
  adaptationSummary: string;
}

export interface LocalizationResult {
  translatedContent: string;
  culturallyAdaptedContent: string;
  transliteration?: string;
  changes: Array<{
    type: 'translation' | 'cultural';
    original: string;
    localized: string;
    reason: string;
  }>;
  qualityScore: number;
  targetLanguage: string;
  targetRegion: string;
  localizedAt: Date;
}

export class LocalizationService {
  private culturalService: CulturalAdapterService;
  private vernacularService: VernacularService;

  constructor() {
    this.culturalService = new CulturalAdapterService();
    this.vernacularService = new VernacularService();
  }

  // ============================================================================
  // UNIFIED METHODS
  // ============================================================================

  /**
   * Full localization: translate AND culturally adapt
   */
  async localizeContent(
    content: string,
    targetLanguage: string,
    targetRegion: string,
    options?: {
      sourceLanguage?: string;
      contentType?: 'video' | 'blog' | 'social' | 'marketing';
      includeTransliteration?: boolean;
    }
  ): Promise<LocalizationResult> {
    // First translate
    const translationResult = await this.vernacularService.translate({
      content,
      sourceLanguage: options?.sourceLanguage || 'en',
      targetLanguage,
      contentType: options?.contentType || 'social',
      includeTransliteration: options?.includeTransliteration
    });

    // Then culturally adapt the translated content
    const culturalResult = await this.culturalService.adaptContent({
      content: translationResult.translatedContent,
      targetRegion,
      contentType: options?.contentType
    });

    // Combine changes
    const allChanges = [
      ...translationResult.culturalAdaptations.map(c => ({
        type: 'translation' as const,
        original: c.original,
        localized: c.adapted,
        reason: c.reason
      })),
      ...culturalResult.changes.map((c: any) => ({
        type: 'cultural' as const,
        original: c.original,
        localized: c.adapted,
        reason: c.reasoning
      }))
    ];

    return {
      translatedContent: translationResult.translatedContent,
      culturallyAdaptedContent: culturalResult.adaptedContent,
      transliteration: translationResult.transliteration,
      changes: allChanges,
      qualityScore: (translationResult.qualityScore + culturalResult.confidence) / 2,
      targetLanguage,
      targetRegion,
      localizedAt: new Date()
    };
  }

  // ============================================================================
  // CULTURAL ADAPTER METHODS (delegated)
  // ============================================================================

  /**
   * Adapt content for a specific region
   */
  async adaptCulturally(request: CulturalAdaptationRequest): Promise<CulturalAdaptationResult> {
    return this.culturalService.adaptContent(request);
  }

  /**
   * Simple cultural adaptation
   */
  async adaptForRegion(content: string, targetRegion: string): Promise<CulturalAdaptationResult> {
    return this.culturalService.adaptContent({ content, targetRegion });
  }

  /**
   * Get supported regions
   */
  getSupportedRegions(): string[] {
    return this.culturalService.getSupportedRegions();
  }

  // ============================================================================
  // VERNACULAR METHODS (delegated)
  // ============================================================================

  /**
   * Translate content to target language
   */
  async translate(request: VernacularTranslateRequest): Promise<TranslationResult> {
    return this.vernacularService.translate(request);
  }

  /**
   * Simple translation
   */
  async translateToLanguage(content: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<TranslationResult> {
    return this.vernacularService.translate({
      content,
      sourceLanguage,
      targetLanguage
    });
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageProfile[] {
    return this.vernacularService.getSupportedLanguages();
  }

  /**
   * Get language profile
   */
  getLanguageProfile(languageCode: string): LanguageProfile | null {
    return this.vernacularService.getLanguageProfile(languageCode);
  }

  /**
   * Batch translate to multiple languages
   */
  async batchTranslate(
    contents: string[],
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult[]> {
    return Promise.all(
      contents.map(content => 
        this.vernacularService.translate({
          content,
          sourceLanguage,
          targetLanguage
        })
      )
    );
  }
}

// Singleton export
export const localizationService = new LocalizationService();
