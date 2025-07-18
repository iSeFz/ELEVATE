class OrderItem {
  String id;
  String customerId;
  Address address;
  String phoneNumber;
  int pointsRedeemed;
  String shipmentMethod;
  double shipmentFees;

  OrderItem({
    required this.id,
    required this.customerId,
    required this.address,
    required this.phoneNumber,
    required this.pointsRedeemed,
    required this.shipmentMethod,
    required this.shipmentFees,
  });
}

class Address {
  int building;
  String city;
  String street;
  double latitude;
  double longitude;

  Address({
    required this.building,
    required this.city,
    required this.street,
    required this.latitude,
    required this.longitude,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      building: json['building'] as int? ?? 0,
      city: json['city'] as String? ?? '',
      street: json['street'] as String? ?? '',
      // Handle numeric values safely
      latitude: json['latitude'] is num ? (json['latitude'] as num).toDouble() : 0.0,
      longitude: json['longitude'] is num ? (json['longitude'] as num).toDouble() : 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'building': building,
      'street': street,
      'city': city,
      'latitude': latitude,
      'longitude': longitude,
      'postalCode': 12345,
    };
  }
}
