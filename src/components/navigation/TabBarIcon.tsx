import React from 'react';
import { View } from 'react-native';
import { Hop as Home, Landmark, Map as MapIcon, MessageSquare, User } from 'lucide-react-native';

interface TabBarIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
}

export function TabBarIcon({ routeName, focused, color, size }: TabBarIconProps) {
  const strokeWidth = focused ? 2.4 : 2;

  const renderIcon = () => {
    const iconProps = { size: size - 2, color, strokeWidth };

    switch (routeName) {
      case 'Home':
        return <Home {...iconProps} />;
      case 'Schemes':
        return <Landmark {...iconProps} />;
      case 'Roadmap':
        return <MapIcon {...iconProps} />;
      case 'Assistant':
        return <MessageSquare {...iconProps} />;
      case 'Profile':
        return <User {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 8,
        height: size + 8,
        borderRadius: (size + 8) / 2,
        backgroundColor: focused ? `${color}18` : 'transparent',
      }}
    >
      {renderIcon()}
    </View>
  );
}
