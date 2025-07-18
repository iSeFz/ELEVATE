import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/constants/constants.dart';
import '../models/customer.dart';
import '../../../../core/utils/google_utils.dart';

class AuthService {
  Future<Customer?> registerUser(Customer customerData) async {
    final response = await http.post(
      Uri.parse("$apiBaseURL/v1/customers/signup"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(
        customerData.toJson()
          ..removeWhere((key, _) => key == 'id' || key == 'loyaltyPoints'),
      ),
    );

    final responseData = jsonDecode(response.body);

    if ((response.statusCode == 201) && responseData['status'] == 'success') {
      final customerJsonFromServer = responseData['data'];

      if (customerJsonFromServer != null) {
        return Customer(
          id: customerJsonFromServer['id'],
          email: customerJsonFromServer['email'],
          username: customerData.username,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phoneNumber: customerData.phoneNumber,
        );
      } else {
        throw Exception(
          responseData['message'] ?? 'User data not found in signup response',
        );
      }
    } else {
      throw Exception(
        responseData['error'] ?? responseData['message'] ?? 'Signup failed',
      );
    }
  }

  Future<Customer?> signUpWithGoogle() async {
    UserCredential? userCredential = await getGoogleUserCredential();
    if (userCredential == null || userCredential.user == null) {
      throw Exception('Google Sign-Up was cancelled or failed.');
    }

    final googleUser = userCredential.user!;

    // Prepare customer data from Google sign-in
    final customerFromGoogle = Customer(
      id: googleUser.uid,
      email: googleUser.email,
      firstName: googleUser.displayName?.split(' ').first ?? 'Guest',
      lastName:
          googleUser.displayName != null &&
                  googleUser.displayName!.split(' ').length > 1
              ? googleUser.displayName!.split(' ').sublist(1).join(' ')
              : '',
      username: googleUser.email?.split('@').first.replaceAll('.', '_') ?? 'guest_user',
      phoneNumber: googleUser.phoneNumber,
      imageURL: googleUser.photoURL,
    );

    final response = await http.post(
      Uri.parse('$apiBaseURL/v1/customers/third-party-signup'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode({
        ...customerFromGoogle.toJson()..removeWhere(
          (key, _) =>
              key == 'addresses' || key == 'loyaltyPoints' || key == 'id',
        ),
        'uid': customerFromGoogle.id,
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 201 && responseData['status'] == 'success') {
      return customerFromGoogle;
    } else {
      throw Exception(
        responseData['message'] ??
            'Failed to register Google user with backend.',
      );
    }
  }

  Future<Customer?> loginUser(String email, String password) async {
    final response = await http.post(
      Uri.parse("$apiBaseURL/v1/customers/login"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{'email': email, 'password': password}),
    );

    final responseData = jsonDecode(response.body);

    if ((response.statusCode == 200) && responseData['status'] == 'success') {
      final customerJsonFromServer = responseData['data']['user'];

      if (customerJsonFromServer != null) {
        Customer customer = Customer.fromJson(customerJsonFromServer);
        customer.token = responseData['data']['accessToken'];
        return customer;
      } else {
        throw Exception(
          responseData['message'] ?? 'User data not found in response',
        );
      }
    } else {
      throw Exception(
        responseData['error'] ?? responseData['message'] ?? 'Login failed',
      );
    }
  }

  Future<Customer?> signInWithGoogleLogin() async {
    UserCredential? userCredential = await getGoogleUserCredential();
    if (userCredential == null || userCredential.user == null) {
      throw Exception('Google Sign-In was cancelled or failed.');
    }

    final userID = userCredential.user!.uid;

    // Retrieve user data from database using the userID
    final response = await http.get(
      Uri.parse("$apiBaseURL/v1/customers/me?userId=$userID"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        testAuthHeader: testAuthValue,
      },
    );

    final responseData = jsonDecode(response.body);

    if ((response.statusCode == 200) && responseData['status'] == 'success') {
      final customerJsonFromServer = responseData['data'];

      if (customerJsonFromServer != null) {
        return Customer.fromJson(customerJsonFromServer);
      } else {
        throw Exception(
          responseData['message'] ?? 'User data not found in response',
        );
      }
    } else if (response.statusCode == 404) {
      // User not found, return null to indicate no account exists
      return null;
    } else {
      throw Exception(
        'Failed to get user data from backend: ${responseData['message']}',
      );
    }
  }

  // Reset the password for the user with the provided email
  Future<bool> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse("$apiBaseURL/v1/utilities/send-password-reset"),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
          testAuthHeader: testAuthValue,
        },
        body: json.encode({'email': email}),
      );

      // Return true if the password reset request was successful
      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error changing password: $e');
    }
  }
}
