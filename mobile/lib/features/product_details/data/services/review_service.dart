import 'dart:convert';
import 'package:elevate/core/constants/constants.dart';
import 'package:http/http.dart' as http;
import '../models/review_model.dart';

class ReviewService {

  // ProductService({required this.baseUrl});

  static Future<List<ReviewModel>> getProductReviews(String productId) async {
    final response = await http.get(
      Uri.parse('$apiBaseURL/v1/products/$productId/reviews'),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = json.decode(response.body);
      final List<dynamic> reviewsJson = jsonResponse['data'] ?? [];

      return reviewsJson.map((json) => ReviewModel.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Failed to load product reviews');
    }
  }

  static Future<void> createProductReview(ReviewModel review) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseURL/v1/products/${review.productId}/reviews?userId=${review.customerId}'),
        headers: {
          'Content-Type': 'application/json',
          testAuthHeader: testAuthValue,
        },
        body: jsonEncode(review.toJson()),
      );

      print('Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode != 201) {
        if(response.statusCode == 403) {
          review.id = '-1';
          return;
        }
        throw Exception('Failed to create review: ${response.body}  ${review.productId}');
      }
      else{
        review.id = jsonDecode(response.body)['data']['id']; // Assuming the response contains the new review ID
      }
    } catch (e) {
      print('Error in createProductReview: $e');
      rethrow;
    }
  }

  static Future<void> updateProductReview(ReviewModel review) async {
    try {
      final response = await http.put(
        Uri.parse('$apiBaseURL/v1/reviews/${review.id}?userId=${review.customerId}'),
        headers: {
          'Content-Type': 'application/json',
          testAuthHeader: testAuthValue,
        },
        body: jsonEncode(review.toJson()),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update review: ${response.body}');
      }
    } catch (e) {
      print('Error in updateProductReview: $e');
      rethrow;
    }
  }

  static Future<void> deleteProductReview(ReviewModel review) async {
    try {
      final response = await http.delete(
        Uri.parse('$apiBaseURL/v1/reviews/${review.id}?userId=${review.customerId}'),
        headers: {
          'Content-Type': 'application/json',
          testAuthHeader: testAuthValue,
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete review: ${response.body}');
      }
    } catch (e) {
      print('Error in deleteProductReview: $e');
      rethrow;
    }
  }


}
