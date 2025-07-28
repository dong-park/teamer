import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface SuccessCounterProps {
  count: number;
}

const SuccessCounter: React.FC<SuccessCounterProps> = ({ count }) => {
  const isDarkMode = useColorScheme() === 'dark';

  // 점 개수와 +숫자 계산
  const dotsToShow = Math.min(count, 3);
  const additionalCount = count > 3 ? count - 3 : 0;

  // 점 배열 생성
  const dots = Array.from({ length: dotsToShow }, (_, index) => (
    <View
      key={index}
      style={[
        styles.dot,
        {
          backgroundColor: isDarkMode ? '#10b981' : '#059669', // emerald-500/600
          shadowColor: isDarkMode ? '#10b981' : '#059669',
        }
      ]}
    />
  ));

  if (count === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {dots}
        {additionalCount > 0 && (
          <View style={[styles.additionalCountContainer, { backgroundColor: isDarkMode ? '#10b981' : '#059669' }]}>
            <Text style={styles.additionalCountText}>+{additionalCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  additionalCountContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  additionalCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default SuccessCounter;