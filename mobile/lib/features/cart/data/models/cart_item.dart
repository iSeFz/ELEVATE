class CartItem {
  String? id;
  String productId;
  String variantId;
  int quantity;
  String brandName;
  String productName;
  int? productStock;
  String? refundStatus;
  String size;
  List<String> colors;
  int price;
  String imageURL;

  CartItem({
    this.id,
    required this.productId,
    required this.variantId,
    required this.quantity,
    required this.brandName,
    required this.productName,
    required this.size,
    required this.colors,
    required this.price,
    required this.imageURL,
    this.refundStatus,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      productId: json['productId'],
      variantId: json['variantId'],
      quantity: json['quantity'],
      brandName: json['brandName'],
      productName: json['productName'],
      size: json['size'],
      colors:
          (json['colors'] as List<dynamic>?)
              ?.map((c) => c.toString())
              .toList() ??
          [],
      price: json['price'] as int,
      imageURL: json['imageURL'],
      refundStatus: json['refundStatus'],
    );
  }
}
