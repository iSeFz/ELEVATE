import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product_card_model.dart';
import '../models/product_details_model.dart';
import '../../../../core/constants/constants.dart';

class ProductService {
  // Retrieve a single page of products
  Future<List<ProductCardModel>> getProductPage(int pageNumber) async {
    try {
      final response = await http.get(
        Uri.parse('$apiBaseURL/v1/products?page=$pageNumber'),
      );

      final Map<String, dynamic> jsonResponse = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> productsJson = jsonResponse['data'];
        return productsJson
            .map((json) => ProductCardModel.fromJson(json))
            .toList();
      } else {
        throw Exception('Failed to load products');
      }
    } catch (e) {
      throw Exception('Error fetching products: $e');
    }
  }

  static Future<ProductDetailsModel> getProductDetails(String productId) async {
    final response = await http.get(
      Uri.parse('$apiBaseURL/v1/products/$productId'),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = json.decode(response.body);
      return ProductDetailsModel.fromJson(jsonResponse['data']);
    } else {
      throw Exception('Failed to load product details');
    }
  }

  static Future<List<ProductCardModel>> getSimilarProducts(
    String productId,
  ) async {
    return _getRecommendedProducts(
      productId: productId,
      model: "looking-similar",
      errorPrefix: "Failed to load similar products",
    );
  }

  static Future<List<ProductCardModel>> getCustomerViewedProducts(
    String productId,
  ) async {
    return _getRecommendedProducts(
      productId: productId,
      model: "related-products",
      errorPrefix: "Failed to load customer viewed products",
    );
  }

  static Future<List<ProductCardModel>> _getRecommendedProducts({
    required String productId,
    required String model,
    required String errorPrefix,
  }) async {
    final body = {
      "requests": [
        {
          "indexName": "product",
          "model": model,
          "objectID": productId,
          "threshold": 0,
          "maxRecommendations": 5,
          "queryParameters": {
            "attributesToRetrieve": [
              "objectID",
              "brandName",
              "name",
              "variants",
            ],
          },
        },
      ],
    };

    try {
      final response = await http.post(
        Uri.parse(algoliaBaseURL),
        headers: {
          algoliaAppIDHeader: algoliaAppIDValue,
          algoliaAPIKeyHeader: algoliaAPIKeyValue,
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);

        if (jsonResponse.containsKey('results') &&
            jsonResponse['results'].isNotEmpty &&
            jsonResponse['results'][0].containsKey('hits')) {
          final List<dynamic> hits = jsonResponse['results'][0]['hits'];

          return hits.map<ProductCardModel>((json) {
            // Extract the first variant for image and price
            final variants = json['variants'] as List;
            final firstVariant = variants.isNotEmpty ? variants[0] : null;
            final images =
            firstVariant != null && firstVariant['images'] != null
                ? firstVariant['images'] as List
                : [];

            return ProductCardModel(
              id: json['objectID'],
              brandName: json['brandName'],
              name: json['name'],
              price: firstVariant != null ? firstVariant['price'] : 0,
              image: images.isNotEmpty ? images[0] : '',
            );
          }).toList();
        }
        return [];
      } else {
        throw Exception('$errorPrefix: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('$errorPrefix: $e');
    }
  }

  Future<List<ProductCardModel>> getProductsByDepartment(
    String department,
    int page,
  ) async {
    try {
      final response = await http.get(
        Uri.parse('$apiBaseURL/v1/products?department=$department&page=$page'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);

        // Check if 'data' key exists and is a List
        if (jsonResponse.containsKey('data') && jsonResponse['data'] is List) {
          final List<dynamic> productsJson = jsonResponse['data'];
          return productsJson
              .map((json) => ProductCardModel.fromJson(json))
              .toList();
        } else {
          // Return empty list if data structure is unexpected
          return [];
        }
      } else {
        throw Exception(
          'Failed to load products for department $department: ${response.statusCode}',
        );
      }
    } catch (e) {
      // Return empty list instead of throwing to prevent app crash
      print('Error fetching products for department $department: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> getProductsByBrand({
    required String brandId,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$apiBaseURL/v1/products?brand=$brandId&page=$page&limit=$limit'),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        final List<ProductCardModel> products = (jsonResponse['data'] as List)
            .map((json) => ProductCardModel.fromJson(json))
            .toList();
        final pagination = jsonResponse['pagination'] ?? {};
        return {
          'products': products,
          'pagination': pagination,
        };
      } else {
        throw Exception('Failed to load products for brand $brandId: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching products for brand $brandId: $e');
    }
  }

  Future<List<ProductCardModel>> getTopRatedProducts({int page = 1}) async {
    try {
      final response = await http.get(
        Uri.parse('$apiBaseURL/v1/products/top-rated?page=$page'),
      );

      final Map<String, dynamic> jsonResponse = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> productsJson = jsonResponse['data'];
        return productsJson
            .map((json) => ProductCardModel.fromJson(json))
            .toList();
      } else {
        throw Exception('Failed to load top rated products');
      }
    } catch (e) {
      throw Exception('Error fetching top rated products: $e');
    }
  }

  static Future<List<String>> getAllCategories() async {
    final response = await http.get(
            Uri.parse('$apiBaseURL/v1/products/categories'));
    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = json.decode(response.body);
      final List<dynamic> rawList = jsonResponse['data'];

      // Cast each item to String
      final List<String> departments = rawList.map((item) => item.toString()).toList();

      return departments;
    } else {
      throw Exception('Failed to load departments');
    }
  }
  static Future<List<String>> getAllDepartments() async {
    final response = await http.get(
        Uri.parse('$apiBaseURL/v1/products/departments'));
    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = json.decode(response.body);
      final List<dynamic> rawList = jsonResponse['data'];

      // Cast each item to String
      final List<String> departments = rawList.map((item) => item.toString()).toList();

      return departments;
    } else {
      throw Exception('Failed to load departments');
    }
  }

  static Future<List<String>> getAllSizes() async {
    final response = await http.get(
      Uri.parse('$apiBaseURL/v1/products/sizes'),
    );
    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = json.decode(response.body);
      final List<dynamic> rawList = jsonResponse['data'];

      // Cast each item to String
      final List<String> sizes = rawList.map((item) => item.toString()).toList();

      return sizes;
    } else {
      throw Exception('Failed to load sizes');
    }
  }

  Future<List<ProductCardModel>> getImageSearchProducts({
    required String imageUrl,
    int limit = 10,
  }) async {
    final response = await http.get(
      Uri.parse('$apiBaseURL/v1/utilities/image-search')
          .replace(queryParameters: {
        'imageUrl': imageUrl,
        'limit': '$limit',
      }),
    );

    if (response.statusCode == 200) {
      final jsonResponse = json.decode(response.body);

      return (jsonResponse['data']['results'] as List)
          .map((json) => ProductCardModel.fromJson(json['product']))
          .toList();
    } else {
      throw Exception('Failed to search products by image');
    }
  }


}





