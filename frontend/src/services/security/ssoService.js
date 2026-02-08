// Single Sign-On (SSO) Service

class SSOService {
  constructor() {
    this.providers = {
      google: {
        name: 'Google',
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'email profile',
      },
      microsoft: {
        name: 'Microsoft',
        clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'mock-microsoft-client-id',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scope: 'user.read email profile',
      },
      github: {
        name: 'GitHub',
        clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'mock-github-client-id',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'user:email read:user',
      },
    };
    this.redirectUri = `${window.location.origin}/auth/callback`;
    this.stateKey = 'sso_state';
  }

  // Get available providers
  getProviders() {
    return Object.entries(this.providers).map(([id, config]) => ({
      id,
      name: config.name,
    }));
  }

  // Generate state for CSRF protection
  generateState() {
    const state = crypto.randomUUID();
    sessionStorage.setItem(this.stateKey, state);
    return state;
  }

  // Verify state
  verifyState(state) {
    const stored = sessionStorage.getItem(this.stateKey);
    sessionStorage.removeItem(this.stateKey);
    return stored === state;
  }

  // Get authorization URL
  getAuthUrl(providerId) {
    const provider = this.providers[providerId];
    if (!provider) throw new Error(`Unknown provider: ${providerId}`);

    const state = this.generateState();
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: provider.scope,
      state,
    });

    sessionStorage.setItem('sso_provider', providerId);

    return `${provider.authUrl}?${params.toString()}`;
  }

  // Initiate SSO login
  login(providerId) {
    const authUrl = this.getAuthUrl(providerId);
    window.location.href = authUrl;
  }

  // Handle callback
  async handleCallback(code, state) {
    // Verify state
    if (!this.verifyState(state)) {
      throw new Error('Invalid state - possible CSRF attack');
    }

    const providerId = sessionStorage.getItem('sso_provider');
    sessionStorage.removeItem('sso_provider');

    if (!providerId) {
      throw new Error('No provider found');
    }

    // Exchange code for token (would be done via backend)
    const tokenData = await this.exchangeCode(providerId, code);
    
    // Get user info
    const userInfo = await this.getUserInfo(providerId, tokenData.access_token);

    return {
      provider: providerId,
      user: userInfo,
      tokens: tokenData,
    };
  }

  // Exchange authorization code for token
  async exchangeCode(providerId, code) {
    // In production, this should be done server-side
    // Simulating token exchange
    await new Promise(r => setTimeout(r, 1000));

    return {
      access_token: `mock-access-token-${Date.now()}`,
      refresh_token: `mock-refresh-token-${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
    };
  }

  // Get user info from provider
  async getUserInfo(providerId, accessToken) {
    // Simulate getting user info
    await new Promise(r => setTimeout(r, 500));

    return {
      id: `${providerId}-user-${Date.now()}`,
      email: `user@${providerId}.example.com`,
      name: `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} User`,
      picture: null,
      provider: providerId,
    };
  }

  // Link account
  async linkAccount(providerId) {
    const authUrl = this.getAuthUrl(providerId);
    sessionStorage.setItem('sso_action', 'link');
    window.location.href = authUrl;
  }

  // Unlink account
  async unlinkAccount(providerId) {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, provider: providerId };
  }

  // Get linked accounts
  async getLinkedAccounts() {
    // Would fetch from backend
    return [];
  }

  // Check if provider is linked
  async isProviderLinked(providerId) {
    const linked = await this.getLinkedAccounts();
    return linked.some(a => a.provider === providerId);
  }

  // Refresh provider token
  async refreshProviderToken(providerId, refreshToken) {
    await new Promise(r => setTimeout(r, 500));
    return {
      access_token: `mock-refreshed-token-${Date.now()}`,
      expires_in: 3600,
    };
  }
}

export const ssoService = new SSOService();
export default ssoService;

