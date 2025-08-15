// Location Database Service - Use your own location data to reduce Google API calls
interface CityData {
  name: string;
  state: string;
  state_code: string;
  lat: number;
  lng: number;
  pincode: string[];
}

class LocationDatabaseService {
  private cityDatabase: CityData[] = [
    // Major Indian cities with coordinates
    { name: 'Bangalore', state: 'Karnataka', state_code: 'KA', lat: 12.9716, lng: 77.5946, pincode: ['560001', '560002', '560003'] },
    { name: 'Mumbai', state: 'Maharashtra', state_code: 'MH', lat: 19.0760, lng: 72.8777, pincode: ['400001', '400002', '400003'] },
    { name: 'Delhi', state: 'Delhi', state_code: 'DL', lat: 28.7041, lng: 77.1025, pincode: ['110001', '110002', '110003'] },
    { name: 'Chennai', state: 'Tamil Nadu', state_code: 'TN', lat: 13.0827, lng: 80.2707, pincode: ['600001', '600002', '600003'] },
    { name: 'Hyderabad', state: 'Telangana', state_code: 'TG', lat: 17.3850, lng: 78.4867, pincode: ['500001', '500002', '500003'] },
    { name: 'Pune', state: 'Maharashtra', state_code: 'MH', lat: 18.5204, lng: 73.8567, pincode: ['411001', '411002', '411003'] },
    { name: 'Kolkata', state: 'West Bengal', state_code: 'WB', lat: 22.5726, lng: 88.3639, pincode: ['700001', '700002', '700003'] },
    { name: 'Ahmedabad', state: 'Gujarat', state_code: 'GJ', lat: 23.0225, lng: 72.5714, pincode: ['380001', '380002', '380003'] }
    // Add more cities as needed
  ];

  // Search for city in local database
  searchCity(query: string): CityData | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.cityDatabase.find(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.pincode.some(pin => pin.includes(normalizedQuery))
    ) || null;
  }

  // Get location details without Google API call
  getLocationDetailsFromDatabase(cityName: string): any {
    const city = this.searchCity(cityName);
    
    if (!city) return null;
    
    return {
      address: `${city.name}, ${city.state}, India`,
      lat: city.lat,
      lng: city.lng,
      state: city.state,
      state_code: city.state_code,
      city: city.name,
      pincode: city.pincode[0], // Use first pincode
      place_id: `local_${city.name.toLowerCase()}`
    };
  }

  // Check if we can handle this location locally
  canHandleLocally(address: string): boolean {
    return this.searchCity(address) !== null;
  }
}

export default new LocationDatabaseService();