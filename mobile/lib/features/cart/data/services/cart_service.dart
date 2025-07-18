import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/constants/constants.dart';
import '../models/cart_item.dart';

class CartService {
  Future<List<CartItem>> fetchCartItems(String userId) async {
    final url = "$apiBaseURL/v1/customers/me/cart?userId=$userId";
    final response = await http.get(
      Uri.parse(url),
      headers: {testAuthHeader: testAuthValue},
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      final cartData = data['data'];
      final List<dynamic> itemsJson = cartData['items'] ?? [];
      return itemsJson.map((json) => CartItem.fromJson(json)).toList();
    } else {
      throw Exception(data['message'] ?? 'Failed to load cart items.');
    }
  }

  Future<CartItem> addItem(
      String userId,
      String productId,
      String variantId,
      int quantity,
      ) async {
    final url = "$apiBaseURL/v1/customers/me/cart/items?userId=$userId";
    final response = await http.post(
      Uri.parse(url),
      headers: {
        testAuthHeader: testAuthValue,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'productId': productId,
        'variantId': variantId,
        'quantity': quantity,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to add item to cart. ${response.body}');
    }

    final data = jsonDecode(response.body);

    final List<dynamic> items = data['data']['items'];

    if (items.isNotEmpty) {
      // return the first item
      return CartItem.fromJson(items.first);
    } else {
      throw Exception('Cart item not found in response.');
    }
  }


  Future<void> updateQuantity(
    String userId,
    String cartItemId,
    int newQuantity,
  ) async {
    final url =
        "$apiBaseURL/v1/customers/me/cart/items/$cartItemId?userId=$userId";
    final response = await http.put(
      Uri.parse(url),
      headers: {
        testAuthHeader: testAuthValue,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'quantity': newQuantity}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update quantity.');
    }
  }

  Future<void> removeItem(String userId, String cartItemId) async {
    final url =
        "$apiBaseURL/v1/customers/me/cart/items/$cartItemId?userId=$userId";
    final response = await http.delete(
      Uri.parse(url),
      headers: {testAuthHeader: testAuthValue},
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to remove item. ${response.body}');
    }
  }

  Future<String> proceedToCheckout(
    String userId,
    List<CartItem> cartItems,
  ) async {
    final url = "$apiBaseURL/v1/customers/me/orders?userId=$userId";
    final products =
        cartItems
            .map(
              (item) => {
                "variantId": item.variantId,
                "productId": item.productId,
                "quantity": item.quantity,
              },
            )
            .toList();
    final response = await http.post(
      Uri.parse(url),
      headers: {
        testAuthHeader: testAuthValue,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({"products": products}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data['id'] ?? data['data']?['id'];
    } else {
      throw Exception('Failed to reserve items for checkout.');
    }
  }

  Future<int> fetchProductStock(String productId, String variantId) async {
    final url = "$apiBaseURL/v1/products/$productId/variants/$variantId";
    final response = await http.get(
      Uri.parse(url),
      headers: {testAuthHeader: testAuthValue},
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['data']['stock'] ?? 0;
    } else {
      throw Exception('Failed to fetch product stock.');
    }
  }
}
