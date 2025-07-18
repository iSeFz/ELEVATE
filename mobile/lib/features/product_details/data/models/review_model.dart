class ReviewModel {
  String productId;
  String? id;
  String? customerId;
  String? customerFirstName;
  String? customerLastName;
  String? customerImageURL;

  final String title;
  final String content;
  final int rating;

  ReviewModel({
    this.id,
    required this.productId,
    this.customerId,
    this.customerFirstName,
    this.customerLastName,
    this.customerImageURL,
    required this.title,
    required this.content,
    required this.rating,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) => ReviewModel(
    id: json['id'] as String,
    productId: json['productId'] as String,
    customerId: json['customerId'] as String?,
    customerFirstName: json['customerFirstName'] as String?,
    customerLastName: json['customerLastName'] as String?,
    customerImageURL: json['customerImageURL'] as String? ??
        'https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/',
    title: json['title'] as String,
    content: json['content'] as String,
    rating: json['rating'] as int,
  );

  Map<String, dynamic> toJson() => {
    'title': title,
    'content': content,
    'rating': rating,
  };
}
