import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/constants/constants.dart';

class OrderService {
  static Future<Map<String, dynamic>?> fetchCustomerData(String userId) async {
    final url = "$apiBaseURL/v1/customers/me?userId=$userId";
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {testAuthHeader: testAuthValue},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      }
    } catch (e) {
      throw Exception('Error fetching customer data: $e');
    }
    return null;
  }

  static Future<void> releaseItems(String orderId, String userId) async {
    if (orderId.isEmpty) return;
    final url = "$apiBaseURL/v1/customers/me/orders/$orderId?userId=$userId";
    try {
      await http.delete(
        Uri.parse(url),
        headers: {testAuthHeader: testAuthValue},
      );
    } catch (e) {
      throw Exception('Error releasing order items: $e');
    }
  }

  static Future<double> calculateShipmentFees(
    String orderId,
    String userId,
    String requestBody,
  ) async {
    final url = "$apiBaseURL/v1/customers/me/orders/$orderId/calculate-shipment-fees?userId=$userId";

    try {
      final response = await http.put(
        Uri.parse(url),
        headers: {
          testAuthHeader: testAuthValue,
          "Content-Type": "application/json",
        },
        body: requestBody,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['data']['totalFees'] as num).toDouble();
      }
    } catch (e) {
      throw Exception('Error calculating shipment fees: $e');
    }
    return 0.0;
  }

  static Future<bool> confirmOrder(
    String orderId,
    String userId,
    String phoneNumber,
  ) async {
    final url = "$apiBaseURL/v1/customers/me/orders/$orderId/confirm?userId=$userId";

    final requestBody = jsonEncode({
      "phoneNumber": phoneNumber,
      "pointsRedeemed": 0,
      "payment": {
        "method": "Cash on delivery",
        "credentials": "1234567812345678",
      },
    });

    try {
      final response = await http.put(
        Uri.parse(url),
        headers: {
          testAuthHeader: testAuthValue,
          "Content-Type": "application/json",
        },
        body: requestBody,
      );
      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error placing order: $e');
    }
  }
}
