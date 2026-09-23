import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { SIDE_PADDING } from '@/components/visas/metrics';
import { VisaFilterSheet } from '@/components/visas/visa-filter-sheet';
import { VisaRow } from '@/components/visas/visa-row';
import { VisaSearchBar } from '@/components/visas/visa-search-bar';
import {
  ALL_REGIONS,
  ALL_VISAS,
  DEFAULT_SORT,
  FULL_PRICE_RANGE,
  filterVisas,
  isFullPriceRange,
  sortVisas,
  type PriceRange,
  type VisaCountry,
  type VisaRegionFilter,
  type VisaSort,
} from '@/constants/visas-data';
import { Colors } from '@/constants/theme';

// Rows added each time the list reaches its end. Twelve is a little over a
// screenful, so the next batch is already in place by the time the previous
// one has been scrolled past and the list never visibly stalls.
const PAGE = 12;

// Every country Agoua files a visa for, searchable and filterable.
//
// Reached from View All on the Visas screen. A FlatList rather than the mapped
// ScrollView the other screens use: this is the only list in the app long
// enough for row recycling to matter, and `onEndReached` is what the batching
// below hangs off.
export default function VisaListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<VisaRegionFilter>(ALL_REGIONS);
  const [sort, setSort] = useState<VisaSort>(DEFAULT_SORT);
  const [price, setPrice] = useState<PriceRange>(FULL_PRICE_RANGE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const results = useMemo(
    () => sortVisas(filterVisas(ALL_VISAS, region, query, price), sort),
    [region, query, sort, price]
  );

  // Everything that changes the result set also resets the window. Without
  // this, narrowing a list you had already scrolled deep into would leave you
  // holding a page count larger than the results, and widening it again would
  // dump every remaining row in at once.
  const reset = useCallback(<T,>(apply: () => T) => {
    setVisible(PAGE);
    return apply();
  }, []);

  const page = useMemo(() => results.slice(0, visible), [results, visible]);

  // The count is only meaningful once something is narrowing the list; on the
  // full list it just restates the obvious.
  const narrowed = query.trim() !== '' || region !== ALL_REGIONS || !isFullPriceRange(price);

  // Sort is always set to something, so it is not a filter for badge purposes
  // unless it has been moved off the default.
  const activeFilters =
    (region === ALL_REGIONS ? 0 : 1) +
    (sort === DEFAULT_SORT ? 0 : 1) +
    (isFullPriceRange(price) ? 0 : 1);

  const renderItem = useCallback(
    ({ item }: { item: VisaCountry }) => (
      <VisaRow
        visa={item}
        onPress={() => router.push({ pathname: '/visa', params: { key: item.key } })}
      />
    ),
    [router]
  );

  return (
    <View style={styles.screen}>
      {/* Outside the list rather than in its header, so it holds its place
          while the rows move under it. The search field stays in the list's own
          header: it belongs to the results, and pinning both would leave a
          third of a phone permanently spent on chrome. */}
      <View style={[styles.titleRow, { paddingTop: insets.top + 10 }]}>
        <BackButton />
        <Text style={styles.title}>All Tourist Visas</Text>
      </View>

      <FlatList
        data={page}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          paddingBottom: insets.bottom + 24,
        }}
        // Half a screen out, so the next batch lands before the last row does.
        onEndReachedThreshold={0.5}
        onEndReached={() =>
          setVisible((current) => (current >= results.length ? current : current + PAGE))
        }
        // Drawn by the list so the last row has none under it.
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        // Dismisses the keyboard as the list moves, which is the only way off
        // it once the search field has focus and the list fills the screen.
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.search}>
              <VisaSearchBar
                query={query}
                onChangeQuery={(next) => reset(() => setQuery(next))}
                activeFilters={activeFilters}
                onOpenFilters={() => setFiltersOpen(true)}
              />
            </View>

            {narrowed ? (
              <Text style={styles.count}>
                {results.length} {results.length === 1 ? 'country' : 'countries'}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No countries match</Text>
            <Text style={styles.emptyDetail}>
              Try a different spelling, or clear the filter to see all {ALL_VISAS.length}.
            </Text>
          </View>
        }
        ListFooterComponent={
          // Only while there is more to come. Once the list is fully drawn the
          // footer would be a permanent tally at the bottom of the screen,
          // which reads as a control that has stopped working.
          page.length < results.length ? (
            <Text style={styles.footer}>
              Showing {page.length} of {results.length}
            </Text>
          ) : null
        }
      />

      <VisaFilterSheet
        open={filtersOpen}
        region={region}
        sort={sort}
        price={price}
        onClose={() => setFiltersOpen(false)}
        onApply={(nextRegion, nextSort, nextPrice) =>
          reset(() => {
            setRegion(nextRegion);
            setSort(nextSort);
            setPrice(nextPrice);
            setFiltersOpen(false);
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 21,
    fontWeight: '800',
    color: Colors.onLight,
  },
  search: {
    marginTop: 10,
  },
  count: {
    marginTop: 14,
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  empty: {
    paddingTop: 48,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onLight,
  },
  emptyDetail: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
  },
});
