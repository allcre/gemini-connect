# Bio-Match Project Context

## Quick Reference

### Current Component Status

#### ✅ Implemented
- `OnboardingWizard` - Multi-step onboarding with username inputs and photo upload
- `GeminiCoach` - Chat interface for AI profile optimization (currently mocked)
- `DiscoveryFeed` - Hinge-style profile discovery feed
- `ProfileCard` - Individual profile card component
- `BottomNav` - Bottom navigation bar
- `Logo` - App logo component

#### 🚧 Needs Implementation
- Yellowcake API integration (currently mocked)
- Local storage utilities for data persistence
- Real Gemini API integration for Coach
- Face detection for auto-swipe feature
- Photo storage in IndexedDB or localStorage
- Match/message persistence in localStorage

### Key Data Structures

```typescript
// Profile data structure
interface Profile {
  id: string;
  name: string;
  photos: string[];
  bio: string;
  yellowcakeData?: YellowcakeData;
  targetAudience?: string;
  compatibilityScore?: number;
  highlightedFeatures?: string[];
}

// Yellowcake API response
interface YellowcakeData {
  top_repos: Array<{
    name: string;
    description: string;
    stars: number;
    language: string;
  }>;
  music_genres: string[];
  recent_reviews: Array<{
    film: string;
    rating: number;
    review: string;
  }>;
  sentiment_analysis: {
    overall_sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
  };
}

// Onboarding data
interface OnboardingData {
  githubUsername: string;
  letterboxdUsername: string;
  spotifyUsername: string;
  photos: File[];
}
```

### Design Tokens Reference

**Colors:**
- Primary: `hsl(10 78% 65%)` - Coral/Rose
- Secondary: `hsl(30 30% 94%)` - Soft Cream
- Accent: `hsl(165 60% 70%)` - Mint
- Match: `hsl(280 60% 65%)` - Purple

**Gradients:**
- `.gradient-primary` - Primary coral/rose gradient
- `.gradient-match` - Purple match gradient
- `.gradient-success` - Green success gradient

**Shadows:**
- `.shadow-soft` - Subtle shadow
- `.shadow-card` - Card elevation
- `.shadow-elevated` - High elevation

**Animations:**
- `animate-float` - Floating animation
- `animate-heart-beat` - Heart beat pulse
- `animate-slide-up` - Slide up entrance

### Local Storage Setup Checklist

1. **Storage Utilities:**
   - [ ] Create `src/lib/storage.ts` with helper functions
   - [ ] Implement localStorage wrappers (get, set, remove)
   - [ ] Implement IndexedDB utilities for photos (or use base64)
   - [ ] Add error handling for storage quota limits
   - [ ] Create data migration utilities

2. **Storage Keys:**
   - [ ] `bio_match_profile` - Current user profile
   - [ ] `bio_match_profiles` - All profiles for discovery
   - [ ] `bio_match_yellowcake_data` - Yellowcake API data
   - [ ] `bio_match_matches` - Matches/likes
   - [ ] `bio_match_messages` - Messages between matches
   - [ ] `bio_match_chat_history` - Gemini Coach chat

3. **Photo Storage:**
   - [ ] Decide: IndexedDB vs base64 in localStorage
   - [ ] Implement photo upload handler
   - [ ] Implement photo retrieval handler
   - [ ] Handle storage quota limits gracefully

### API Integration Points

#### Yellowcake API (Mock)
```typescript
// Location: src/lib/yellowcake.ts (to be created)
async function fetchYellowcakeData(usernames: {
  github: string;
  letterboxd: string;
  spotify: string;
}): Promise<YellowcakeData> {
  // Mock implementation
  // TODO: Replace with real API call
}
```

#### Gemini API
```typescript
// Location: src/lib/gemini.ts (to be created)
async function generateProfile(
  yellowcakeData: YellowcakeData,
  targetAudience: string
): Promise<{ bio: string; features: string[] }> {
  // Use Gemini API to generate bio and features
}
```

### Local Storage Utilities

```typescript
// Location: src/lib/storage.ts (to be created)
// Example storage utility functions

const STORAGE_KEYS = {
  PROFILE: 'bio_match_profile',
  PROFILES: 'bio_match_profiles',
  YELLOWCAKE: 'bio_match_yellowcake_data',
  MATCHES: 'bio_match_matches',
  MESSAGES: 'bio_match_messages',
  CHAT_HISTORY: 'bio_match_chat_history',
} as const;

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile:', error);
    // Handle quota exceeded error
  }
}

export function getProfile(): Profile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

// Similar functions for matches, messages, chat history, etc.
```

### Component Communication Flow

```
OnboardingWizard
  ↓ (onComplete)
Index (sets hasOnboarded)
  ↓
DiscoveryFeed / GeminiCoach / Matches / Profile
```

### State Management Strategy

- **Persistent Data:** localStorage/IndexedDB (profiles, matches, messages, chat)
- **UI State:** React useState (modals, tabs, etc.)
- **Form State:** React Hook Form
- **Global State:** React Context (optional, for app-wide state)
- **Data Loading:** Custom hooks that sync with localStorage

### Testing Strategy

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for data flows
- E2E tests for critical user flows (future)

### Performance Considerations

- Lazy load profile images
- Virtualize long lists (if needed)
- Optimize Framer Motion animations
- Cache Yellowcake data
- Use React Query caching

### Accessibility

- Use semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance

### Security Considerations

- Validate all user inputs
- Sanitize data before display
- Secure API keys (environment variables)
- Handle storage quota limits gracefully
- Consider data encryption for sensitive info (future)
- Be aware that localStorage is accessible to any script on the domain
