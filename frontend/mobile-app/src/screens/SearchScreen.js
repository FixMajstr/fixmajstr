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
import { Ionicons } from '@expo/vector-icons';
import { searchMasters } from '../services/api';

export default function SearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ratingOrder, setRatingOrder] = useState('desc');
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedSearch = useMemo(() => searchText.trim(), [searchText]);
  const normalizedCategory = useMemo(() => categoryFilter.trim(), [categoryFilter]);
  const normalizedLocation = useMemo(() => locationFilter.trim(), [locationFilter]);

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
        min_rating: null,
        limit: 50,
        offset: 0,
      });

      const mastersFromApi = data?.masters || [];
      setMasters(mastersFromApi);
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
        category: normalizedCategory || null,
        location: normalizedLocation || null,
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [normalizedSearch, normalizedCategory, normalizedLocation]);

  const displayedMasters = useMemo(() => {
    const sorted = [...masters].sort((a, b) => {
      const ratingA = Number.isFinite(a?.avg_rating) ? a.avg_rating : 0;
      const ratingB = Number.isFinite(b?.avg_rating) ? b.avg_rating : 0;

      return ratingOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
    });

    return sorted;
  }, [masters, ratingOrder]);

  const clearFilters = () => {
    setCategoryFilter('');
    setLocationFilter('');
  };

  const toggleRatingOrder = () => {
    setRatingOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const renderMasterCard = ({ item }) => {
    const avatarSource =
      item?.avatar_url?.trim()
        ? { uri: item.avatar_url }
        : { uri: 'https://via.placeholder.com/200x200.png?text=FixMajstr' };

    const descriptionText =
      item?.description?.trim() ||
      (Array.isArray(item?.services) && item.services.length > 0
        ? item.services.join(', ')
        : 'Brez opisa');

    const displayName = item?.full_name?.trim() || 'Neznan mojster';
    const displayLocation = item?.location?.trim() || 'Lokacija ni navedena';
    const displayRating = Number.isFinite(item?.avg_rating)
      ? Math.max(1, Math.min(5, Math.round(item.avg_rating)))
      : 1;

    return (
      <LinearGradient
        colors={['#B7C9FF', '#8EA8F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Image source={avatarSource} style={styles.avatar} />

        <View style={styles.cardContent}>
          <Text style={styles.masterName} numberOfLines={1}>
            {displayName}
          </Text>

          <Text style={styles.masterProfession} numberOfLines={2}>
            {descriptionText}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📍 {displayLocation}</Text>
            <Text style={styles.metaText}>⭐ {displayRating}</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.85}>
              <Text style={styles.moreButtonText}>Več</Text>
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
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={30} color="#2F3241" />
          </TouchableOpacity>

          <Text style={styles.title}>Iskanje mojstra</Text>

          <View style={styles.rightPlaceholder} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#4B4F5E"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Iskanje..."
            placeholderTextColor="#4B4F5E"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <Ionicons
              name={showFilters ? 'options' : 'options-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.filterButtonText}>Filtri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={toggleRatingOrder}
          >
            <Ionicons
              name={ratingOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.filterButtonText}>
              Rating {ratingOrder === 'desc' ? '5-1' : '1-5'}
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersPanel}>
            <View style={styles.filterBlock}>
              <Text style={styles.filterLabel}>Kategorija</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Vpiši kategorijo"
                placeholderTextColor="#707487"
                value={categoryFilter}
                onChangeText={setCategoryFilter}
              />
            </View>

            <View style={styles.filterBlock}>
              <Text style={styles.filterLabel}>Lokacija</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Vpiši lokacijo"
                placeholderTextColor="#707487"
                value={locationFilter}
                onChangeText={setLocationFilter}
              />
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              activeOpacity={0.85}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Počisti filtre</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#275CED" />
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <FlatList
          data={displayedMasters}
          keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
          renderItem={renderMasterCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>Ni rezultatov za izbrane filtre.</Text>
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
    backgroundColor: '#F3F3F3',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
    minHeight: 44,
  },
  backButton: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 36,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#313446',
  },
  searchBar: {
    height: 40,
    backgroundColor: '#DADDE5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2E3038',
    paddingVertical: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5E88FF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  filtersPanel: {
    backgroundColor: '#E8EBF5',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  filterBlock: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34384A',
    marginBottom: 6,
  },
  filterInput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#2E3038',
  },
  clearButton: {
    marginTop: 4,
    backgroundColor: '#4B7CFF',
    borderRadius: 16,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  inlineLoader: {
    marginBottom: 10,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 22,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E5E5E5',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 2,
  },
  masterName: {
    fontSize: 19,
    fontWeight: '600',
    color: '#3B3E52',
    marginBottom: 4,
  },
  masterProfession: {
    fontSize: 16,
    color: '#3B3E52',
    marginBottom: 10,
    fontWeight: '400',
  },
  metaRow: {
    marginBottom: 14,
  },
  metaText: {
    fontSize: 14,
    color: '#4A4F63',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    backgroundColor: '#4B7CFF',
    borderRadius: 18,
    minWidth: 58,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  moreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },
  loaderText: {
    marginTop: 12,
    color: '#4A4F63',
    fontSize: 14,
    fontWeight: '600',
  },
});