import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import logo from '../../assets/icon.png';
import { searchMasters } from '../services/api';

const CATEGORY_FILTERS = ['Mehanik', 'Pleskar', 'Vrtnar'];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedSearch = useMemo(() => searchText.trim(), [searchText]);

  const fetchMasters = async (params = {}, showInitialLoader = false) => {
    try {
      setError(null);

      if (showInitialLoader) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      const data = await searchMasters({
        query: params.query ?? null,
        category: params.category ?? null,
        location: params.location ?? null,
        min_rating: params.min_rating ?? null,
        limit: 20,
        offset: 0,
      });

      setMasters(data?.masters || []);
    } catch (err) {
      const detail =
        err?.response?.data?.detail || err?.message || 'Napaka pri nalaganju mojstrov.';
      setError(detail);
      setMasters([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters({}, true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMasters({
        query: normalizedSearch || null,
        category: selectedFilter || null,
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [normalizedSearch, selectedFilter]);

  const renderFilterChip = (filter) => {
    const isActive = selectedFilter === filter;

    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        activeOpacity={0.85}
        onPress={() => setSelectedFilter(isActive ? null : filter)}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {filter}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMasterCard = ({ item }) => {
    const avatarSource = item?.avatar_url
      ? { uri: item.avatar_url }
      : { uri: 'https://via.placeholder.com/300x300.png?text=FixMajstr' };

    const servicesText =
      Array.isArray(item?.services) && item.services.length > 0
        ? item.services.join(', ')
        : item?.description || 'Brez opisa';

    return (
      <LinearGradient
        colors={['#AFC2FF', '#9EB5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Image source={avatarSource} style={styles.avatar} />

        <View style={styles.cardContent}>
          <Text style={styles.masterName}>
            {item?.full_name || 'Neznan mojster'}
          </Text>

          <Text style={styles.masterProfession} numberOfLines={2}>
            {servicesText}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {item?.location ? `📍 ${item.location}` : '📍 Lokacija ni navedena'}
            </Text>
            <Text style={styles.metaText}>
              ⭐ {typeof item?.avg_rating === 'number' ? item.avg_rating.toFixed(1) : '0.0'}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.85}>
              <Text style={styles.moreButtonText}>Več</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
              <Text style={styles.iconButtonText}>✉</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
              <Text style={styles.iconButtonText}>♡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#275CED" />
          <Text style={styles.loaderText}>Nalagam mojstre...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Iskanje mojstra</Text>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Iskanje..."
            placeholderTextColor="#6F7380"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filtersRow}>{CATEGORY_FILTERS.map(renderFilterChip)}</View>

        {loading && (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#275CED" />
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={masters}
          keyExtractor={(item) => item.id}
          renderItem={renderMasterCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>Ni rezultatov za izbrano iskanje.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  loaderText: {
    marginTop: 12,
    color: '#4A4F63',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineLoader: {
    marginBottom: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2E3038',
    letterSpacing: -0.4,
  },
  logo: {
    width: 46,
    height: 46,
    marginTop: -2,
  },
  searchBar: {
    height: 46,
    backgroundColor: '#DADDE5',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 20,
    color: '#666B78',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2E3038',
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  filterChip: {
    backgroundColor: '#6E95FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: '#275CED',
  },
  filterChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  avatar: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#E5E5E5',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  masterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A4F63',
    marginBottom: 4,
  },
  masterProfession: {
    fontSize: 14,
    color: '#4A4F63',
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 14,
  },
  metaText: {
    fontSize: 12,
    color: '#4A4F63',
    marginBottom: 3,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    backgroundColor: '#497AFF',
    borderRadius: 18,
    minWidth: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: 10,
  },
  moreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconButtonText: {
    color: '#497AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyWrapper: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6F7380',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
});