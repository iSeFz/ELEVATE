import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/size_config.dart';
import '../../../../core/widgets/product_card.dart';
import '../cubits/product_details_cubit.dart';
import '../cubits/product_details_state.dart';

enum RecommendationType {
  similar,
  customerViewed,
}

class RecommendationSection extends StatelessWidget {
  final String userId;
  final RecommendationType recommendationType;

  const RecommendationSection({
    super.key,
    required this.userId,
    required this.recommendationType,
  });

  String get _title {
    switch (recommendationType) {
      case RecommendationType.similar:
        return "You might also like";
      case RecommendationType.customerViewed:
        return "Customers also viewed";
    }
  }

  String get _loadingText {
    switch (recommendationType) {
      case RecommendationType.similar:
        return "Loading similar products...";
      case RecommendationType.customerViewed:
        return "Loading customer viewed products...";
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProductDetailsCubit, ProductDetailsState>(
      builder: (context, state) {
        if (state is! ProductDetailsLoaded) {
          return SizedBox.shrink();
        }

        final products = recommendationType == RecommendationType.similar
            ? state.similarProducts
            : state.customerViewedProducts;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: 8.0 * SizeConfig.horizontalBlock,
              ),
              child: Text(
                _title,
                style: TextStyle(
                  fontSize: 18 * SizeConfig.textRatio,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            SizedBox(height: 10 * SizeConfig.verticalBlock),
            SizedBox(
              height: 350 * SizeConfig.verticalBlock,
              child: products != null && products.isNotEmpty
                  ? ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(
                        horizontal: 8.0 * SizeConfig.horizontalBlock,
                      ),
                      itemCount: products.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: EdgeInsets.only(
                            right: 12 * SizeConfig.horizontalBlock,
                          ),
                          child: SizedBox(
                            width: 180 * SizeConfig.horizontalBlock,
                            height: 320 * SizeConfig.verticalBlock,
                            child: ProductCard(
                              product: products[index],
                              userId: userId,
                            ),
                          ),
                        );
                      },
                    )
                  : Center(
                      child: Text(
                        _loadingText,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14 * SizeConfig.textRatio,
                        ),
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }
}