import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/Button';
import { Routes } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppStackParamList } from '@/navigation/RootNavigator';

import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<AppStackParamList, Routes.PROFILE>;

const AVATAR_SIZE = 96;

export default function ProfileScreen(_: Props) {
  const { logout } = useAuth();
  const { data, isLoading } = useProfile();

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: data.image }} style={styles.avatar} />
      <AppText fontWeight="600" style={styles.name}>
        {data.firstName} {data.lastName}
      </AppText>
      <AppText style={styles.meta}>{data.username}</AppText>
      <AppText style={styles.meta}>{data.email}</AppText>

      <View style={styles.actions}>
        <PrimaryButton title="Logout" onPress={() => void logout()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.GRAY_LIGHT,
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.sm,
  },
  meta: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  actions: {
    width: '100%',
    marginTop: Spacing.xl,
  },
});
