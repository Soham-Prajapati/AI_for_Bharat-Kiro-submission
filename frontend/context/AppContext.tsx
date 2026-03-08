'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  domain?: string;
  audienceType?: string;
  creatorMode?: string;
  onboardingComplete?: boolean;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    autoSave: boolean;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'social' | 'email' | 'ad';
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface GenerationStatus {
  isGenerating: boolean;
  progress: number;
  message: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface AppState {
  user: User | null;
  content: {
    items: ContentItem[];
    currentItem: ContentItem | null;
    generationStatus: GenerationStatus | null;
  };
  settings: Settings;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Action Types
// ============================================================================

export enum ActionType {
  SET_USER = 'SET_USER',
  LOGOUT_USER = 'LOGOUT_USER',
  SET_CONTENT_ITEMS = 'SET_CONTENT_ITEMS',
  ADD_CONTENT_ITEM = 'ADD_CONTENT_ITEM',
  UPDATE_CONTENT_ITEM = 'UPDATE_CONTENT_ITEM',
  DELETE_CONTENT_ITEM = 'DELETE_CONTENT_ITEM',
  SET_CURRENT_ITEM = 'SET_CURRENT_ITEM',
  SET_GENERATION_STATUS = 'SET_GENERATION_STATUS',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

export type AppAction =
  | { type: ActionType.SET_USER; payload: User }
  | { type: ActionType.LOGOUT_USER }
  | { type: ActionType.SET_CONTENT_ITEMS; payload: ContentItem[] }
  | { type: ActionType.ADD_CONTENT_ITEM; payload: ContentItem }
  | { type: ActionType.UPDATE_CONTENT_ITEM; payload: { id: string; updates: Partial<ContentItem> } }
  | { type: ActionType.DELETE_CONTENT_ITEM; payload: string }
  | { type: ActionType.SET_CURRENT_ITEM; payload: ContentItem | null }
  | { type: ActionType.SET_GENERATION_STATUS; payload: GenerationStatus | null }
  | { type: ActionType.UPDATE_SETTINGS; payload: Partial<Settings> }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string }
  | { type: ActionType.CLEAR_ERROR };

// ============================================================================
// Initial State
// ============================================================================

const initialSettings: Settings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
};

const initialState: AppState = {
  user: null,
  content: {
    items: [],
    currentItem: null,
    generationStatus: null,
  },
  settings: initialSettings,
  loading: false,
  error: null,
};

// ============================================================================
// Reducer
// ============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case ActionType.SET_USER:
      return {
        ...state,
        user: action.payload,
        error: null,
      };

    case ActionType.LOGOUT_USER:
      return {
        ...state,
        user: null,
        content: {
          items: [],
          currentItem: null,
          generationStatus: null,
        },
      };

    case ActionType.SET_CONTENT_ITEMS:
      return {
        ...state,
        content: {
          ...state.content,
          items: action.payload,
        },
        error: null,
      };

    case ActionType.ADD_CONTENT_ITEM:
      return {
        ...state,
        content: {
          ...state.content,
          items: [action.payload, ...state.content.items],
        },
        error: null,
      };

    case ActionType.UPDATE_CONTENT_ITEM: {
      const { id, updates } = action.payload;
      return {
        ...state,
        content: {
          ...state.content,
          items: state.content.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          ),
          currentItem:
            state.content.currentItem?.id === id
              ? { ...state.content.currentItem, ...updates, updatedAt: new Date().toISOString() }
              : state.content.currentItem,
        },
        error: null,
      };
    }

    case ActionType.DELETE_CONTENT_ITEM:
      return {
        ...state,
        content: {
          ...state.content,
          items: state.content.items.filter((item) => item.id !== action.payload),
          currentItem:
            state.content.currentItem?.id === action.payload ? null : state.content.currentItem,
        },
        error: null,
      };

    case ActionType.SET_CURRENT_ITEM:
      return {
        ...state,
        content: {
          ...state.content,
          currentItem: action.payload,
        },
      };

    case ActionType.SET_GENERATION_STATUS:
      return {
        ...state,
        content: {
          ...state.content,
          generationStatus: action.payload,
        },
      };

    case ActionType.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
          notifications: {
            ...state.settings.notifications,
            ...(action.payload.notifications || {}),
          },
        },
        error: null,
      };

    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setUser: (user: User) => void;
    logoutUser: () => void;
    setContentItems: (items: ContentItem[]) => void;
    addContentItem: (item: ContentItem) => void;
    updateContentItem: (id: string, updates: Partial<ContentItem>) => void;
    deleteContentItem: (id: string) => void;
    setCurrentItem: (item: ContentItem | null) => void;
    setGenerationStatus: (status: GenerationStatus | null) => void;
    updateSettings: (settings: Partial<Settings>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
    clearError: () => void;
  };
  hydrated: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================================
// Action Creators
// ============================================================================

export const actionCreators = {
  setUser: (user: User): AppAction => ({
    type: ActionType.SET_USER,
    payload: user,
  }),

  logoutUser: (): AppAction => ({
    type: ActionType.LOGOUT_USER,
  }),

  setContentItems: (items: ContentItem[]): AppAction => ({
    type: ActionType.SET_CONTENT_ITEMS,
    payload: items,
  }),

  addContentItem: (item: ContentItem): AppAction => ({
    type: ActionType.ADD_CONTENT_ITEM,
    payload: item,
  }),

  updateContentItem: (id: string, updates: Partial<ContentItem>): AppAction => ({
    type: ActionType.UPDATE_CONTENT_ITEM,
    payload: { id, updates },
  }),

  deleteContentItem: (id: string): AppAction => ({
    type: ActionType.DELETE_CONTENT_ITEM,
    payload: id,
  }),

  setCurrentItem: (item: ContentItem | null): AppAction => ({
    type: ActionType.SET_CURRENT_ITEM,
    payload: item,
  }),

  setGenerationStatus: (status: GenerationStatus | null): AppAction => ({
    type: ActionType.SET_GENERATION_STATUS,
    payload: status,
  }),

  updateSettings: (settings: Partial<Settings>): AppAction => ({
    type: ActionType.UPDATE_SETTINGS,
    payload: settings,
  }),

  setLoading: (loading: boolean): AppAction => ({
    type: ActionType.SET_LOADING,
    payload: loading,
  }),

  setError: (error: string): AppAction => ({
    type: ActionType.SET_ERROR,
    payload: error,
  }),

  clearError: (): AppAction => ({
    type: ActionType.CLEAR_ERROR,
  }),
};

// ============================================================================
// LocalStorage Utilities
// ============================================================================

const STORAGE_KEYS = {
  USER: 'app_user',
  SETTINGS: 'app_settings',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// ============================================================================
// Provider Component
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [hydrated, setHydrated] = React.useState(false);

  // Always start with empty state (works on both server and client)
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    user: null,
    settings: initialSettings,
  });

  // On first client render: restore from localStorage and mark hydrated
  useEffect(() => {
    const persistedUser = loadFromStorage<User | null>(STORAGE_KEYS.USER, null);
    const persistedSettings = loadFromStorage<Settings>(STORAGE_KEYS.SETTINGS, initialSettings);
    if (persistedUser) {
      dispatch({ type: ActionType.SET_USER, payload: persistedUser });
    }
    dispatch({ type: ActionType.UPDATE_SETTINGS, payload: persistedSettings });
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (state.user) {
      saveToStorage(STORAGE_KEYS.USER, state.user);
    } else {
      removeFromStorage(STORAGE_KEYS.USER);
    }
  }, [state.user, hydrated]);

  // Persist settings to localStorage
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
  }, [state.settings, hydrated]);

  // Dispatch-bound actions (so consumers don't need to call dispatch manually)
  const boundActions = React.useMemo(() => ({
    setUser: (user: User) => dispatch({ type: ActionType.SET_USER, payload: user }),
    logoutUser: () => dispatch({ type: ActionType.LOGOUT_USER }),
    setContentItems: (items: ContentItem[]) => dispatch({ type: ActionType.SET_CONTENT_ITEMS, payload: items }),
    addContentItem: (item: ContentItem) => dispatch({ type: ActionType.ADD_CONTENT_ITEM, payload: item }),
    updateContentItem: (id: string, updates: Partial<ContentItem>) => dispatch({ type: ActionType.UPDATE_CONTENT_ITEM, payload: { id, updates } }),
    deleteContentItem: (id: string) => dispatch({ type: ActionType.DELETE_CONTENT_ITEM, payload: id }),
    setCurrentItem: (item: ContentItem | null) => dispatch({ type: ActionType.SET_CURRENT_ITEM, payload: item }),
    setGenerationStatus: (status: GenerationStatus | null) => dispatch({ type: ActionType.SET_GENERATION_STATUS, payload: status }),
    updateSettings: (settings: Partial<Settings>) => dispatch({ type: ActionType.UPDATE_SETTINGS, payload: settings }),
    setLoading: (loading: boolean) => dispatch({ type: ActionType.SET_LOADING, payload: loading }),
    setError: (error: string) => dispatch({ type: ActionType.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionType.CLEAR_ERROR }),
  }), [dispatch]);

  const contextValue: AppContextValue = {
    state,
    dispatch,
    actions: boundActions,
    hydrated,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

export function useUser(): User | null {
  const { state } = useAppContext();
  return state.user;
}

export function useContent(): AppState['content'] {
  const { state } = useAppContext();
  return state.content;
}

export function useSettings(): Settings {
  const { state } = useAppContext();
  return state.settings;
}

export function useLoading(): boolean {
  const { state } = useAppContext();
  return state.loading;
}

export function useError(): string | null {
  const { state } = useAppContext();
  return state.error;
}
