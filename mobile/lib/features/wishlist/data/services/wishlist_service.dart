import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/constants/constants.dart';
import '../../../product_details/data/models/product_card_model.dart';

class WishlistService {
  // Fetch the wishlist for a specific customer
  Future<List<ProductCardModel>> fetchWishlist(String customerID) async {
    try {
      final response = await http.get(
        Uri.parse("$apiBaseURL/v1/customers/me/wishlist?userId=$customerID"),
        headers: {testAuthHeader: testAuthValue},
      );

      final responseData = json.decode(response.body);

      if (response.statusCode == 200 && responseData['status'] == 'success') {
        final List<dynamic> productsJson = responseData['data'];
        return productsJson
            .map((json) => ProductCardModel.fromJson(json))
            .toList();
      } else {
        throw Exception(responseData['message'] ?? 'Failed to load wishlist');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Add a product to the wishlist
  Future<ProductCardModel?> addToWishlist(
    String customerID,
    String productID,
  ) async {
    try {
      final response = await http.post(
        Uri.parse("$apiBaseURL/v1/customers/me/wishlist/items?userId=$customerID"),
        headers: {
          testAuthHeader: testAuthValue,
          'Content-Type': 'application/json',
        },
        body: json.encode({'productId': productID}),
      );

      final responseData = json.decode(response.body);

      // Return the added product if the addition was done successfully
      if (response.statusCode == 200 && responseData['status'] == 'success') {
        final List<dynamic> productsJson = responseData['data'];
        // Return the first product in the returned wishlist
        return ProductCardModel.fromJson(productsJson[0]);
      }

      // Otherwise, return null stating that something went wrong
      return null;
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Remove a product from the wishlist
  Future<bool> removeFromWishlist(String customerID, String productID) async {
    try {
      final response = await http.delete(
        Uri.parse(
          "$apiBaseURL/v1/customers/me/wishlist/items/$productID?userId=$customerID",
        ),
        headers: {testAuthHeader: testAuthValue},
      );

      // Return true if the removal was done successfully
      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
