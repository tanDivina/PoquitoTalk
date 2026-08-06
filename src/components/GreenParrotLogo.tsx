import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface GreenParrotLogoProps {
  size?: number;
}

export const GreenParrotLogo: React.FC<GreenParrotLogoProps> = ({ size = 42 }) => {
  return (
    <Image
      source={require('../assets/logo_transparent.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    backgroundColor: 'transparent',
  },
});
