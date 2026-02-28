/**
 * Vernacular Support Service
 * 
 * Deep support for 9 Indian languages
 * - Native script rendering
 * - Cultural context adaptation
 * - Regional idioms and festivals
 * - Language-specific SEO
 * - Transliteration support
 */

export interface VernacularTranslateRequest {
  content: string;
  sourceLanguage: string; // ISO 639-1 code
  targetLanguage: string; // ISO 639-1 code
  contentType?: 'social' | 'blog' | 'video' | 'marketing';
  preserveFormatting?: boolean;
  includeTransliteration?: boolean; // Roman script version
  adaptCulturalReferences?: boolean;
}

export interface LanguageProfile {
  code: string; // ISO 639-1
  name: string;
  nativeName: string;
  script: string; // Devanagari, Bengali, Tamil, etc.
  direction: 'ltr' | 'rtl';
  regions: string[]; // States/regions where spoken
  speakers: number; // Millions
  festivals: string[];
  commonIdioms: string[];
  formalityLevels: string[]; // Casual, formal, respectful
  seoKeywords: string[]; // Common search terms
}

export interface TranslationResult {
  translationId: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalContent: string;
  translatedContent: string;
  transliteration?: string; // Roman script version
  culturalAdaptations: Array<{
    original: string;
    adapted: string;
    reason: string;
  }>;
  qualityScore: number; // 0-100
  readabilityScore: number; // 0-100
  seoOptimized: boolean;
  warnings: string[];
  suggestions: string[];
  translatedAt: string;
}

export class VernacularService {
  private translations: Map<string, TranslationResult>;
  private languageProfiles: Map<string, LanguageProfile>;

  constructor() {
    this.translations = new Map();
    this.languageProfiles = new Map();
    this.initializeLanguageProfiles();
  }

  // ============================================================================
  // MAIN TRANSLATION
  // ============================================================================

  /**
   * Translate content to target language with cultural adaptation
   */
  async translate(request: VernacularTranslateRequest): Promise<TranslationResult> {
    const sourceProfile = this.languageProfiles.get(request.sourceLanguage);
    const targetProfile = this.languageProfiles.get(request.targetLanguage);

    if (!sourceProfile || !targetProfile) {
      throw new Error(`Unsupported language: ${request.sourceLanguage} or ${request.targetLanguage}`);
    }

    // Translate content (in production, use AWS Translate or Google Translate API)
    const translatedContent = await this.translateText(
      request.content,
      request.sourceLanguage,
      request.targetLanguage
    );

    // Adapt cultural references if requested
    const culturalAdaptations = request.adaptCulturalReferences
      ? await this.adaptCulturalReferences(
          request.content,
          translatedContent,
          sourceProfile,
          targetProfile
        )
      : [];

    // Apply cultural adaptations
    let finalContent = translatedContent;
    culturalAdaptations.forEach(adaptation => {
      finalContent = finalContent.replace(adaptation.original, adaptation.adapted);
    });

    // Generate transliteration if requested
    const transliteration = request.includeTransliteration
      ? await this.generateTransliteration(finalContent, request.targetLanguage)
      : undefined;

    // Optimize for SEO
    const seoOptimized = await this.optimizeForSEO(finalContent, targetProfile);

    // Calculate quality scores
    const qualityScore = this.calculateQualityScore(finalContent, targetProfile);
    const readabilityScore = this.calculateReadabilityScore(finalContent, targetProfile);

    // Generate warnings and suggestions
    const warnings = this.generateWarnings(finalContent, targetProfile);
    const suggestions = this.generateSuggestions(finalContent, targetProfile);

    const result: TranslationResult = {
      translationId: this.generateId('translation'),
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      originalContent: request.content,
      translatedContent: seoOptimized,
      transliteration,
      culturalAdaptations,
      qualityScore,
      readabilityScore,
      seoOptimized: true,
      warnings,
      suggestions,
      translatedAt: new Date().toISOString(),
    };

    this.translations.set(result.translationId, result);
    return result;
  }

  // ============================================================================
  // TRANSLATION ENGINE
  // ============================================================================

  /**
   * Translate text using AI (AWS Translate or Google Translate)
   */
  private async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // In production, use AWS Translate API or Google Translate API
    // For now, return mock translation with language indicator

    // Mock translation (in production, this would be actual translation)
    const languageNames: Record<string, string> = {
      'en': 'English',
      'hi': 'हिंदी',
      'bn': 'বাংলা',
      'ta': 'தமிழ்',
      'te': 'తెలుగు',
      'mr': 'मराठी',
      'gu': 'ગુજરાતી',
      'kn': 'ಕನ್ನಡ',
      'ml': 'മലയാളം',
    };

    // For testing, prepend language indicator
    return `[${languageNames[targetLanguage] || targetLanguage}] ${text}`;
  }

  /**
   * Adapt cultural references for target language
   */
  private async adaptCulturalReferences(
    originalContent: string,
    translatedContent: string,
    sourceProfile: LanguageProfile,
    targetProfile: LanguageProfile
  ): Promise<Array<{ original: string; adapted: string; reason: string }>> {
    const adaptations: Array<{ original: string; adapted: string; reason: string }> = [];

    // Adapt festivals
    const festivalMappings: Record<string, Record<string, string>> = {
      'Thanksgiving': {
        'hi': 'दिवाली',
        'bn': 'দুর্গা পূজা',
        'ta': 'பொங்கல்',
        'te': 'సంక్రాంతి',
        'mr': 'गणेश चतुर्थी',
        'gu': 'નવરાત્રી',
        'kn': 'ದಸರಾ',
        'ml': 'ഓണം',
      },
      'Christmas': {
        'hi': 'दिवाली',
        'bn': 'দুর্গা পূজা',
        'ta': 'பொங்கல்',
        'te': 'సంక్రాంతి',
        'mr': 'गणेश चतुर्थी',
        'gu': 'નવરાત્રી',
        'kn': 'ದಸರಾ',
        'ml': 'ഓണം',
      },
    };

    // Check for festival references
    Object.entries(festivalMappings).forEach(([western, indian]) => {
      if (originalContent.includes(western) && indian[targetProfile.code]) {
        adaptations.push({
          original: western,
          adapted: indian[targetProfile.code],
          reason: `Adapted Western festival to regional equivalent`,
        });
      }
    });

    // Adapt currency
    if (originalContent.includes('$') || originalContent.includes('dollar')) {
      adaptations.push({
        original: '$',
        adapted: '₹',
        reason: 'Converted currency to Indian Rupees',
      });
    }

    // Adapt measurements
    if (originalContent.includes('miles')) {
      adaptations.push({
        original: 'miles',
        adapted: 'किलोमीटर',
        reason: 'Converted imperial to metric system',
      });
    }

    return adaptations;
  }

  /**
   * Generate transliteration (Roman script)
   */
  private async generateTransliteration(
    text: string,
    language: string
  ): Promise<string> {
    // In production, use transliteration library or API
    // For now, return mock transliteration

    const transliterationMap: Record<string, string> = {
      'hi': 'Namaste, yeh Hindi mein hai',
      'bn': 'Nomoshkar, ei Bangla te ache',
      'ta': 'Vanakkam, idhu Tamil il irukkiradhu',
      'te': 'Namaskaram, idi Telugu lo undi',
      'mr': 'Namaskar, he Marathi madhe aahe',
      'gu': 'Namaste, aa Gujarati ma chhe',
      'kn': 'Namaskara, idu Kannada dalli ide',
      'ml': 'Namaskaram, ithu Malayalam il aanu',
    };

    return transliterationMap[language] || text;
  }

  /**
   * Optimize content for SEO in target language
   */
  private async optimizeForSEO(
    content: string,
    targetProfile: LanguageProfile
  ): Promise<string> {
    // In production, use AI to optimize for language-specific SEO
    // For now, return content as-is

    // Add language-specific SEO keywords if needed
    return content;
  }

  // ============================================================================
  // QUALITY SCORING
  // ============================================================================

  /**
   * Calculate translation quality score
   */
  private calculateQualityScore(
    content: string,
    targetProfile: LanguageProfile
  ): number {
    let score = 100;

    // Check for proper script usage
    const hasNativeScript = this.hasNativeScript(content, targetProfile.script);
    if (!hasNativeScript) score -= 30;

    // Check for appropriate length
    if (content.length < 10) score -= 20;

    // Check for mixed scripts (usually indicates poor translation)
    const hasMixedScripts = this.hasMixedScripts(content);
    if (hasMixedScripts) score -= 15;

    // Check for proper formatting
    const hasProperFormatting = this.hasProperFormatting(content);
    if (!hasProperFormatting) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Calculate readability score
   */
  private calculateReadabilityScore(
    content: string,
    targetProfile: LanguageProfile
  ): number {
    let score = 100;

    // Check sentence length (shorter is more readable)
    const sentences = content.split(/[।.!?]+/);
    const avgSentenceLength = content.length / sentences.length;
    if (avgSentenceLength > 100) score -= 20;
    if (avgSentenceLength > 150) score -= 20;

    // Check for complex words (in production, use language-specific analysis)
    const words = content.split(/\s+/);
    const avgWordLength = content.length / words.length;
    if (avgWordLength > 8) score -= 15;

    // Check for proper punctuation
    const hasPunctuation = /[।.!?,;:]/.test(content);
    if (!hasPunctuation && content.length > 50) score -= 10;

    return Math.max(0, score);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Check if content uses native script
   */
  private hasNativeScript(content: string, script: string): boolean {
    const scriptRanges: Record<string, RegExp> = {
      'Devanagari': /[\u0900-\u097F]/,
      'Bengali': /[\u0980-\u09FF]/,
      'Tamil': /[\u0B80-\u0BFF]/,
      'Telugu': /[\u0C00-\u0C7F]/,
      'Gujarati': /[\u0A80-\u0AFF]/,
      'Kannada': /[\u0C80-\u0CFF]/,
      'Malayalam': /[\u0D00-\u0D7F]/,
      'Latin': /[A-Za-z]/,
    };

    const regex = scriptRanges[script];
    return regex ? regex.test(content) : true;
  }

  /**
   * Check for mixed scripts (indicates poor translation)
   */
  private hasMixedScripts(content: string): boolean {
    const hasDevanagari = /[\u0900-\u097F]/.test(content);
    const hasBengali = /[\u0980-\u09FF]/.test(content);
    const hasTamil = /[\u0B80-\u0BFF]/.test(content);
    const hasTelugu = /[\u0C00-\u0C7F]/.test(content);
    const hasLatin = /[A-Za-z]/.test(content);

    const scriptCount = [hasDevanagari, hasBengali, hasTamil, hasTelugu, hasLatin].filter(Boolean).length;
    return scriptCount > 2; // Allow some mixing (e.g., native + Latin for names)
  }

  /**
   * Check for proper formatting
   */
  private hasProperFormatting(content: string): boolean {
    // Check for proper spacing
    const hasProperSpacing = !/\s{2,}/.test(content);

    // Check for proper line breaks
    const hasProperLineBreaks = !/\n{3,}/.test(content);

    return hasProperSpacing && hasProperLineBreaks;
  }

  // ============================================================================
  // WARNINGS & SUGGESTIONS
  // ============================================================================

  /**
   * Generate warnings for translation
   */
  private generateWarnings(content: string, targetProfile: LanguageProfile): string[] {
    const warnings: string[] = [];

    // Check for mixed scripts
    if (this.hasMixedScripts(content)) {
      warnings.push('Mixed scripts detected - may indicate incomplete translation');
    }

    // Check for very short content
    if (content.length < 20) {
      warnings.push('Content is very short - may not be meaningful');
    }

    // Check for missing native script
    if (!this.hasNativeScript(content, targetProfile.script)) {
      warnings.push(`Content should use ${targetProfile.script} script for ${targetProfile.name}`);
    }

    // Check for excessive length
    if (content.length > 5000) {
      warnings.push('Content is very long - consider breaking into smaller sections');
    }

    return warnings;
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(content: string, targetProfile: LanguageProfile): string[] {
    const suggestions: string[] = [];

    // Suggest cultural adaptation
    suggestions.push(`Consider adapting content for ${targetProfile.regions.join(', ')} audience`);

    // Suggest SEO optimization
    suggestions.push(`Optimize for ${targetProfile.name} search terms: ${targetProfile.seoKeywords.slice(0, 3).join(', ')}`);

    // Suggest formality level
    suggestions.push(`Use ${targetProfile.formalityLevels[0]} tone for better engagement`);

    // Suggest regional festivals
    if (targetProfile.festivals.length > 0) {
      suggestions.push(`Reference local festivals: ${targetProfile.festivals.slice(0, 2).join(', ')}`);
    }

    return suggestions.slice(0, 5);
  }

  // ============================================================================
  // BATCH TRANSLATION
  // ============================================================================

  /**
   * Translate content to multiple languages
   */
  async translateToMultipleLanguages(
    content: string,
    sourceLanguage: string,
    targetLanguages: string[],
    options?: Partial<VernacularTranslateRequest>
  ): Promise<Record<string, TranslationResult>> {
    const results: Record<string, TranslationResult> = {};

    for (const targetLanguage of targetLanguages) {
      const result = await this.translate({
        content,
        sourceLanguage,
        targetLanguage,
        ...options,
      });
      results[targetLanguage] = result;
    }

    return results;
  }

  // ============================================================================
  // LANGUAGE PROFILES
  // ============================================================================

  /**
   * Initialize language profiles for 9 Indian languages + English
   */
  private initializeLanguageProfiles(): void {
    // English
    this.languageProfiles.set('en', {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      script: 'Latin',
      direction: 'ltr',
      regions: ['India', 'USA', 'UK', 'Global'],
      speakers: 1500,
      festivals: ['Christmas', 'New Year', 'Thanksgiving'],
      commonIdioms: ['Break a leg', 'Piece of cake', 'Hit the nail on the head'],
      formalityLevels: ['Casual', 'Professional', 'Formal'],
      seoKeywords: ['how to', 'best', 'top', 'guide', 'tutorial'],
    });

    // Hindi
    this.languageProfiles.set('hi', {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      script: 'Devanagari',
      direction: 'ltr',
      regions: ['Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar'],
      speakers: 600,
      festivals: ['दिवाली', 'होली', 'रक्षा बंधन', 'दशहरा'],
      commonIdioms: ['अंधों में काना राजा', 'नाच न जाने आंगन टेढ़ा'],
      formalityLevels: ['आम बोलचाल', 'औपचारिक', 'सम्मानजनक'],
      seoKeywords: ['कैसे', 'सबसे अच्छा', 'टॉप', 'गाइड', 'ट्यूटोरियल'],
    });

    // Bengali
    this.languageProfiles.set('bn', {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      script: 'Bengali',
      direction: 'ltr',
      regions: ['West Bengal', 'Tripura', 'Bangladesh'],
      speakers: 265,
      festivals: ['দুর্গা পূজা', 'পহেলা বৈশাখ', 'কালী পূজা'],
      commonIdioms: ['আকাশ কুসুম', 'ঘোড়ার ডিম'],
      formalityLevels: ['সাধারণ', 'আনুষ্ঠানিক', 'সম্মানজনক'],
      seoKeywords: ['কিভাবে', 'সেরা', 'শীর্ষ', 'গাইড', 'টিউটোরিয়াল'],
    });

    // Tamil
    this.languageProfiles.set('ta', {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      script: 'Tamil',
      direction: 'ltr',
      regions: ['Tamil Nadu', 'Puducherry', 'Sri Lanka'],
      speakers: 80,
      festivals: ['பொங்கல்', 'தீபாவளி', 'தமிழ் புத்தாண்டு'],
      commonIdioms: ['காக்கைக்கும் தன் குஞ்சு பொன் குஞ்சு', 'ஆடுகளம் பார்த்து ஆட வேண்டும்'],
      formalityLevels: ['பேச்சு வழக்கு', 'முறையான', 'மரியாதையான'],
      seoKeywords: ['எப்படி', 'சிறந்த', 'முதல்', 'வழிகாட்டி', 'பயிற்சி'],
    });

    // Telugu
    this.languageProfiles.set('te', {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      script: 'Telugu',
      direction: 'ltr',
      regions: ['Andhra Pradesh', 'Telangana'],
      speakers: 95,
      festivals: ['సంక్రాంతి', 'దీపావళి', 'ఉగాది'],
      commonIdioms: ['కాకికి తన పిల్ల బంగారు పిల్ల', 'ఆడే మైదానం చూసి ఆడాలి'],
      formalityLevels: ['సాధారణ', 'అధికారిక', 'గౌరవప్రదమైన'],
      seoKeywords: ['ఎలా', 'ఉత్తమ', 'టాప్', 'గైడ్', 'ట్యుటోరియల్'],
    });

    // Marathi
    this.languageProfiles.set('mr', {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      script: 'Devanagari',
      direction: 'ltr',
      regions: ['Maharashtra', 'Goa'],
      speakers: 95,
      festivals: ['गणेश चतुर्थी', 'दिवाळी', 'गुढी पाडवा'],
      commonIdioms: ['अंधळ्याला काय पहाजे', 'नाचता येत नाही आंगण वाकडे'],
      formalityLevels: ['सामान्य', 'औपचारिक', 'आदरयुक्त'],
      seoKeywords: ['कसे', 'सर्वोत्तम', 'टॉप', 'मार्गदर्शक', 'ट्यूटोरियल'],
    });

    // Gujarati
    this.languageProfiles.set('gu', {
      code: 'gu',
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      script: 'Gujarati',
      direction: 'ltr',
      regions: ['Gujarat', 'Dadra and Nagar Haveli'],
      speakers: 60,
      festivals: ['નવરાત્રી', 'દિવાળી', 'ઉત્તરાયણ'],
      commonIdioms: ['અંધ માણસને શું જોઈએ', 'નાચતાં નથી આવડતું આંગણું વાંકું'],
      formalityLevels: ['સામાન્ય', 'ઔપચારિક', 'આદરણીય'],
      seoKeywords: ['કેવી રીતે', 'શ્રેષ્ઠ', 'ટોચનું', 'માર્ગદર્શિકા', 'ટ્યુટોરિયલ'],
    });

    // Kannada
    this.languageProfiles.set('kn', {
      code: 'kn',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      script: 'Kannada',
      direction: 'ltr',
      regions: ['Karnataka'],
      speakers: 50,
      festivals: ['ದಸರಾ', 'ದೀಪಾವಳಿ', 'ಉಗಾದಿ'],
      commonIdioms: ['ಕಾಗೆಗೆ ತನ್ನ ಮರಿ ಚಿನ್ನದ ಮರಿ', 'ಆಡುವ ಮೈದಾನ ನೋಡಿ ಆಡಬೇಕು'],
      formalityLevels: ['ಸಾಮಾನ್ಯ', 'ಔಪಚಾರಿಕ', 'ಗೌರವಾನ್ವಿತ'],
      seoKeywords: ['ಹೇಗೆ', 'ಅತ್ಯುತ್ತಮ', 'ಟಾಪ್', 'ಮಾರ್ಗದರ್ಶಿ', 'ಟ್ಯುಟೋರಿಯಲ್'],
    });

    // Malayalam
    this.languageProfiles.set('ml', {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      script: 'Malayalam',
      direction: 'ltr',
      regions: ['Kerala', 'Lakshadweep'],
      speakers: 38,
      festivals: ['ഓണം', 'വിഷു', 'ദീപാവലി'],
      commonIdioms: ['കാക്കയ്ക്ക് തന്റെ കുഞ്ഞ് പൊൻകുഞ്ഞ്', 'കളിക്കളം നോക്കി കളിക്കണം'],
      formalityLevels: ['സാധാരണ', 'ഔപചാരിക', 'ആദരവുള്ള'],
      seoKeywords: ['എങ്ങനെ', 'മികച്ച', 'ടോപ്പ്', 'ഗൈഡ്', 'ട്യൂട്ടോറിയൽ'],
    });
  }

  // ============================================================================
  // RETRIEVAL METHODS
  // ============================================================================

  /**
   * Get translation by ID
   */
  getTranslation(translationId: string): TranslationResult | null {
    return this.translations.get(translationId) || null;
  }

  /**
   * Get language profile
   */
  getLanguageProfile(languageCode: string): LanguageProfile | null {
    return this.languageProfiles.get(languageCode) || null;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageProfile[] {
    return Array.from(this.languageProfiles.values());
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.languageProfiles.has(languageCode);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const vernacularService = new VernacularService();
