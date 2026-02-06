/**
 * Mock OpenTable API Client
 * Simulates OpenTable booking platform API calls
 * Designed to be easily swapped with real OpenTable API integration
 */

export interface OpenTableAvailability {
  date: Date;
  time: string;
  partySize: number;
  available: boolean;
  availabilityToken?: string;
}

export interface OpenTableBooking {
  reservationId: string;
  restaurantId: string;
  date: Date;
  time: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export class OpenTableMockClient {
  private clientId: string;
  private clientSecret: string;
  private delay: number = 250; // Simulate network delay

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get availability for a restaurant
   */
  async getAvailability(
    restaurantId: string,
    date: Date,
    partySize: number
  ): Promise<OpenTableAvailability[]> {
    await this.simulateDelay();

    // Mock response: generate random availability
    const times = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

    return times.map(time => ({
      date,
      time,
      partySize,
      available: Math.random() > 0.4, // 60% availability
      availabilityToken: Math.random() > 0.4 ? this.generateToken() : undefined,
    }));
  }

  /**
   * Create a reservation
   */
  async createReservation(
    availabilityToken: string,
    restaurantId: string,
    date: Date,
    time: string,
    partySize: number,
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    specialRequests?: string
  ): Promise<OpenTableBooking> {
    await this.simulateDelay();

    // Simulate occasional reservation failures (3% failure rate)
    if (Math.random() < 0.03) {
      throw new Error('Reservation failed: Table no longer available');
    }

    return {
      reservationId: 'OT-' + this.generateReservationId(),
      restaurantId,
      date,
      time,
      partySize,
      status: 'confirmed',
      firstName,
      lastName,
      email,
      phone,
    };
  }

  /**
   * Get reservation details
   */
  async getReservation(reservationId: string): Promise<OpenTableBooking> {
    await this.simulateDelay();

    // Mock: return a reservation
    return {
      reservationId,
      restaurantId: 'mock-restaurant-id',
      date: new Date(),
      time: '19:30',
      partySize: 4,
      status: 'confirmed',
      firstName: 'Mock',
      lastName: 'User',
      email: 'mock@example.com',
    };
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string): Promise<void> {
    await this.simulateDelay();

    // Simulate occasional cancellation failures (1% failure rate)
    if (Math.random() < 0.01) {
      throw new Error('Cancellation failed: Reservation not found');
    }

    // Mock: successfully cancelled
    return;
  }

  /**
   * Modify a reservation
   */
  async modifyReservation(
    reservationId: string,
    newDate?: Date,
    newTime?: string,
    newPartySize?: number
  ): Promise<OpenTableBooking> {
    await this.simulateDelay();

    // Simulate modification failures (8% failure rate)
    if (Math.random() < 0.08) {
      throw new Error('Modification failed: Requested time not available');
    }

    // Mock: return modified reservation
    const originalReservation = await this.getReservation(reservationId);

    return {
      ...originalReservation,
      date: newDate || originalReservation.date,
      time: newTime || originalReservation.time,
      partySize: newPartySize || originalReservation.partySize,
    };
  }

  /**
   * Search for restaurants on OpenTable
   */
  async searchRestaurants(
    query: string,
    location: string,
    date?: Date,
    partySize?: number
  ): Promise<any[]> {
    await this.simulateDelay();

    // Mock: return empty array (would return OpenTable restaurants in real implementation)
    return [];
  }

  /**
   * Get restaurant details
   */
  async getRestaurant(restaurantId: string): Promise<any> {
    await this.simulateDelay();

    // Mock: return mock restaurant data
    return {
      id: restaurantId,
      name: 'Mock Restaurant',
      cuisine: 'American',
      priceRange: 3,
    };
  }

  // Helper methods

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  private generateToken(): string {
    return 'ottoken_' + Math.random().toString(36).substring(2, 18);
  }

  private generateReservationId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Initialize OpenTable client
 */
export function createOpenTableClient(
  clientId?: string,
  clientSecret?: string
): OpenTableMockClient {
  return new OpenTableMockClient(
    clientId || 'mock-client-id',
    clientSecret || 'mock-client-secret'
  );
}
