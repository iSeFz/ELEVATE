class ProductVariant {
  final String id;
  final String size;
  final int stock;
  final int price;
  final int discount;
  final List<String> colors;
  final List<String> images;

  ProductVariant({
    required this.id,
    required this.size,
    required this.stock,
    required this.price,
    required this.discount,
    required this.colors,
    required this.images,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) => ProductVariant(
    id: json['id'] as String,
    size: json['size'] as String,
    stock: json['stock'] as int,
    price: json['price'] as int,
    discount: json['discount'] as int,
    colors: List<String>.from(json['colors']),
    images: List<String>.from(json['images']),
  );
}
