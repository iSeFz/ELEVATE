abstract class FilterState {}

class SearchLoading extends FilterState {}
class SearchInitial extends FilterState {}
class SearchEmpty extends FilterState {}
class SearchLoaded extends FilterState {}
class SearchError extends FilterState {
  final String message;
  SearchError(this.message);
}
class ImageLoading extends FilterState {}
class ImageLoaded extends FilterState {}
class ImageError extends FilterState {
  final String message;
  ImageError(this.message);
}


class FilterInitial extends FilterState {}
class FilterLoading extends FilterState {}

class FilterLoaded extends FilterState {// Categories

  FilterLoaded();
}

class FilterError extends FilterState {
  final String message;
  FilterError(this.message);
}

