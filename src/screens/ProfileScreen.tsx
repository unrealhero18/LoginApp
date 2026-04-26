import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ErrorMessages, AuthMessages } from '@/constants/messages';
import { Routes } from '@/constants/routes';
import { useAuth, useProfile } from '@/hooks';
import { AppStackParamList } from '@/navigation/RootNavigator';
import { cn } from '@/utils/styles';

import BackIcon from '@/assets/icons/back.svg';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { globalStyles } from '@/theme/styles';
import { Typography } from '@/theme/typography';

type Props = NativeStackScreenProps<AppStackParamList, Routes.PROFILE>;

export default function ProfileScreen(_: Props) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { data, isError, isFetching, isLoading, refetch } = useProfile();

  const containerStyle = useMemo(
    () => [styles.container, { paddingTop: insets.top + Spacing.md }],
    [insets.top],
  );

  const renderContent = () => {
    if ((isLoading || isFetching) && !data) {
      return (
        <View style={styles.centred}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centred}>
          <ErrorMessage
            message={ErrorMessages.PROFILE_FAILURE}
            testID="profile-error"
          />
          <PrimaryButton
            title={AuthMessages.RETRY_BUTTON}
            onPress={() => refetch()}
          />
        </View>
      );
    }

    if (!data) {
      return null;
    }

    return (
      <>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => logout()}
            testID="back-arrow"
            hitSlop={8}
            style={({ pressed }) => cn([globalStyles, styles], 'backButton', { pressed })}
          >
            <BackIcon width={24} height={24} />
          </Pressable>
          <AppText fontWeight="600" style={styles.greeting}>
            Hi, {data.firstName} {data.lastName}!
          </AppText>
          <View style={styles.spacer} />
        </View>
        <SecondaryButton
          title={AuthMessages.LOGOUT_BUTTON}
          onPress={() => logout()}
        />
      </>
    );
  };

  return <View style={containerStyle}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'flex-start',
    backgroundColor: Colors.GRAY_LIGHT,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  centred: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Typography.size.lg,
    color: Colors.INK,
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 24,
  },
  pressed: {
    opacity: 0.5,
  },
});
