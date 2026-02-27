import { useCallback } from 'react';
import { useAppContext, ContentItem } from '@/context/AppContext';
import apiClient from '@/services/api';

export function useContentGeneration() {
  const { state, actions } = useAppContext();

  const generateContent = useCallback(async (params: {
    fileId: string;
    platforms: string[];
    language: string;
    creatorMode: string;
  }) => {
    try {
      actions.setGenerationStatus({
        isGenerating: true,
        progress: 0,
        message: 'Starting content generation...',
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const currentProgress = state.content.generationStatus?.progress || 0;
        if (currentProgress < 90) {
          actions.setGenerationStatus({
            isGenerating: true,
            progress: currentProgress + 10,
            message: 'Generating content...',
          });
        }
      }, 1000);

      const response = await apiClient.generate.create({
        jobId: params.fileId,
        platforms: params.platforms,
        language: params.language as any,
        creatorMode: params.creatorMode as any,
      });

      clearInterval(progressInterval);

      // Create content item from response
      const contentItem: ContentItem = {
        id: response.generationId,
        title: `Generated Content - ${new Date().toLocaleDateString()}`,
        type: 'social',
        content: JSON.stringify(response.results),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          platforms: params.platforms,
          language: params.language,
          creatorMode: params.creatorMode,
          qualityScore: response.qualityScore,
        },
      };

      actions.addContentItem(contentItem);
      actions.setGenerationStatus({
        isGenerating: false,
        progress: 100,
        message: 'Content generated successfully!',
      });

      // Clear status after 2 seconds
      setTimeout(() => {
        actions.setGenerationStatus(null);
      }, 2000);

      return { success: true, contentItem };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      actions.setError(message);
      actions.setGenerationStatus(null);
      return { success: false, error: message };
    }
  }, [state.content.generationStatus, actions]);

  const loadContent = useCallback(async (generationId: string) => {
    try {
      actions.setLoading(true);
      const response = await apiClient.generate.get(generationId);
      
      const contentItem: ContentItem = {
        id: response.generationId,
        title: `Generated Content - ${new Date().toLocaleDateString()}`,
        type: 'social',
        content: JSON.stringify(response.results),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          qualityScore: response.qualityScore,
        },
      };
      
      actions.addContentItem(contentItem);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load content';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const deleteContent = useCallback(async (id: string) => {
    try {
      actions.deleteContentItem(id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete content';
      actions.setError(message);
      return { success: false, error: message };
    }
  }, [actions]);

  return {
    items: state.content.items,
    currentItem: state.content.currentItem,
    generationStatus: state.content.generationStatus,
    loading: state.loading,
    error: state.error,
    generateContent,
    loadContent,
    deleteContent,
    setCurrentItem: actions.setCurrentItem,
  };
}
