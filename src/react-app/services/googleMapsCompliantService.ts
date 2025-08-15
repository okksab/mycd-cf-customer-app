// Google Maps Compliant Service - Only store user-entered data and our calculations
interface CompliantLocationData {
  // User-entered data (allowed)
  from_location: string;
  to_location: string;
  
  // User's current location (allowed)
  user_latitude: number;
  user_longitude: number;
  
  // Our calculations (allowed)
  estimated_distance_km: number;
  estimated_duration_min: number;
  
  // Service details (our business data)
  service_category: string;
  service_subcategory: string;
  service_subsubcategory: string;
  service_duration: string;
}

class GoogleMapsCompliantService {
  
  // Calculate distance using Haversine formula (no Google data stored)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  // Estimate duration based on distance
  private estimateDuration(distanceKm: number): number {
    let avgSpeed = 30; // km/h for city traffic
    
    if (distanceKm > 50) {
      avgSpeed = 60; // Highway speed
    } else if (distanceKm > 20) {
      avgSpeed = 45; // Mixed traffic
    }
    
    return Math.round((distanceKm / avgSpeed) * 60);
  }
  
  // Process locations and create compliant lead data
  async createCompliantLeadData(
    customerData: { firstName: string; lastName: string; mobile: string },
    fromAddress: string,
    toAddress: string,
    userCurrentLocation: { lat: number; lng: number },
    serviceDetails: { category: string; subcategory: string; subSubcategory: string; duration: string }
  ): Promise<CompliantLocationData> {
    
    // Get coordinates for distance calculation (not stored)
    const fromCoords = await this.getCoordinatesForCalculation(fromAddress);
    const toCoords = await this.getCoordinatesForCalculation(toAddress);
    
    // Calculate distance and duration (our calculations)
    let distance = 0;
    let duration = 0;
    
    if (fromCoords && toCoords) {
      distance = this.calculateDistance(
        fromCoords.lat, fromCoords.lng,
        toCoords.lat, toCoords.lng
      );
      duration = this.estimateDuration(distance);
    }
    
    // Return only compliant data
    return {
      // User-entered addresses (allowed)
      from_location: fromAddress,
      to_location: toAddress,
      
      // User's current location (allowed)
      user_latitude: userCurrentLocation.lat,
      user_longitude: userCurrentLocation.lng,
      
      // Our calculations (allowed)
      estimated_distance_km: distance,
      estimated_duration_min: duration,
      
      // Service details (our business data)
      service_category: serviceDetails.category,
      service_subcategory: serviceDetails.subcategory,
      service_subsubcategory: serviceDetails.subSubcategory,
      service_duration: serviceDetails.duration
    };
  }
  
  // Get coordinates only for calculation (not stored)
  private async getCoordinatesForCalculation(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ 
        address: address,
        region: 'IN'
      });
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding for calculation failed:', error);
      return null;
    }
  }
}

export default new GoogleMapsCompliantService();