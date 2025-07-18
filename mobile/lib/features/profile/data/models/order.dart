import '../../../cart/data/models/cart_item.dart';
import 'address.dart';

// Function to parse date
DateTime? _parseDate(dynamic value) {
  if (value == null) return null;
  if (value is String) return DateTime.tryParse(value);
  if (value is Map && value.containsKey('_seconds')) {
    return DateTime.fromMillisecondsSinceEpoch(value['_seconds'] * 1000);
  }
  return null;
}

class Order {
  String? id;
  String? customerId;
  String? status;
  UserAddress? address;
  String? phoneNumber;
  int? pointsRedeemed;
  int? pointsEarned;
  double? price;
  List<CartItem>? products;
  String? paymentMethod;
  Shipment? shipment;
  DateTime? createdAt;
  DateTime? updatedAt;

  Order({
    this.id,
    this.customerId,
    this.status,
    this.address,
    this.phoneNumber,
    this.pointsRedeemed,
    this.pointsEarned,
    this.price,
    this.products,
    this.paymentMethod,
    this.shipment,
    this.createdAt,
    this.updatedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final orderCreatedAt = _parseDate(json['createdAt']);
    final status = json['status'];
    
    return Order(
      id: json['id'],
      customerId: json['customerId'],
      status: status,
      address: json['address'] != null ? UserAddress.fromJson(json['address']) : null,
      phoneNumber: json['phoneNumber'],
      pointsRedeemed: json['pointsRedeemed'],
      pointsEarned: json['pointsEarned'],
      price: json['price'] is num ? (json['price'] as num).toDouble() : null,
      products: json['products'] != null
          ? (json['products'] as List<dynamic>)
              .map((product) => CartItem.fromJson(product))
              .toList()
          : null,
      paymentMethod: "Cash on Delivery",
      shipment: json['shipment'] != null 
          ? Shipment.fromJson(json['shipment'], orderCreatedAt, status) 
          : null,
      createdAt: orderCreatedAt,
      updatedAt: _parseDate(json['updatedAt']),
    );
  }
}

class Shipment {
  DateTime? createdAt;
  DateTime? deliveredAt; // Only set for delivered orders
  DateTime? estimatedDeliveryDate; // For all orders
  double? totalFees;
  int? estimatedDeliveryDays;
  String? method;

  double? get fees => totalFees;

  Shipment({
    this.createdAt,
    this.deliveredAt,
    this.estimatedDeliveryDate,
    this.totalFees,
    this.estimatedDeliveryDays,
    this.method,
  });

  factory Shipment.fromJson(Map<String, dynamic> json, [DateTime? orderCreatedAt, String? orderStatus]) {
    final estimatedDeliveryDays = json['estimatedDeliveryDays'] as int?;
    
    DateTime? deliveredAt;
    DateTime? estimatedDeliveryDate;
    
    // For delivered orders, use the actual deliveredAt date
    if (orderStatus == 'delivered') {
      deliveredAt = _parseDate(json['deliveredAt']);
    }
    
    // For all orders, calculate the estimatedDeliveryDate
    if (orderCreatedAt != null && estimatedDeliveryDays != null) {
      estimatedDeliveryDate = orderCreatedAt.add(Duration(days: estimatedDeliveryDays));
    }
    
    return Shipment(
      createdAt: _parseDate(json['createdAt']),
      deliveredAt: deliveredAt, // Only set for delivered orders
      estimatedDeliveryDate: estimatedDeliveryDate, // For all orders
      totalFees: json['totalFees'] is num ? (json['totalFees'] as num).toDouble() : null,
      estimatedDeliveryDays: estimatedDeliveryDays,
      method: json['method'],
    );
  }
}
