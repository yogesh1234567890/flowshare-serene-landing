/**
 * Monetization Service
 * Handles premium features, usage limits, and subscription management
 */

export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface UsageLimits {
  maxFileSize: number; // in bytes
  maxFilesPerTransfer: number;
  maxTransfersPerDay: number;
  storageDurationHours: number;
  hasAdvancedEncryption: boolean;
  hasNoAds: boolean;
  hasPrioritySupport: boolean;
}

export interface UserUsage {
  transfersToday: number;
  filesTransferredToday: number;
  totalBytesTransferredToday: number;
  subscriptionTier: UserTier;
  subscriptionExpiresAt?: Date;
}

class MonetizationService {
  private userTier: UserTier = UserTier.FREE;
  private usage: UserUsage = {
    transfersToday: 0,
    filesTransferredToday: 0,
    totalBytesTransferredToday: 0,
    subscriptionTier: UserTier.FREE
  };

  // Tier-based limits
  private readonly limits: Record<UserTier, UsageLimits> = {
    [UserTier.FREE]: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFilesPerTransfer: 5,
      maxTransfersPerDay: 10,
      storageDurationHours: 24,
      hasAdvancedEncryption: false,
      hasNoAds: false,
      hasPrioritySupport: false
    },
    [UserTier.PREMIUM]: {
      maxFileSize: Infinity, // Unlimited
      maxFilesPerTransfer: Infinity,
      maxTransfersPerDay: Infinity,
      storageDurationHours: 168, // 7 days
      hasAdvancedEncryption: true,
      hasNoAds: true,
      hasPrioritySupport: true
    },
    [UserTier.ENTERPRISE]: {
      maxFileSize: Infinity,
      maxFilesPerTransfer: Infinity,
      maxTransfersPerDay: Infinity,
      storageDurationHours: 720, // 30 days
      hasAdvancedEncryption: true,
      hasNoAds: true,
      hasPrioritySupport: true
    }
  };

  constructor() {
    this.loadUserTier();
    this.loadUsage();
    this.resetDailyUsageIfNeeded();
  }

  /**
   * Get current user tier
   */
  getUserTier(): UserTier {
    return this.userTier;
  }

  /**
   * Get usage limits for current tier
   */
  getLimits(): UsageLimits {
    return this.limits[this.userTier];
  }

  /**
   * Check if user can transfer a file
   */
  canTransferFile(fileSize: number, fileCount: number = 1): { allowed: boolean; reason?: string } {
    const limits = this.getLimits();
    
    // Check file size
    if (fileSize > limits.maxFileSize) {
      return {
        allowed: false,
        reason: `File size exceeds limit of ${this.formatBytes(limits.maxFileSize)}. Upgrade to Premium for unlimited transfers.`
      };
    }

    // Check files per transfer
    if (fileCount > limits.maxFilesPerTransfer) {
      return {
        allowed: false,
        reason: `Maximum ${limits.maxFilesPerTransfer} files per transfer. Upgrade to Premium for unlimited files.`
      };
    }

    // Check daily transfer limit
    if (this.usage.transfersToday >= limits.maxTransfersPerDay) {
      return {
        allowed: false,
        reason: `Daily transfer limit reached (${limits.maxTransfersPerDay} transfers). Upgrade to Premium for unlimited transfers.`
      };
    }

    return { allowed: true };
  }

  /**
   * Record a file transfer
   */
  recordTransfer(fileSize: number, fileCount: number = 1): void {
    this.usage.transfersToday++;
    this.usage.filesTransferredToday += fileCount;
    this.usage.totalBytesTransferredToday += fileSize;
    this.saveUsage();
  }

  /**
   * Check if user should see ads
   */
  shouldShowAds(): boolean {
    return !this.getLimits().hasNoAds;
  }

  /**
   * Check if user has advanced encryption
   */
  hasAdvancedEncryption(): boolean {
    return this.getLimits().hasAdvancedEncryption;
  }

  /**
   * Get usage statistics
   */
  getUsage(): UserUsage {
    return { ...this.usage };
  }

  /**
   * Get usage percentage for current limits
   */
  getUsagePercentage(): {
    transfers: number;
    files: number;
    storage: number;
  } {
    const limits = this.getLimits();
    return {
      transfers: limits.maxTransfersPerDay === Infinity 
        ? 0 
        : (this.usage.transfersToday / limits.maxTransfersPerDay) * 100,
      files: limits.maxFilesPerTransfer === Infinity
        ? 0
        : 0, // Files per transfer, not cumulative
      storage: 0 // Storage tracking would need backend
    };
  }

  /**
   * Set user tier (for testing or after payment)
   */
  setUserTier(tier: UserTier, expiresAt?: Date): void {
    this.userTier = tier;
    this.usage.subscriptionTier = tier;
    this.usage.subscriptionExpiresAt = expiresAt;
    this.saveUserTier();
    this.saveUsage();
    
    // Sync with backend if available
    this.syncWithBackend();
  }

  /**
   * Sync subscription status with backend
   * COMMENTED OUT FOR NOW - will integrate later
   */
  // private async syncWithBackend(): Promise<void> {
  //   try {
  //     const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  //     const userId = localStorage.getItem('peershare_user_id');
  //     
  //     if (!userId) return;
  //     
  //     const response = await fetch(`${apiUrl}/api/subscription/status`, {
  //       headers: {
  //         'X-User-ID': userId
  //       }
  //     });
  //     
  //     if (response.ok) {
  //       const status = await response.json();
  //       if (status.is_active) {
  //         this.userTier = status.tier as UserTier;
  //         this.usage.subscriptionTier = status.tier as UserTier;
  //         if (status.current_period_end) {
  //           this.usage.subscriptionExpiresAt = new Date(status.current_period_end);
  //         }
  //         this.saveUserTier();
  //         this.saveUsage();
  //       }
  //     }
  //   } catch (error) {
  //     // Silently fail - backend might not be available
  //     console.debug('Failed to sync with backend:', error);
  //   }
  // }

  /**
   * Check if subscription is active
   */
  isSubscriptionActive(): boolean {
    if (this.userTier === UserTier.FREE) {
      return false;
    }

    if (this.usage.subscriptionExpiresAt) {
      return new Date() < this.usage.subscriptionExpiresAt;
    }

    return true; // No expiration = lifetime/active
  }

  /**
   * Load user tier from localStorage
   */
  private loadUserTier(): void {
    try {
      const stored = localStorage.getItem('userTier');
      if (stored && Object.values(UserTier).includes(stored as UserTier)) {
        this.userTier = stored as UserTier;
      }
    } catch (e) {
      console.error('Failed to load user tier:', e);
    }
  }

  /**
   * Save user tier to localStorage
   */
  private saveUserTier(): void {
    try {
      localStorage.setItem('userTier', this.userTier);
    } catch (e) {
      console.error('Failed to save user tier:', e);
    }
  }

  /**
   * Load usage from localStorage
   */
  private loadUsage(): void {
    try {
      const stored = localStorage.getItem('userUsage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const lastReset = new Date(parsed.lastReset || 0);
        const today = new Date();
        
        // Reset if it's a new day
        if (lastReset.toDateString() !== today.toDateString()) {
          this.resetDailyUsage();
        } else {
          this.usage = {
            ...parsed,
            subscriptionTier: parsed.subscriptionTier || UserTier.FREE,
            subscriptionExpiresAt: parsed.subscriptionExpiresAt 
              ? new Date(parsed.subscriptionExpiresAt) 
              : undefined
          };
        }
      }
    } catch (e) {
      console.error('Failed to load usage:', e);
    }
  }

  /**
   * Save usage to localStorage
   */
  private saveUsage(): void {
    try {
      const usageData = {
        ...this.usage,
        lastReset: new Date().toISOString(),
        subscriptionExpiresAt: this.usage.subscriptionExpiresAt?.toISOString()
      };
      localStorage.setItem('userUsage', JSON.stringify(usageData));
    } catch (e) {
      console.error('Failed to save usage:', e);
    }
  }

  /**
   * Reset daily usage if needed
   */
  private resetDailyUsageIfNeeded(): void {
    const stored = localStorage.getItem('userUsage');
    if (stored) {
      const parsed = JSON.parse(stored);
      const lastReset = new Date(parsed.lastReset || 0);
      const today = new Date();
      
      if (lastReset.toDateString() !== today.toDateString()) {
        this.resetDailyUsage();
      }
    }
  }

  /**
   * Reset daily usage counters
   */
  private resetDailyUsage(): void {
    this.usage.transfersToday = 0;
    this.usage.filesTransferredToday = 0;
    this.usage.totalBytesTransferredToday = 0;
    this.saveUsage();
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === Infinity) return 'Unlimited';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const monetizationService = new MonetizationService();

