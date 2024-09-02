import React, {useState, useMemo, useCallback} from 'react';
import {
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {Crime} from '../constant/type';
import useDebounce from '../hooks/useDebounce';

const Item = ({item, onPress}: {item: Crime; onPress: () => void}) => (
  <TouchableOpacity
    style={styles.container}
    activeOpacity={0.9}
    onPress={onPress}>
    <View style={styles.itemContainer}>
      <Text style={styles.modalHeader}>Crime Details</Text>
      <View style={styles.labelValueText}>
        <Text style={styles.labelText}>Case ID: </Text>
        <Text style={styles.valueText}>{item.id}</Text>
      </View>
      <View style={styles.labelValueText}>
        <Text style={styles.labelText}>Date: </Text>
        <Text style={styles.valueText}>{item.date.slice(0, 10)}</Text>
      </View>
      <View style={styles.labelValueText}>
        <Text style={styles.labelText}>Primary Type: </Text>
        <Text style={styles.valueText}>{item.primary_type}</Text>
      </View>
      <View style={styles.labelValueText}>
        <Text style={styles.labelText}>Description: </Text>
        <Text style={styles.valueText}>{item.description}</Text>
      </View>
      <View style={styles.labelValueText}>
        <Text style={styles.labelText}>Year: </Text>
        <Text style={styles.valueText}>{item.year}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const FlatListSearch = () => {
  const {data, error, isLoading} = useQuery({
    queryKey: ['chicagoCrimeData'],
    queryFn: async () => {
      const response = await fetch(
        'https://data.cityofchicago.org/resource/ijzp-q8t2.json?$query=SELECT%0A%20%20%60id%60%2C%0A%20%20%60case_number%60%2C%0A%20%20%60date%60%2C%0A%20%20%60block%60%2C%0A%20%20%60iucr%60%2C%0A%20%20%60primary_type%60%2C%0A%20%20%60description%60%2C%0A%20%20%60location_description%60%2C%0A%20%20%60arrest%60%2C%0A%20%20%60domestic%60%2C%0A%20%20%60beat%60%2C%0A%20%20%60district%60%2C%0A%20%20%60ward%60%2C%0A%20%20%60community_area%60%2C%0A%20%20%60fbi_code%60%2C%0A%20%20%60x_coordinate%60%2C%0A%20%20%60y_coordinate%60%2C%0A%20%20%60year%60%2C%0A%20%20%60updated_on%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%0AORDER%20BY%20%60date%60%20DESC%20NULL%20FIRST',
      );
      return response.json();
    },
    staleTime: () => {
      console.log('staleTime');
      return 1000 * 60 * 5;
    },
    refetchInterval: () => {
      console.log('refetchInterval');
      return 1000 * 60 * 5;
    },
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Crime | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }

    const lowerSearchQuery = debouncedSearchQuery.toLowerCase().trim();
    const filteredData1 = data.filter(
      (item: Crime) =>
        item.id.includes(debouncedSearchQuery) ||
        item.case_number.includes(debouncedSearchQuery) ||
        item.primary_type.toLowerCase().includes(lowerSearchQuery) ||
        item.description.toLowerCase().includes(lowerSearchQuery) ||
        item.location_description?.toLowerCase().includes(lowerSearchQuery) ||
        item.arrest.toString().includes(debouncedSearchQuery) ||
        item.year.includes(debouncedSearchQuery),
    );

    return filteredData1;
  }, [debouncedSearchQuery, data]);

  const renderItem = useCallback(
    ({item}: {item: Crime}) => (
      <Item
        item={item}
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
      />
    ),
    [],
  );
  const handleEndReached = useCallback(() => {
    if (!loadingMore) {
      setLoadingMore(true);
      // Simulating fetching more data
      setTimeout(() => {
        setLoadingMore(false);
      }, 1500);
    }
  }, [loadingMore]);

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return <ActivityIndicator size="small" color="black" />;
  };
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
  if (error) {
    return <Text>Error loading data</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.header}>Chicago Crime Record</Text>
      <TextInput
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <Text style={styles.searchResult}>
        Showing {filteredData.length} results
      </Text>

      {filteredData.length > 0 ? (
        <>
          <Text style={{fontWeight: 'bold', color: '#000', marginBottom: 10}}>
            <Text style={{color: 'red'}}>Note: </Text>
            Tap on Card To View More Detail.
          </Text>
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
          />
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{fontSize: 25, color: '#000'}}>No Data Found</Text>
        </View>
      )}
      {selectedItem && (
        <Modal visible={modalVisible} animationType="fade" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>Crime Details</Text>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Case ID: </Text>
                    <Text style={styles.valueText}>{selectedItem.id}</Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Case Number: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.case_number}
                    </Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Date: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.date.slice(0, 10)}
                    </Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Block: </Text>
                    <Text style={styles.valueText}>{selectedItem.block}</Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Primary Type: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.primary_type}
                    </Text>
                  </View>
                  <View style={{...styles.labelValueText, rowGap: 5}}>
                    <Text style={styles.labelText}>Description: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.description}
                    </Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Location Description: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.location_description}
                    </Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Arrest: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.arrest ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Domestic: </Text>
                    <Text style={styles.valueText}>
                      {selectedItem.domestic ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.labelValueText}>
                    <Text style={styles.labelText}>Year: </Text>
                    <Text style={styles.valueText}>{selectedItem.year}</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

export default FlatListSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    marginTop: '10%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  searchInput: {
    height: 40,
    color: 'black',
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchResult: {
    marginVertical: 2,
    textAlign: 'center',

    color: '#000',
  },
  container: {
    backgroundColor: 'white',
    marginVertical: 10,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,

    shadowRadius: 4,
    padding: 15,
    borderRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  itemContainer: {
    backgroundColor: 'white',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',

    color: '#000',
    marginBottom: 15,
  },
  labelValueText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 15,
    marginBottom: 10,
  },
  labelText: {
    color: '#000',
    fontWeight: 'bold',
  },
  valueText: {
    fontWeight: 'normal',

    color: '#000',
  },
});
