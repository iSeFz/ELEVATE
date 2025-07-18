import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../../../core/constants/constants.dart';
import '../models/brand_model.dart';

class BrandService {
  static Future<List<Brand>> fetchBrands({int page = 1}) async {
    try {
      final response = await http.get(Uri.parse('$apiBaseURL/v1/brands?page=$page'));
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        if (jsonResponse.containsKey('data') && jsonResponse['data'] is List) {
          final List<dynamic> brandsJson = jsonResponse['data'];
          return brandsJson.map((json) => Brand.fromJson(json)).toList();
        } else {
          return [];
        }
      } else {
        throw Exception('Failed to load brands: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching brands: $e');
    }
  }
} 