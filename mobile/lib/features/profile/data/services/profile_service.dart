import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../auth/data/models/customer.dart';
import '../models/order.dart';
import '../../../../core/constants/constants.dart';

class ProfileService {
  // Fetch the latest customer data from the server
  Future<Customer> refreshCustomer(String customerID) async {
    try {
      final response = await http.get(
        Uri.parse("$apiBaseURL/v1/customers/me?userId=$customerID"),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
      );

      final responseData = jsonDecode(response.body);

      // Return the latest customer data if the fetch was successful
      if (response.statusCode == 200 && responseData['status'] == 'success') {
        final customerData = json.decode(response.body);
        return Customer.fromJson(customerData['data']);
      } else {
        throw Exception('Failed to load customer data');
      }
    } catch (e) {
      throw Exception('Error updating user profile: $e');
    }
  }

  // Update the customer profile with the provided updated customer JSON
  Future<bool> updateCustomer(Map<String, dynamic> updatedCustomerJSON) async {
    // Take a copy from the updated customer JSON passed to preserve its data
    // Any adjustments needed for the request is done on this copy
    Map<String, dynamic> customerRequestBody = updatedCustomerJSON;
    try {
      final response = await http.put(
        Uri.parse(
          "$apiBaseURL/v1/customers/me?userId=${customerRequestBody['id']}",
        ),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
        // Remove the 'id' field from the request body as it can not be updated
        body: json.encode(customerRequestBody..remove('id')),
      );

      // Return true if the update was done successfully
      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error updating user profile: $e');
    }
  }

  // Upload the customer profile image to the firebase storage and get an imageURL
  Future<String> uploadProfileImage(
    String customerID,
    File selectedImage,
  ) async {
    try {
      final storageRef = FirebaseStorage.instance.ref().child(
        'profile-images/${customerID}_${DateTime.now().millisecondsSinceEpoch}_pfp.png',
      );

      // Upload the file to Firebase Storage
      final uploadTask = storageRef.putFile(selectedImage);
      final snapshot = await uploadTask.whenComplete(() {});
      // Get the download URL of the uploaded image
      final downloadURL = await snapshot.ref.getDownloadURL();
      // Return the download URL of the uploaded image
      return downloadURL;
    } catch (e) {
      throw Exception('Error updating profile image: $e');
    }
  }

  // Change the password through redirecting the user to email for password update
  Future<bool> changePassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse("$apiBaseURL/v1/utilities/send-password-reset"),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
        body: json.encode({'email': email}),
      );

      // Return true if the password change request was successful
      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error changing password: $e');
    }
  }

  // Fetch customer orders
  Future<List<Order>> getCustomerOrders(String userId) async {
    try {
      String url = "$apiBaseURL/v1/customers/me/orders?userId=$userId";
      final response = await http.get(
        Uri.parse(url),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
      );
      final responseData = jsonDecode(response.body);
      if (response.statusCode == 200 && responseData['status'] == 'success') {
        if (responseData['data'] != null) {
          return (responseData['data'] as List<dynamic>)
              .map((order) => Order.fromJson(order as Map<String, dynamic>))
              .toList();
        } else {
          return [];
        }
      } else {
        throw Exception('Failed to load customer orders');
      }
    } catch (e) {
      throw Exception('Error fetching customer orders: $e');
    }
  }

  // Cancel customer order
  Future<bool> cancelOrder(String userId, String orderId) async {
    try {
      String url =
          "$apiBaseURL/v1/customers/me/orders/$orderId/cancel?userId=$userId";
      final response = await http.patch(
        Uri.parse(url),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return responseData['status'] == 'success';
      } else {
        throw Exception('Failed to cancel order');
      }
    } catch (e) {
      throw Exception('Error canceling order: $e');
    }
  }

  // Refund products
  Future<bool> refundProducts(
    String userId,
    String orderId,
    List<Map<String, String>> products,
  ) async {
    try {
      String url =
          "$apiBaseURL/v1/customers/me/orders/$orderId/refund?userId=$userId";

      final response = await http.patch(
        Uri.parse(url),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
        body: json.encode({'data': products}),
      );
      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return responseData['status'] == 'success';
      } else {
        throw Exception('Failed to request refund');
      }
    } catch (e) {
      throw Exception('Error requesting refund: $e');
    }
  }
}
