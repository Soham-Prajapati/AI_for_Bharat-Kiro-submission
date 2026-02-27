/**
 * DNA Analysis Service
 * Analyzes creator's past content to build comprehensive personality profile
 */

import { GitHubModelsService } from './github-models.service';

export interface DNAAnalysisRequest {
  userId: string;
  videoIds: string[];
}

export interface DNAProfile {
  personality: string;
  topics: string[];
  tone: string;
  vocabularyLevel: string;
  archetype: string;
  confidence: number;
  traits: string[];
  dimensions: {
    energy: number;
    formality: number;
    humor: number;
    technicalDepth: number;
    storytelling: number;
  };
}

export interface DNAAnalysisResponse {
  success: boolean;
  userId: string;
  videoCount: number;
  profile: DNAProfile;
  analyzedAt: Date;
}

interface VideoContent {
  videoId: string;
  transcript: string;
  metadata?: {
    title?: string;
    duration?: number;
    views?: number;
  };
}

export class DNAAnalysisService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  /**
   * Analyze creator's content to build personality profile
   */
  async analyzeCreatorDNA(request: DNAAnalysisRequest): Promise<DNAAnalysisResponse> {
    const { userId, videoIds } = request;

    // Step 1: Fetch video content (transcripts)
    const videoContent = await this.fetchVideoContent(videoIds);

    // Step 2: Analyze each video individually
    const individualAnalyses = await Promise.all(
      videoContent.map(video => this.analyzeIndividualVideo(video))
    );

    // Step 3: Aggregate analyses to build comprehensive profile
    const profile = await this.aggregateAnalyses(individualAnalyses);

    return {
      success: true,
      userId,
      videoCount: videoIds.length,
      profile,
      analyzedAt: new Date()
    };
  }

  /**
   * Fetch video content (transcripts) for analysis
   * In production, this would fetch from database or S3
   */
  private async fetchVideoContent(videoIds: string[]): Promise<VideoContent[]> {
    // TODO: Replace with actual database/S3 fetch
    // For now, return mock data structure
    return videoIds.map(videoId => ({
      videoId,
      transcript: `[Transcript for ${videoId} would be fetched from database]`,
      metadata: {
        title: `Video ${videoId}`,
        duration: 600,
        views: 10000
      }
    }));
  }

  /**
   * Analyze individual video to extract personality signals
   */
  private async analyzeIndividualVideo(video: VideoContent): Promise<any> {
    const prompt = `You are an expert content analyst specializing in creator personality profiling.

TASK: Analyze this video transcript to extract personality signals.

VIDEO ID: ${video.videoId}
TRANSCRIPT: ${video.transcript}

OUTPUT FORMAT (JSON):
{
  "personality_signals": {
    "energy_level": 0.0-1.0,
    "formality_level": 0.0-1.0,
    "humor_usage": 0.0-1.0,
    "technical_depth": 0.0-1.0,
    "storytelling_ability": 0.0-1.0
  },
  "tone_indicators": ["casual" | "formal" | "professional" | "friendly" | "authoritative"],
  "vocabulary_complexity": "beginner" | "intermediate" | "advanced",
  "topics_discussed": ["topic1", "topic2", "topic3"],
  "personality_traits": ["trait1", "trait2", "trait3"],
  "archetype_signals": {
    "educator": 0.0-1.0,
    "entertainer": 0.0-1.0,
    "reviewer": 0.0-1.0,
    "storyteller": 0.0-1.0,
    "analyst": 0.0-1.0
  }
}

ANALYSIS CRITERIA:

Energy Level (0-1):
- 0.0-0.3: Calm, measured, slow-paced
- 0.4-0.6: Moderate energy, balanced
- 0.7-1.0: High energy, fast-paced, enthusiastic

Formality Level (0-1):
- 0.0-0.3: Very casual, slang, contractions
- 0.4-0.6: Conversational, balanced
- 0.7-1.0: Formal, professional, structured

Humor Usage (0-1):
- 0.0-0.3: Serious, minimal jokes
- 0.4-0.6: Occasional humor
- 0.7-1.0: Frequent jokes, entertaining

Technical Depth (0-1):
- 0.0-0.3: Simple, beginner-friendly
- 0.4-0.6: Moderate complexity
- 0.7-1.0: Advanced, technical, detailed

Storytelling (0-1):
- 0.0-0.3: Factual, list-based
- 0.4-0.6: Some narrative elements
- 0.7-1.0: Strong narrative, engaging stories

Archetypes:
- Educator: Teaches, explains, breaks down concepts
- Entertainer: Focuses on entertainment, humor, engagement
- Reviewer: Analyzes, critiques, compares
- Storyteller: Narrative-driven, personal stories
- Analyst: Data-driven, research-focused, objective

Generate the analysis in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1000
      });

      return JSON.parse(response);
    } catch (error) {
      console.error(`Failed to analyze video ${video.videoId}:`, error);
      // Return default analysis on error
      return {
        personality_signals: {
          energy_level: 0.5,
          formality_level: 0.5,
          humor_usage: 0.5,
          technical_depth: 0.5,
          storytelling_ability: 0.5
        },
        tone_indicators: ['casual'],
        vocabulary_complexity: 'intermediate',
        topics_discussed: [],
        personality_traits: [],
        archetype_signals: {
          educator: 0.5,
          entertainer: 0.2,
          reviewer: 0.2,
          storyteller: 0.05,
          analyst: 0.05
        }
      };
    }
  }

  /**
   * Aggregate individual analyses into comprehensive profile
   */
  private async aggregateAnalyses(analyses: Array<{
    personality_signals: {
      energy_level: number;
      formality_level: number;
      humor_usage: number;
      technical_depth: number;
      storytelling_ability: number;
    };
    tone_indicators: string[];
    vocabulary_complexity: string;
    topics_discussed: string[];
    personality_traits: string[];
    archetype_signals: {
      educator: number;
      entertainer: number;
      reviewer: number;
      storyteller: number;
      analyst: number;
    };
  }>): Promise<DNAProfile> {
    // Calculate average dimensions
    const dimensions = {
      energy: this.average(analyses.map(a => a.personality_signals.energy_level)),
      formality: this.average(analyses.map(a => a.personality_signals.formality_level)),
      humor: this.average(analyses.map(a => a.personality_signals.humor_usage)),
      technicalDepth: this.average(analyses.map(a => a.personality_signals.technical_depth)),
      storytelling: this.average(analyses.map(a => a.personality_signals.storytelling_ability))
    };

    // Determine dominant archetype
    const archetypeScores = {
      educator: this.average(analyses.map(a => a.archetype_signals.educator)),
      entertainer: this.average(analyses.map(a => a.archetype_signals.entertainer)),
      reviewer: this.average(analyses.map(a => a.archetype_signals.reviewer)),
      storyteller: this.average(analyses.map(a => a.archetype_signals.storyteller)),
      analyst: this.average(analyses.map(a => a.archetype_signals.analyst))
    };

    const archetype = Object.entries(archetypeScores).reduce((a, b) => 
      archetypeScores[a[0] as keyof typeof archetypeScores] > archetypeScores[b[0] as keyof typeof archetypeScores] ? a : b
    )[0];

    const confidence = Math.max(...Object.values(archetypeScores));

    // Aggregate topics (unique)
    const allTopics = analyses.flatMap(a => a.topics_discussed);
    const topics = [...new Set(allTopics)].slice(0, 5); // Top 5 unique topics

    // Aggregate traits (most common)
    const allTraits = analyses.flatMap(a => a.personality_traits);
    const traitCounts = allTraits.reduce((acc, trait) => {
      acc[trait] = (acc[trait] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const traits = Object.entries(traitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([trait]) => trait);

    // Determine overall tone (most common)
    const allTones = analyses.flatMap(a => a.tone_indicators);
    const toneCounts = allTones.reduce((acc, tone) => {
      acc[tone] = (acc[tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const tone = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'casual';

    // Determine vocabulary level (most common)
    const vocabularyLevels = analyses.map(a => a.vocabulary_complexity);
    const vocabCounts = vocabularyLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const vocabularyLevel = Object.entries(vocabCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'intermediate';

    // Determine overall personality descriptor
    const personality = this.determinePersonality(dimensions);

    return {
      personality,
      topics,
      tone,
      vocabularyLevel,
      archetype,
      confidence: Math.round(confidence * 100) / 100,
      traits,
      dimensions: {
        energy: Math.round(dimensions.energy * 100) / 100,
        formality: Math.round(dimensions.formality * 100) / 100,
        humor: Math.round(dimensions.humor * 100) / 100,
        technicalDepth: Math.round(dimensions.technicalDepth * 100) / 100,
        storytelling: Math.round(dimensions.storytelling * 100) / 100
      }
    };
  }

  /**
   * Determine overall personality descriptor from dimensions
   * Enhanced algorithm with weighted scoring and clustering
   */
  private determinePersonality(dimensions: {
    energy: number;
    formality: number;
    humor: number;
    technicalDepth: number;
    storytelling: number;
  }): string {
    const { energy, formality, humor, technicalDepth, storytelling } = dimensions;

    // Calculate weighted personality scores for each type
    const personalityScores = {
      energetic: this.calculateEnergeticScore(energy, formality, humor),
      analytical: this.calculateAnalyticalScore(energy, formality, technicalDepth),
      engaging: this.calculateEngagingScore(storytelling, energy, humor),
      professional: this.calculateProfessionalScore(formality, technicalDepth),
      entertaining: this.calculateEntertainingScore(humor, energy),
      thoughtful: this.calculateThoughtfulScore(energy, storytelling, technicalDepth),
      balanced: this.calculateBalancedScore(dimensions)
    };

    // Return personality type with highest score
    return Object.entries(personalityScores).reduce((a, b) => 
      personalityScores[a[0] as keyof typeof personalityScores] > personalityScores[b[0] as keyof typeof personalityScores] ? a : b
    )[0];
  }

  /**
   * Calculate energetic personality score
   * High energy + low formality + high humor
   */
  private calculateEnergeticScore(energy: number, formality: number, humor: number): number {
    return (energy * 0.4) + ((1 - formality) * 0.3) + (humor * 0.3);
  }

  /**
   * Calculate analytical personality score
   * Low energy + high formality + high technical depth
   */
  private calculateAnalyticalScore(energy: number, formality: number, technicalDepth: number): number {
    return ((1 - energy) * 0.3) + (formality * 0.3) + (technicalDepth * 0.4);
  }

  /**
   * Calculate engaging personality score
   * High storytelling + moderate energy + moderate humor
   */
  private calculateEngagingScore(storytelling: number, energy: number, humor: number): number {
    const moderateEnergy = 1 - Math.abs(energy - 0.6);
    const moderateHumor = 1 - Math.abs(humor - 0.6);
    return (storytelling * 0.5) + (moderateEnergy * 0.25) + (moderateHumor * 0.25);
  }

  /**
   * Calculate professional personality score
   * High formality + high technical depth
   */
  private calculateProfessionalScore(formality: number, technicalDepth: number): number {
    return (formality * 0.5) + (technicalDepth * 0.5);
  }

  /**
   * Calculate entertaining personality score
   * High humor + high energy
   */
  private calculateEntertainingScore(humor: number, energy: number): number {
    return (humor * 0.6) + (energy * 0.4);
  }

  /**
   * Calculate thoughtful personality score
   * Low energy + high storytelling + moderate technical depth
   */
  private calculateThoughtfulScore(energy: number, storytelling: number, technicalDepth: number): number {
    const moderateTechnical = 1 - Math.abs(technicalDepth - 0.5);
    return ((1 - energy) * 0.3) + (storytelling * 0.4) + (moderateTechnical * 0.3);
  }

  /**
   * Calculate balanced personality score
   * All dimensions near 0.5 (middle)
   */
  private calculateBalancedScore(dimensions: {
    energy: number;
    formality: number;
    humor: number;
    technicalDepth: number;
    storytelling: number;
  }): number {
    const deviations = Object.values(dimensions).map(val => Math.abs(val - 0.5));
    const avgDeviation = this.average(deviations);
    return 1 - avgDeviation; // Lower deviation = more balanced
  }

  /**
   * Classify creator into archetype using clustering
   * Enhanced algorithm with trait-based classification
   */
  classifyArchetype(
    dimensions: DNAProfile['dimensions'],
    traits: string[],
    topics: string[]
  ): {
    archetype: string;
    confidence: number;
    reasoning: string[];
  } {
    const { energy, formality, humor, technicalDepth, storytelling } = dimensions;

    // Calculate archetype scores
    const archetypeScores = {
      educator: this.calculateEducatorScore(technicalDepth, formality, storytelling, traits),
      entertainer: this.calculateEntertainerScore(humor, energy, storytelling, traits),
      reviewer: this.calculateReviewerScore(technicalDepth, formality, traits, topics),
      storyteller: this.calculateStorytellerScore(storytelling, energy, humor, traits),
      analyst: this.calculateAnalystScore(technicalDepth, formality, energy, traits)
    };

    // Find dominant archetype
    const sortedArchetypes = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]);
    const dominantArchetype = sortedArchetypes[0][0];
    const confidence = sortedArchetypes[0][1];

    // Generate reasoning
    const reasoning = this.generateArchetypeReasoning(dominantArchetype, dimensions, traits);

    return {
      archetype: dominantArchetype,
      confidence: Math.round(confidence * 100) / 100,
      reasoning
    };
  }

  /**
   * Calculate educator archetype score
   * Teaches, explains, breaks down concepts
   */
  private calculateEducatorScore(
    technicalDepth: number,
    formality: number,
    storytelling: number,
    traits: string[]
  ): number {
    let score = (technicalDepth * 0.4) + (formality * 0.2) + (storytelling * 0.2);
    
    // Boost for educator traits
    const educatorTraits = ['clear', 'structured', 'patient', 'informative', 'helpful'];
    const matchingTraits = traits.filter(t => educatorTraits.includes(t.toLowerCase()));
    score += matchingTraits.length * 0.04;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate entertainer archetype score
   * Focuses on entertainment, humor, engagement
   */
  private calculateEntertainerScore(
    humor: number,
    energy: number,
    storytelling: number,
    traits: string[]
  ): number {
    let score = (humor * 0.5) + (energy * 0.3) + (storytelling * 0.2);
    
    // Boost for entertainer traits
    const entertainerTraits = ['funny', 'energetic', 'charismatic', 'engaging', 'entertaining'];
    const matchingTraits = traits.filter(t => entertainerTraits.includes(t.toLowerCase()));
    score += matchingTraits.length * 0.04;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate reviewer archetype score
   * Analyzes, critiques, compares
   */
  private calculateReviewerScore(
    technicalDepth: number,
    formality: number,
    traits: string[],
    topics: string[]
  ): number {
    let score = (technicalDepth * 0.4) + (formality * 0.3);
    
    // Boost for reviewer traits
    const reviewerTraits = ['critical', 'detailed', 'objective', 'thorough', 'analytical'];
    const matchingTraits = traits.filter(t => reviewerTraits.includes(t.toLowerCase()));
    score += matchingTraits.length * 0.04;

    // Boost for review-related topics
    const reviewTopics = ['review', 'comparison', 'analysis', 'critique'];
    const matchingTopics = topics.filter(t => reviewTopics.some(rt => t.toLowerCase().includes(rt)));
    score += matchingTopics.length * 0.03;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate storyteller archetype score
   * Narrative-driven, personal stories
   */
  private calculateStorytellerScore(
    storytelling: number,
    energy: number,
    humor: number,
    traits: string[]
  ): number {
    let score = (storytelling * 0.6) + (energy * 0.2) + (humor * 0.2);
    
    // Boost for storyteller traits
    const storytellerTraits = ['creative', 'expressive', 'emotional', 'personal', 'narrative'];
    const matchingTraits = traits.filter(t => storytellerTraits.includes(t.toLowerCase()));
    score += matchingTraits.length * 0.04;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate analyst archetype score
   * Data-driven, research-focused, objective
   */
  private calculateAnalystScore(
    technicalDepth: number,
    formality: number,
    energy: number,
    traits: string[]
  ): number {
    let score = (technicalDepth * 0.5) + (formality * 0.3) + ((1 - energy) * 0.2);
    
    // Boost for analyst traits
    const analystTraits = ['logical', 'methodical', 'data-driven', 'objective', 'research-focused'];
    const matchingTraits = traits.filter(t => analystTraits.includes(t.toLowerCase()));
    score += matchingTraits.length * 0.04;

    return Math.min(score, 1.0);
  }

  /**
   * Generate reasoning for archetype classification
   */
  private generateArchetypeReasoning(
    archetype: string,
    dimensions: DNAProfile['dimensions'],
    traits: string[]
  ): string[] {
    const reasoning: string[] = [];

    switch (archetype) {
      case 'educator':
        if (dimensions.technicalDepth > 0.6) reasoning.push('High technical depth indicates teaching ability');
        if (dimensions.formality > 0.5) reasoning.push('Structured, formal communication style');
        if (traits.some(t => ['clear', 'patient'].includes(t.toLowerCase()))) {
          reasoning.push('Clear and patient communication traits');
        }
        break;

      case 'entertainer':
        if (dimensions.humor > 0.6) reasoning.push('High humor usage for entertainment');
        if (dimensions.energy > 0.6) reasoning.push('High energy level keeps audience engaged');
        if (traits.some(t => ['funny', 'charismatic'].includes(t.toLowerCase()))) {
          reasoning.push('Charismatic and entertaining personality');
        }
        break;

      case 'reviewer':
        if (dimensions.technicalDepth > 0.6) reasoning.push('Detailed technical analysis');
        if (dimensions.formality > 0.5) reasoning.push('Objective, structured approach');
        if (traits.some(t => ['critical', 'thorough'].includes(t.toLowerCase()))) {
          reasoning.push('Critical and thorough evaluation style');
        }
        break;

      case 'storyteller':
        if (dimensions.storytelling > 0.7) reasoning.push('Strong narrative and storytelling ability');
        if (dimensions.energy > 0.5) reasoning.push('Engaging delivery style');
        if (traits.some(t => ['creative', 'expressive'].includes(t.toLowerCase()))) {
          reasoning.push('Creative and expressive communication');
        }
        break;

      case 'analyst':
        if (dimensions.technicalDepth > 0.7) reasoning.push('Deep technical and analytical focus');
        if (dimensions.formality > 0.6) reasoning.push('Formal, data-driven approach');
        if (traits.some(t => ['logical', 'methodical'].includes(t.toLowerCase()))) {
          reasoning.push('Logical and methodical analysis');
        }
        break;
    }

    return reasoning;
  }

  /**
   * Calculate average of array of numbers
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Compare two creator profiles
   * Future enhancement for comparing creators
   */
  async compareProfiles(profile1: DNAProfile, profile2: DNAProfile): Promise<{
    similarity: number;
    differences: string[];
    commonalities: string[];
  }> {
    // Calculate similarity score based on dimensions
    const dimensionKeys = Object.keys(profile1.dimensions) as Array<keyof typeof profile1.dimensions>;
    const dimensionDifferences = dimensionKeys.map(key => 
      Math.abs(profile1.dimensions[key] - profile2.dimensions[key])
    );
    const avgDifference = this.average(dimensionDifferences);
    const similarity = 1 - avgDifference;

    // Find differences
    const differences: string[] = [];
    if (profile1.archetype !== profile2.archetype) {
      differences.push(`Different archetypes: ${profile1.archetype} vs ${profile2.archetype}`);
    }
    if (profile1.tone !== profile2.tone) {
      differences.push(`Different tones: ${profile1.tone} vs ${profile2.tone}`);
    }

    // Find commonalities
    const commonalities: string[] = [];
    const commonTopics = profile1.topics.filter(t => profile2.topics.includes(t));
    if (commonTopics.length > 0) {
      commonalities.push(`Common topics: ${commonTopics.join(', ')}`);
    }
    const commonTraits = profile1.traits.filter(t => profile2.traits.includes(t));
    if (commonTraits.length > 0) {
      commonalities.push(`Common traits: ${commonTraits.join(', ')}`);
    }

    return {
      similarity: Math.round(similarity * 100) / 100,
      differences,
      commonalities
    };
  }
}
