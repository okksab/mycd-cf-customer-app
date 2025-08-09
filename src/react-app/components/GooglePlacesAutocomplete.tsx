import React, { useEffect, useRef } from 'react';
import config from '../config/environment';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
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
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'IN' }
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          isUpdatingRef.current = true;
          onChange(place.formatted_address);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      });
    };

    if (window.google) {
      initializeAutocomplete();
    } else if (config.googleMapsApiKey && !window.googleMapsLoaded) {
      window.googleMapsLoaded = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUpdatingRef.current) {
      onChange(e.target.value);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      required={required}
      autoComplete="off"
    />
  );
};