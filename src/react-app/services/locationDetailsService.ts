// Location Details Service - Extract comprehensive location data from Google Maps API
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

interface LeadLocationData {
  // Customer details
  customer_first_name: string;
  customer_last_name: string;
  mobile_number: string;
  
  // Location strings
  from_location: string;
  to_location: string;
  
  // From location details
  from_location_details: LocationDetails;
  
  // To location details  
  to_location_details: LocationDetails;
  
  // Service details
  service_category: string;
  service_subcategory: string;
  service_subsubcategory: string;
  service_duration: string;
  
  // Calculated values
  estimated_distance_km: number;
  estimated_duration_min: number;
  
  // Trip type
  trip_type: string;
  
  // User location
  user_latitude: number;
  user_longitude: number;
  
  // Geo details
  geo_state: string;
  geo_city: string;
  geo_pincode: string;
}

class LocationDetailsService {
  private placeDetailsCache = new Map<string, any>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  // State name to code mapping (fallback)
  private getStateCode(stateName: string): string {
    const stateMap: Record<string, string> = {
      'andhra pradesh': 'AP',
      'karnataka': 'KA',
      'tamil nadu': 'TN',
      'maharashtra': 'MH',
      'delhi': 'DL',
      'uttar pradesh': 'UP',
      'west bengal': 'WB',
      'gujarat': 'GJ',
      'rajasthan': 'RJ',
      'madhya pradesh': 'MP'
      // Add more as needed
    };
    
    return stateMap[stateName?.toLowerCase()] || 'UN';
  }
  
  // Get coordinates + address components using Geocoding API (cheaper than Place Details)
  async getLocationDetailsFromGeocoding(address: string): Promise<LocationDetails | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
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
            stateCode = component.short_name;
          }
          if (types.includes('locality')) {
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
          state_code: stateCode || this.getStateCode(state),
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

  // Extract location details from Autocomplete response + Geocoding
  async extractLocationDetailsFromAutocomplete(prediction: any): Promise<LocationDetails> {
    const addressComponents = prediction.structured_formatting || {};
    
    // Extract basic info from autocomplete prediction
    const mainText = addressComponents.main_text || '';
    const secondaryText = addressComponents.secondary_text || '';
    
    // Parse state and city from secondary text
    const parts = secondaryText.split(', ');
    const state = parts[parts.length - 2] || '';
    const city = parts[0] || mainText;
    
    // Get coordinates using Geocoding API
    const coordinates = await this.getCoordinatesFromAddress(prediction.description);
    
    return {
      address: prediction.description || '',
      lat: coordinates?.lat || 0,
      lng: coordinates?.lng || 0,
      state: state,
      state_code: this.getStateCode(state),
      city: city,
      pincode: '', // Not available in autocomplete - can be estimated
      place_id: prediction.place_id || ''
    };
  }

  // Extract comprehensive location details from Google Maps Place Details
  extractLocationDetails(placeDetails: any): LocationDetails {
    const addressComponents = placeDetails.address_components || [];
    const geometry = placeDetails.geometry || {};
    const location = geometry.location || {};
    
    let state = '';
    let stateCode = '';
    let city = '';
    let pincode = '';
    
    addressComponents.forEach((component: any) => {
      const types = component.types || [];
      
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
        stateCode = component.short_name; // Get from Google Maps
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });
    
    return {
      address: placeDetails.formatted_address || '',
      lat: location.lat || 0,
      lng: location.lng || 0,
      state: state,
      state_code: stateCode || this.getStateCode(state),
      city: city,
      pincode: pincode,
      place_id: placeDetails.place_id || ''
    };
  }
  
  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  // Estimate duration based on distance
  estimateDuration(distanceKm: number): number {
    return Math.round((distanceKm / 30) * 60); // 30 km/h average speed
  }
  
  // Batch process both locations in single call
  async batchProcessLocations(
    fromAddress: string,
    toAddress: string
  ): Promise<{ from: LocationDetails | null; to: LocationDetails | null; distance: number; duration: number }> {
    
    // Check cache first
    const [cachedFrom, cachedTo] = await Promise.all([
      this.getCachedLocationDetails(fromAddress),
      this.getCachedLocationDetails(toAddress)
    ]);
    
    // Only geocode uncached locations
    const geocodePromises = [];
    if (!cachedFrom) geocodePromises.push(this.getLocationDetailsFromGeocoding(fromAddress));
    if (!cachedTo) geocodePromises.push(this.getLocationDetailsFromGeocoding(toAddress));
    
    const geocodeResults = await Promise.all(geocodePromises);
    
    const fromLocation = cachedFrom || geocodeResults[0];
    const toLocation = cachedTo || geocodeResults[cachedFrom ? 0 : 1];
    
    // Calculate distance locally
    const distance = fromLocation && toLocation ? 
      this.calculateDistance(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng) : 0;
    const duration = this.estimateDuration(distance);
    
    return { from: fromLocation, to: toLocation, distance, duration };
  }

  // Construct complete lead data with all 18 location fields
  async constructLeadDataOptimized(
    customerData: { firstName: string; lastName: string; mobile: string },
    fromAddress: string,
    toAddress: string,
    serviceDetails: { category: string; subcategory: string; subSubcategory: string; duration: string }
  ): Promise<LeadLocationData> {
    
    const fromLocation = this.extractLocationDetails(fromPlaceDetails);
    const toLocation = this.extractLocationDetails(toPlaceDetails);
    
    // Calculate distance and duration
    const distance = this.calculateDistance(
      fromLocation.lat, fromLocation.lng,
      toLocation.lat, toLocation.lng
    );
    const duration = this.estimateDuration(distance);
    
    return {
      // Customer details
      customer_first_name: customerData.firstName,
      customer_last_name: customerData.lastName,
      mobile_number: customerData.mobile,
      
      // Location strings (existing columns)
      from_location: fromLocation.address,
      to_location: toLocation.address,
      
      // Detailed location data for backend processing
      from_location_details: fromLocation,
      to_location_details: toLocation,
      
      // Service details (existing + new columns)
      service_category: serviceDetails.category,
      service_subcategory: serviceDetails.subcategory,
      service_subsubcategory: serviceDetails.subSubcategory,
      service_duration: serviceDetails.duration,
      
      // Calculated values (existing columns)
      estimated_distance_km: Math.round(distance * 100) / 100,
      estimated_duration_min: duration,
      
      // Trip type based on distance
      trip_type: distance > 50 ? 'OUTSTATION' : 'LOCAL',
      
      // User location (existing columns)
      user_latitude: fromLocation.lat,
      user_longitude: fromLocation.lng,
      
      // Geo details (existing columns)
      geo_state: fromLocation.state,
      geo_city: fromLocation.city,
      geo_pincode: fromLocation.pincode
    };
  }
  
  // Smart caching for location details
  async getCachedLocationDetails(address: string): Promise<LocationDetails | null> {
    const cacheKey = `location_${address.toLowerCase().trim()}`;
    const cached = this.placeDetailsCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('✅ Using cached location details for:', address);
      return cached.data;
    }
    
    console.log('🔄 Fetching new location details for:', address);
    const data = await this.getLocationDetailsFromGeocoding(address);
    
    if (data) {
      this.placeDetailsCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
    }
    
    return data;
  }
  
  // Persist cache to localStorage
  saveCacheToStorage() {
    try {
      const cacheData = Array.from(this.placeDetailsCache.entries());
      localStorage.setItem('location_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }
  
  // Load cache from localStorage
  loadCacheFromStorage() {
    try {
      const cacheData = localStorage.getItem('location_cache');
      if (cacheData) {
        const entries = JSON.parse(cacheData);
        this.placeDetailsCache = new Map(entries);
        console.log('📦 Loaded', entries.length, 'cached locations');
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  // Validate location data before sending
  validateLocationData(leadData: LeadLocationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!leadData.from_location_details.lat || !leadData.from_location_details.lng) {
      errors.push('From location coordinates are required');
    }
    
    if (!leadData.to_location_details.lat || !leadData.to_location_details.lng) {
      errors.push('To location coordinates are required');
    }
    
    if (!leadData.from_location_details.state_code || leadData.from_location_details.state_code === 'UN') {
      errors.push('From location state is required');
    }
    
    if (!leadData.to_location_details.state_code || leadData.to_location_details.state_code === 'UN') {
      errors.push('To location state is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

export default new LocationDetailsService();