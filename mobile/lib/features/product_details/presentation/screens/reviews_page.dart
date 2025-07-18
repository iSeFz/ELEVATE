import 'package:elevate/features/product_details/presentation/widgets/rate_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/size_config.dart';
import '../../data/models/review_model.dart';
import '../cubits/review_cubit.dart';
import '../cubits/review_state.dart';
import 'create_review_page.dart';

class ReviewsPage extends StatelessWidget {
  final String productId;

  const ReviewsPage({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ReviewCubit, ReviewState>(
      builder: (context, state) {
        if (state is ReviewInitial || state is ReviewLoading) {
          return Scaffold(
            appBar: AppBar(
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              title: const Text(
                  'Reviews', style: TextStyle(fontWeight: FontWeight.bold)),
              centerTitle: true,
              backgroundColor: Colors.white,
              elevation: 0,
            ),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        if (state is ReviewError) {
          return Scaffold(
            appBar: AppBar(
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              title: const Text(
                  'Reviews', style: TextStyle(fontWeight: FontWeight.bold)),
              centerTitle: true,
              backgroundColor: Colors.white,
              elevation: 0,
            ),
            body: Center(child: Text('${state.message}')),
          );
        }

        List<ReviewModel> reviews = context
            .read<ReviewCubit>()
            .reviews
            .where((review) => review.productId == productId)
            .toList();

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
                'Reviews', style: TextStyle(fontWeight: FontWeight.bold)),
            centerTitle: true,
            elevation: 0,
            backgroundColor: Colors.white,
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                color: Colors.grey[300],
                height: 1,
              ),
            ),
          ),
          body: reviews.isEmpty
              ? const Center(child: Text('No reviews yet.'))
              : SingleChildScrollView(
            padding: EdgeInsets.symmetric(
                horizontal: 24 * SizeConfig.horizontalBlock,
                vertical: 26 * SizeConfig.verticalBlock),
            child: Column(
              children: reviews.map((review) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: RateCard(review: review),
                );
              }).toList(),
            ),
          ),
          bottomNavigationBar: ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            child: Container(
              padding: EdgeInsets.symmetric(
                  horizontal: 13 * SizeConfig.horizontalBlock),
              height: 60,
              color: Theme
                  .of(context)
                  .colorScheme
                  .primary
                  .withOpacity(0.2),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    icon: const Icon(Icons.add, size: 30),
                    onPressed: () async {
                      final cubit = context.read<ReviewCubit>();

                      if (cubit.canCustomerReview(productId) == 0) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text(
                              'You have already reviewed this product.')),
                        );
                        return;
                      }

                      // Navigate and wait for result
                      final result = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              BlocProvider.value(
                                value: cubit, // Pass existing cubit
                                child: CreateReviewPage(productId: productId),
                              ),
                        ),

                      );
                      if (result == true) {
                        context.read<ReviewCubit>().fetchProductReviews(
                            productId);
                      }
                    },
                  ),
                ],
              ),
            ),
          ),

        );
      },
    );
  }
}
