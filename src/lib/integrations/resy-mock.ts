/**
 * Mock Resy API Client
 * Simulates Resy booking platform API calls
 * Designed to be easily swapped with real Resy API integration
 */

export interface ResyAvailability {
  date: Date;
  time: string;
  partySize: number;
  available: boolean;
  token?: string;
}

export interface ResyBooking {
  confirmationId: string;
  restaurantId: string;
  date: Date;
  time: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  guestName: string;
  guestEmail: string;
}

export class ResyMockClient {
  private apiKey: string;
  private delay: number = 300; // Simulate network delay

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get availability for a restaurant
   */
  async getAvailability(
    restaurantId: string,
    date: Date,
    partySize: number
  ): Promise<ResyAvailability[]> {
    // Simulate API delay
    await this.simulateDelay();

    // Mock response: generate random availability
    const times = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

    return times.map(time => ({
      date,
      time,
      partySize,
      available: Math.random() > 0.3, // 70% availability
      token: Math.random() > 0.3 ? this.generateToken() : undefined,
    }));
  }

  /**
   * Create a booking
   */
  async createBooking(
    token: string,
    restaurantId: string,
    date: Date,
    time: string,
    partySize: number,
    guestName: string,
    guestEmail: string
  ): Promise<ResyBooking> {
    await this.simulateDelay();

    // Simulate occasional booking failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Booking failed: Time slot no longer available');
    }

    return {
      confirmationId: 'RESY-' + this.generateConfirmationId(),
      restaurantId,
      date,
      time,
      partySize,
      status: 'confirmed',
      guestName,
      guestEmail,
    };
  }

  /**
   * Get booking details
   */
  async getBooking(confirmationId: string): Promise<ResyBooking> {
    await this.simulateDelay();

    // Mock: return a booking (in real implementation, would fetch from Resy API)
    return {
      confirmationId,
      restaurantId: 'mock-restaurant-id',
      date: new Date(),
      time: '19:00',
      partySize: 2,
      status: 'confirmed',
      guestName: 'Mock User',
      guestEmail: 'mock@example.com',
    };
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(confirmationId: string): Promise<void> {
    await this.simulateDelay();

    // Simulate occasional cancellation failures (2% failure rate)
    if (Math.random() < 0.02) {
      throw new Error('Cancellation failed: Booking not found or past cancellation window');
    }

    // Mock: successfully cancelled
    return;
  }

  /**
   * Modify a booking
   */
  async modifyBooking(
    confirmationId: string,
    newDate?: Date,
    newTime?: string,
    newPartySize?: number
  ): Promise<ResyBooking> {
    await this.simulateDelay();

    // Simulate modification failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Modification failed: New time slot not available');
    }

    // Mock: return modified booking
    const originalBooking = await this.getBooking(confirmationId);

    return {
      ...originalBooking,
      date: newDate || originalBooking.date,
      time: newTime || originalBooking.time,
      partySize: newPartySize || originalBooking.partySize,
    };
  }

  /**
   * Search restaurants on Resy
   */
  async searchRestaurants(query: string, location: string): Promise<any[]> {
    await this.simulateDelay();

    // Mock: return empty array (would return Resy restaurants in real implementation)
    return [];
  }

  // Helper methods

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  private generateToken(): string {
    return 'tok_' + Math.random().toString(36).substring(2, 15);
  }

  private generateConfirmationId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Initialize Resy client with API key
 */
export function createResyClient(apiKey?: string): ResyMockClient {
  return new ResyMockClient(apiKey || 'mock-api-key');
}
