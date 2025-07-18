import 'package:elevate/features/product_details/data/models/product_variant_model.dart';

class ProductDetailsModel {
  final String id;
  final String brandId;
  final String brandOwnerId;
  // final int brandSubscriptionPlan;
  final String category;
  final String description;
  final String material;
  final List<String> department;
  // final DateTime updatedAt;
  final List<ProductVariant> variants;

  // Derived attributes
  final String color;
  final int price;
  final List<String> images;

  ProductDetailsModel({
    required this.id,
    required this.brandId,
    required this.brandOwnerId,
    // required this.brandSubscriptionPlan,
    required this.category,
    required this.description,
    required this.material,
    required this.department,
    // required this.updatedAt,
    required this.variants,
    required this.color,
    required this.price,
    required this.images,

  });

  factory ProductDetailsModel.fromJson(Map<String, dynamic> json) {
    final variantList = (json['variants'] as List)
        .map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
        .toList();

    final firstVariant = variantList.isNotEmpty ? variantList.first : null;

    return ProductDetailsModel(
      id: json['id']?.toString() ?? json['objectID']?.toString() ?? '',
      brandId: json['brandId'] as String,
      brandOwnerId: json['brandOwnerId'] as String,
      // brandSubscriptionPlan: json['brandSubscriptionPlan'] as int,
      category: json['category'] as String,
      description: json['description'] as String,
      material: json['material'] as String,
      department: (json['department'] as List<dynamic>)
          .map((e) => e.toString())
          .toList(),
      // createdAt: DateTime.fromMillisecondsSinceEpoch(
      //   (json['createdAt']['_seconds'] * 1000),
      // ),
      // updatedAt: DateTime.fromMillisecondsSinceEpoch(
      //   (json['updatedAt']['_seconds'] * 1000),
      // ),
      variants: variantList,
      color: firstVariant?.colors.first ?? '',
      price: firstVariant?.price ?? 0,
      images: firstVariant?.images ?? const <String>[],
    );
  }
}

