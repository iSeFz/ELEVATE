import '../../data/models/review_model.dart';

abstract class ReviewState {
  get reviews => null;
}

class ReviewInitial extends ReviewState {}

class ReviewLoading extends ReviewState {}

class ReviewLoaded extends ReviewState {
  final List<ReviewModel> reviews;
  ReviewLoaded(this.reviews);
}

class ReviewError extends ReviewState {
  final String message;
  ReviewError(this.message);
}
