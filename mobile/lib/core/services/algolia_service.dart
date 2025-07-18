import 'package:algolia/algolia.dart';

class AlgoliaService {
  static Map<String, List<String>> selectedFacets = {};
  static String query='';

  final index = _algolia.index('product');

  static const Algolia _algolia = Algolia.init(
    applicationId: 'AEZ0KDU74P',
    apiKey: 'ad4de708ee025e45a75f2019d8a44280',
  );

  static Algolia get instance => _algolia;

  void addFacets(List<String> facets, String field) {
    List<String> updatedFacets = facets.map((e) => '$field:$e').toList();
    selectedFacets[field] = updatedFacets;
  }

  Future<List<Map<String, dynamic>>> searchProducts(String myQuery) async {
    List<Map<String, dynamic>> prod = [];
    if (myQuery.isNotEmpty) {
      query = myQuery;
    }
    try {
      var response;
      int page = 0;
      bool hasMore = true;

      while (hasMore) {
        if (selectedFacets.isNotEmpty) {
          final facets = buildAlgoliaFilters(selectedFacets.values.toList());
          print('Applying filters: $facets');
          response = await index.query(query).setFilters(facets).setPage(page).getObjects();
        } else {
          response = await index.query(query).setPage(page).getObjects();
        }

        if (response == null || response.hits == null || response.hits.isEmpty) {
          hasMore = false;
        } else {
          prod.addAll(response.hits
              .map((hit) => hit.data)
              .where((hit) => hit != null && hit is Map<String, dynamic>)
              .cast<Map<String, dynamic>>());

          // Check if there are more pages
          if ((page + 1) >= response.nbPages) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      return prod;
    } catch (e) {
      print('Search error: $e');
      return [];
    }
  }

  String buildAlgoliaFilters(List<List<String>> selectedFacets) {
    List<String> andGroups = [];

    for (var facetGroup in selectedFacets) {
      if (facetGroup.isNotEmpty) {
        String orGroup = '(' + facetGroup.map((e) => '${e.split(":")[0]}:"${e.split(":")[1]}"').join(' OR ') + ')';
        andGroups.add(orGroup);
      }
    }

    return andGroups.join(' AND ');
  }

  // ✅ Proper method to get all field names using facets
  Future<List<String>> getStaticNames(String field) async {
    try {
      final response = await index
          .search('') // Empty query to fetch facets only
          .setFacets([field])
          .setHitsPerPage(0)
          .getObjects();

      List<String> fields = [];

      if (response.facets != null && response.facets!.containsKey(field)) {
        final facets = response.facets![field] as Map<String, dynamic>;
        fields = facets.keys.toList();
      }

      print('Fetched field names: $field');
      return fields;
    } catch (e) {
      print('Error fetching field names: $e');
      return [];
    }
  }


}
