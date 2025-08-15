import React, { useEffect, useRef } from 'react';
import config from '../config/environment';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: any) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}

declare global {
  interface Window {
    google: any;
    googleMapsLoaded?: boolean;
  }
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  className = '',
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);

  // Update input value when prop changes
  useEffect(() => {
    if (inputRef.current && !isUpdatingRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    console.log('GooglePlacesAutocomplete useEffect triggered');
    console.log('Google Maps API Key:', config.googleMapsApiKey ? 'Present' : 'Missing');
    console.log('Window.google:', window.google ? 'Available' : 'Not available');
    
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google) {
        console.log('Cannot initialize autocomplete - missing input or google');
        console.log('Input ref:', inputRef.current ? 'Available' : 'Missing');
        console.log('Window.google:', window.google ? 'Available' : 'Missing');
        return;
      }

      console.log('Initializing Google Places Autocomplete');
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'IN' }
      });

      console.log('Adding place_changed listener');
      
      const handlePlaceChanged = () => {
        console.log('place_changed event triggered');
        const place = autocompleteRef.current.getPlace();
        console.log('Place object:', place);
        if (place && place.formatted_address) {
          console.log('Place has formatted_address:', place.formatted_address);
          console.log('Calling onChange with:', place.formatted_address);
          isUpdatingRef.current = true;
          onChange(place.formatted_address);
          if (onPlaceSelected) {
            console.log('Calling onPlaceSelected callback');
            onPlaceSelected(place);
          }
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        } else {
          console.log('Place has no formatted_address');
        }
      };
      
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
      
      // Watch for input value changes that indicate a selection was made
      let lastValue = inputRef.current.value;
      const observer = new MutationObserver(() => {
        const currentValue = inputRef.current?.value;
        if (currentValue && currentValue !== lastValue && currentValue.includes(',')) {
          console.log('Input value changed to:', currentValue);
          lastValue = currentValue;
          setTimeout(() => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              handlePlaceChanged();
            } else {
              // Fallback: create place object from input value
              console.log('Creating fallback place object');
              const mockPlace = {
                formatted_address: currentValue,
                address_components: [],
                geometry: { location: { lat: () => null, lng: () => null } }
              };
              if (onPlaceSelected) {
                onPlaceSelected(mockPlace);
              }
            }
          }, 200);
        }
      });
      
      if (inputRef.current) {
        observer.observe(inputRef.current, { 
          attributes: true, 
          attributeFilter: ['value'],
          childList: false,
          subtree: false
        });
      }
      
      // Also watch for input events
      inputRef.current.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value && target.value.includes(',') && target.value !== lastValue) {
          lastValue = target.value;
          setTimeout(handlePlaceChanged, 300);
        }
      });
    };

    if (window.google) {
      initializeAutocomplete();
    } else if (config.googleMapsApiKey && !window.googleMapsLoaded) {
      console.log('Loading Google Maps API script');
      window.googleMapsLoaded = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`;
      script.onload = () => {
        console.log('Google Maps API script loaded successfully');
        initializeAutocomplete();
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API script');
      };
      document.head.appendChild(script);
    } else {
      console.log('Google Maps API not loaded - missing key or already loaded');
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onPlaceSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUpdatingRef.current) {
      console.log('Input changed to:', e.target.value);
      onChange(e.target.value);
    }
  };

  // Force update input value when it changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInputBlur = () => {
    // Try to get place details when input loses focus
    if (autocompleteRef.current && window.google) {
      setTimeout(() => {
        const place = autocompleteRef.current.getPlace();
        console.log('Place on blur:', place);
        if (place && place.formatted_address && onPlaceSelected) {
          console.log('Calling onPlaceSelected from blur event');
          onPlaceSelected(place);
        }
      }, 100);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      placeholder={placeholder}
      className={className}
      required={required}
      autoComplete="off"
    />
  );
};