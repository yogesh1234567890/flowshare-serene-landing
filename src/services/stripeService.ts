/**
 * Stripe Payment Service
 * Handles Stripe checkout and subscription management
 */

export interface CheckoutSession {
  checkout_url: string;
  session_id: string;
}

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  is_active: boolean;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

class StripeService {
  private apiUrl: string;
  private userId: string;

  constructor() {
    // Get API URL from environment or use default
    this.apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    // Get or create user ID
    this.userId = this.getOrCreateUserId();
  }

  /**
   * Get or create a user ID for tracking
   */
  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('peershare_user_id');
    if (!userId) {
      // Generate a unique ID
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('peershare_user_id', userId);
    }
    return userId;
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    tier: 'premium' | 'enterprise',
    plan: 'monthly' | 'yearly'
  ): Promise<CheckoutSession> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': this.userId
        },
        body: JSON.stringify({
          tier,
          plan,
          success_url: `${window.location.origin}/upgrade?success=true`,
          cancel_url: `${window.location.origin}/upgrade?canceled=true`,
          user_id: this.userId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'X-User-ID': this.userId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      // Return free tier as default
      return {
        tier: 'free',
        status: 'canceled',
        is_active: false,
        cancel_at_period_end: false
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'X-User-ID': this.userId
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(tier: 'premium' | 'enterprise', plan: 'monthly' | 'yearly'): Promise<void> {
    try {
      const session = await this.createCheckoutSession(tier, plan);
      window.location.href = session.checkout_url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();




