import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { submitRating } from '../services/api';
import { colors } from '../theme';
import { fonts } from '../theme';

// MOCK — route.params.master 
const MOCK_MASTER = {
  id: 'mock-uuid',
  avg_rating: 4,
  user: {
    full_name: 'Peter Majster',
    avatar_url: 'https://static.wikia.nocookie.net/rage-guy/images/f/f9/Spodermen.gif/revision/latest/scale-to-width-down/1200?cb=20250115154335',
  },
  category: { name: 'Gozdar' },
};

export default function RatingScreen({ navigation, route }) {
  const master = route.params?.master ?? MOCK_MASTER;

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (score === 0) {
      setError('Izberite oceno.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // TODO: 'current-user-uuid' auth context
      await submitRating({
        clientId: 'current-user-uuid',
        masterId: master.id,
        score,
        comment: comment.trim() || null,
      });
      navigation.goBack();
    } catch (err) {
      setError('Napaka pri oddaji ocene: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainWrapper} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={[colors.primaryLightA, colors.white]}
          style={styles.hero}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}>

          <View style={styles.header}>
            <Image
              source={require('../../assets/FixMajstr_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Oceni mojstra</Text>
          </View>

        </LinearGradient>
        <View style={styles.masterCard}>
          <View style={styles.cardAvatarContainer}>
            {master.user.avatar_url ? (
              <Image source={{ uri: master.user.avatar_url }} style={styles.cardAvatar} />
            ) : (
              <View style={styles.cardAvatarEmpty}>
                <Text style={styles.cardAvatarEmptyText}>
                  {master.user.full_name.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{master.user.full_name}</Text>
            <Text style={styles.cardCategory}>{master.category?.name}</Text>
          </View>
          <View style={styles.cardRating}>
            <Text style={styles.cardRatingNumber}>
              {master.avg_rating != null ? master.avg_rating.toFixed(1) : '—'}
            </Text>
            <MaterialCommunityIcons name="wrench" size={16} color={colors.primaryMedium} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Kako bi ocenili Mojstra?</Text>
          <View style={styles.wrenchRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <TouchableOpacity key={i} onPress={() => setScore(i + 1)} activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name="wrench"
                  size={42}
                  color={i < score ? colors.primary : colors.border}
                  style={styles.wrenchIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Dodajte komentar</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={5}
            placeholder="Vaše mnenje o mojstru.."
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? 'Pošiljam...' : 'Objavi oceno'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    paddingBottom: 30,
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.dark,
  },
  masterCard: {
    backgroundColor: colors.white,
    marginHorizontal: 22,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: colors.primaryLight,
  },
  cardAvatar: {
    width: '100%',
    height: '100%',
  },
  cardAvatarEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarEmptyText: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  cardRating: {
    alignItems: 'center',
    gap: 2,
  },
  cardRatingNumber: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textDark,
  },

  section: {
    paddingHorizontal: 22,
    marginTop: 24,
  },
  sectionHeading: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 14,
  },
  wrenchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  wrenchIcon: {
    marginHorizontal: 4,
  },
  commentInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textDark,
    minHeight: 130,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    paddingHorizontal: 22,
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
});
