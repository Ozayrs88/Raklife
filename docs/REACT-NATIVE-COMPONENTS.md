# 📱 React Native Component Library Setup

## shadcn-inspired Components for Customer App

Since shadcn is web-only, here's your complete React Native setup for matching the bestdubai.com aesthetic.

---

## 📦 Libraries to Install

```bash
cd customer-app

# Bottom Sheet (for Sheet/Drawer)
npx expo install @gorhom/bottom-sheet
npx expo install react-native-reanimated react-native-gesture-handler

# Toast Notifications (for Sonner)
npm install react-native-toast-message

# Additional UI Components
npm install react-native-modal
npm install react-native-skeleton-placeholder

# Better Date Picker
npx expo install react-native-date-picker

# Linear Gradient (for cards)
npx expo install expo-linear-gradient
```

---

## 🎨 Custom Component Files to Create

### 1. Card Component (`components/ui/Card.tsx`)
```tsx
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, variant === 'elevated' && styles.elevated, style]}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.cardHeader, style]}>{children}</View>;
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.cardFooter, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});
```

### 2. Badge Component (`components/ui/Badge.tsx`)
```tsx
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { View } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as TextStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  default: {
    backgroundColor: '#3b82f6',
  },
  defaultText: {
    color: '#fff',
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  successText: {
    color: '#16a34a',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  warningText: {
    color: '#d97706',
  },
  error: {
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#dc2626',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
  },
  secondaryText: {
    color: '#64748b',
  },
});
```

### 3. Avatar Component (`components/ui/Avatar.tsx`)
```tsx
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';

interface AvatarProps {
  uri?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Avatar({ uri, fallback = '?', size = 'md', style }: AvatarProps) {
  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 14 },
    md: { width: 40, height: 40, fontSize: 16 },
    lg: { width: 56, height: 56, fontSize: 20 },
  };

  const dimensions = sizeStyles[size];

  return (
    <View style={[styles.avatar, { width: dimensions.width, height: dimensions.height }, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={[styles.fallback, { fontSize: dimensions.fontSize }]}>{fallback}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9999,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    color: '#64748b',
    fontWeight: '600',
  },
});
```

### 4. Button Component (`components/ui/Button.tsx`)
```tsx
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
    md: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
    lg: { paddingHorizontal: 20, paddingVertical: 16, fontSize: 18 },
  };

  const dimensions = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        {
          paddingHorizontal: dimensions.paddingHorizontal,
          paddingVertical: dimensions.paddingVertical,
        },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#fff'} />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text` as keyof typeof styles] as TextStyle,
            { fontSize: dimensions.fontSize },
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  default: {
    backgroundColor: '#3b82f6',
  },
  defaultText: {
    color: '#fff',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  outlineText: {
    color: '#3b82f6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#3b82f6',
  },
  destructive: {
    backgroundColor: '#dc2626',
  },
  destructiveText: {
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
```

### 5. Skeleton Component (`components/ui/Skeleton.tsx`)
```tsx
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e2e8f0',
  },
});
```

---

## 🎯 Usage Examples

### Card with Badge
```tsx
import { Card, CardHeader, CardContent, CardFooter } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Text, View } from 'react-native';

<Card variant="elevated">
  <CardHeader>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Ballet Classes</Text>
      <Badge variant="success">Active</Badge>
    </View>
  </CardHeader>
  <CardContent>
    <Text style={{ color: '#64748b' }}>
      Professional ballet training for children ages 4-12
    </Text>
  </CardContent>
  <CardFooter>
    <Button onPress={() => {}}>Book Now</Button>
  </CardFooter>
</Card>
```

### Avatar with User Info
```tsx
import { Avatar } from './components/ui/Avatar';
import { View, Text } from 'react-native';

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
  <Avatar uri="https://..." fallback="SA" size="lg" />
  <View>
    <Text style={{ fontSize: 16, fontWeight: '600' }}>Sarah Ahmed</Text>
    <Text style={{ fontSize: 14, color: '#64748b' }}>sarah@email.com</Text>
  </View>
</View>
```

### Loading State with Skeleton
```tsx
import { Skeleton } from './components/ui/Skeleton';
import { Card, CardContent } from './components/ui/Card';

<Card>
  <CardContent>
    <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
    <Skeleton width="100%" height={16} style={{ marginBottom: 4 }} />
    <Skeleton width="80%" height={16} />
  </CardContent>
</Card>
```

### Bottom Sheet (Sheet/Drawer)
```tsx
import BottomSheet from '@gorhom/bottom-sheet';
import { useRef } from 'react';

const bottomSheetRef = useRef<BottomSheet>(null);

<BottomSheet
  ref={bottomSheetRef}
  snapPoints={['50%', '90%']}
  enablePanDownToClose
>
  <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Service Details</Text>
    {/* Content */}
  </View>
</BottomSheet>
```

### Toast Notification
```tsx
import Toast from 'react-native-toast-message';

// Show toast
Toast.show({
  type: 'success',
  text1: 'Booking Confirmed!',
  text2: 'Your session has been booked successfully',
});

// Add to App.tsx root
<Toast />
```

---

## 🎨 Design Tokens (React Native)

### Colors
```typescript
export const colors = {
  // Background
  background: '#ffffff',
  card: '#ffffff',
  muted: '#f8fafc',
  
  // Text
  foreground: '#0f172a',
  mutedForeground: '#64748b',
  
  // Primary
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  
  // Success
  success: '#22c55e',
  successBackground: '#dcfce7',
  
  // Warning
  warning: '#f59e0b',
  warningBackground: '#fef3c7',
  
  // Error
  error: '#ef4444',
  errorBackground: '#fee2e2',
  
  // Border
  border: '#e2e8f0',
};
```

### Spacing
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

### Typography
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  tiny: { fontSize: 12, fontWeight: '400' as const },
};
```

---

## 📦 Installation Script

Save this as `install-ui-components.sh`:

```bash
#!/bin/bash

echo "Installing React Native UI Components..."

cd customer-app

# Core dependencies
npx expo install @gorhom/bottom-sheet
npx expo install react-native-reanimated react-native-gesture-handler
npm install react-native-toast-message
npm install react-native-modal
npm install react-native-skeleton-placeholder
npx expo install react-native-date-picker
npx expo install expo-linear-gradient

echo "✅ All components installed!"
echo "Next: Create the component files in components/ui/"
```

---

## ✅ Implementation Checklist

- [ ] Run installation script
- [ ] Create `components/ui/` folder
- [ ] Create Card.tsx
- [ ] Create Badge.tsx
- [ ] Create Avatar.tsx
- [ ] Create Button.tsx
- [ ] Create Skeleton.tsx
- [ ] Add Toast to App.tsx root
- [ ] Create colors/spacing/typography constants
- [ ] Update BookingModal with BottomSheet
- [ ] Add loading skeletons to screens
- [ ] Add toast notifications for actions
- [ ] Test all components

---

## 🚀 Result

A complete component library that matches shadcn's aesthetic for React Native!

- ✅ Clean, modern design
- ✅ Consistent with web dashboard
- ✅ Production-ready
- ✅ Fully typed with TypeScript
- ✅ Optimized for mobile performance
