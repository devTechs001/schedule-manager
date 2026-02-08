# Onboarding Flow Test

This document outlines the expected flow from splash screen to tour completion.

## Expected Flow

1. **Splash Screen** (`/`)
   - Shows animated logo and loading indicators
   - PWA install prompt appears if installable
   - Automatically redirects to `/welcome` after 3 seconds
   - Sets `seenSplash` flag in localStorage

2. **Welcome Screen** (`/welcome`)
   - Shows app features and benefits
   - "Get Started" button navigates to `/tour`
   - "I already have an account" button navigates to `/login`
   - Sets `seenSplash` flag in localStorage on mount

3. **Tour Screens** (`/tour`)
   - Series of 6 screens explaining app features
   - AI Assistant screen has toggle to enable/disable AI features
   - Progress dots show current position
   - Navigation buttons for previous/next
   - "Skip Tour" option
   - Last screen has "Get Started" button
   - Sets `onboardingComplete` flag in localStorage when finished
   - Navigates to `/register` after completion

## Testing Checklist

- [ ] Splash screen loads correctly
- [ ] PWA install prompt appears when appropriate
- [ ] Auto-redirect to welcome screen after 3 seconds
- [ ] Welcome screen displays correctly
- [ ] Tour navigation works properly
- [ ] AI toggle functions on AI screen
- [ ] Progress dots update correctly
- [ ] Skip tour option works
- [ ] Completion redirects to registration
- [ ] localStorage flags are set appropriately

## Implementation Notes

The flow is managed in `App.jsx` using the following logic:
- Checks `seenSplash` and `onboardingComplete` flags
- Redirects to appropriate screen based on user state
- Ensures proper sequence: Splash → Welcome → Tour → Registration/Login