import 'package:elevate/features/product_details/data/models/product_variant_model.dart';

class ProductCardModel {
  final String id;
  // final String brandId;
  final String brandName;
  // final String brandOwnerId;
  // final int brandSubscriptionPlan;
  // final String category;
  // final String description;
  // final String material;
  final String name;
  // final DateTime createdAt;
  // final DateTime updatedAt;
  // final List<ProductVariant> variants;

  // Derived attributes
  // final String color;
  final int price;
  final String image;

  ProductCardModel({
    required this.id,
    // required this.brandId,
    required this.brandName,
    // required this.brandOwnerId,
    // required this.brandSubscriptionPlan,
    // required this.category,
    // required this.description,
    // required this.material,
    required this.name,
    // required this.createdAt,
    // required this.updatedAt,
    // required this.variants,
    // required this.color,
    required this.price,
    required this.image,

  });

  factory ProductCardModel.fromJson(Map<String, dynamic> json) {
    final variantList = (json['variants'] as List?)
        ?.map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
        .toList() ?? [];
    final firstVariant = variantList.isNotEmpty ? variantList.first : null;

    return ProductCardModel(
      id: json['id']?.toString() ?? json['objectID']?.toString() ?? json['productId']?.toString() ?? '',
      // brandId: json['brandId'] as String,
      brandName: json['brandName'] as String,
      // brandOwnerId: json['brandOwnerId'] as String,
      // brandSubscriptionPlan: json['brandSubscriptionPlan'] as int,
      // category: json['category'] as String,
      // description: json['description'] as String,
      // material: json['material'] as String,
      name: json['name'] as String,
      // createdAt: DateTime.fromMillisecondsSinceEpoch(
      //   (json['createdAt']['_seconds'] * 1000),
      // ),
      // updatedAt: DateTime.fromMillisecondsSinceEpoch(
      //   (json['updatedAt']['_seconds'] * 1000),
      // ),
      // variants: variantList,
      // color: json['color']?.toString() ?? firstVariant?.colors.first ?? '',
      price: (json['price'] as int?)?? (firstVariant?.price.toInt())?? 0,
      image: json['imageURL']?.toString() ??firstVariant?.images.first.toString() ?? '',
    );
  }
}

