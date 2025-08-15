// Google Maps Optimized Service - Legal cost reduction using appropriate APIs
interface LocationDetails {
  address: string;
  lat: number;
  lng: number;
  state: string;
  state_code: string;
  city: string;
  pincode: string;
  place_id: string;
}

class GoogleMapsOptimizedService {
  
  // Use Geocoding API instead of Place Details (59% cost reduction)
  async getLocationDetailsFromGeocoding(address: string): Promise<LocationDetails | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ 
        address: address,
        region: 'IN' // Restrict to India for better results
      });
      
      if (result.results && result.results.length > 0) {
        const place = result.results[0];
        const location = place.geometry.location;
        const addressComponents = place.address_components || [];
        
        let state = '';
        let stateCode = '';
        let city = '';
        let pincode = '';
        
        addressComponents.forEach((component: any) => {
          const types = component.types || [];
          
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
            stateCode = component.short_name; // Google provides state codes
          }
          if (types.includes('locality') || types.includes('sublocality_level_1')) {
            city = component.long_name;
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });
        
        return {
          address: place.formatted_address || address,
          lat: location.lat(),
          lng: location.lng(),
          state: state,
          state_code: stateCode,
          city: city,
          pincode: pincode,
          place_id: place.place_id || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }
  
  // Use Distance Matrix API for accurate route calculation (cheaper than Directions)
  async getRouteDistance(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<{ distance: number; duration: number } | null> {
    try {
      const service = new google.maps.DistanceMatrixService();
      
      const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [new google.maps.LatLng(fromLat, fromLng)],
          destinations: [new google.maps.LatLng(toLat, toLng)],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Distance Matrix failed: ${status}`));
          }
        });
      });
      
      const element = result.rows[0]?.elements[0];
      if (element && element.status === 'OK') {
        return {
          distance: Math.round((element.distance?.value || 0) / 1000 * 100) / 100, // Convert to km
          duration: Math.round((element.duration?.value || 0) / 60) // Convert to minutes
        };
      }
      
      return null;
    } catch (error) {
      console.error('Distance Matrix failed:', error);
      return null;
    }
  }
  
  // Fallback: Haversine distance calculation (no API call)
  calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
  
  // Estimate duration based on distance (no API call)
  estimateDuration(distanceKm: number): number {
    // Average speeds by distance
    let avgSpeed = 30; // km/h for city traffic
    
    if (distanceKm > 50) {
      avgSpeed = 60; // Highway speed for long distance
    } else if (distanceKm > 20) {
      avgSpeed = 45; // Mixed city/highway
    }
    
    return Math.round((distanceKm / avgSpeed) * 60); // Convert to minutes
  }
  
  // Process both locations efficiently
  async processLocationsPair(fromAddress: string, toAddress: string): Promise<{
    from: LocationDetails | null;
    to: LocationDetails | null;
    distance: number;
    duration: number;
  }> {
    
    // Get location details for both addresses
    const [fromLocation, toLocation] = await Promise.all([
      this.getLocationDetailsFromGeocoding(fromAddress),
      this.getLocationDetailsFromGeocoding(toAddress)
    ]);
    
    let distance = 0;
    let duration = 0;
    
    if (fromLocation && toLocation) {
      // Try Distance Matrix API first (more accurate)
      try {
        const routeData = await this.getRouteDistance(
          fromLocation.lat, fromLocation.lng,
          toLocation.lat, toLocation.lng
        );
        
        if (routeData) {
          distance = routeData.distance;
          duration = routeData.duration;
        } else {
          // Fallback to Haversine calculation
          distance = this.calculateHaversineDistance(
            fromLocation.lat, fromLocation.lng,
            toLocation.lat, toLocation.lng
          );
          duration = this.estimateDuration(distance);
        }
      } catch (error) {
        // Fallback to Haversine calculation
        distance = this.calculateHaversineDistance(
          fromLocation.lat, fromLocation.lng,
          toLocation.lat, toLocation.lng
        );
        duration = this.estimateDuration(distance);
      }
    }
    
    return {
      from: fromLocation,
      to: toLocation,
      distance,
      duration
    };
  }
}

export default new GoogleMapsOptimizedService();