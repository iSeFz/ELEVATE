import 'dart:convert';

class Brand {
  final String id;
  final String brandName;
  final String imageURL;
  Brand({required this.id, required this.brandName, required this.imageURL});
  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['id'] ?? '',
      brandName: json['brandName'] ?? '',
      imageURL: json['imageURL'] ?? '',
    );
  }
} 