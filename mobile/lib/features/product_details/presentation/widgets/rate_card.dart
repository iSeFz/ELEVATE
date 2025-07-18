import 'package:elevate/features/product_details/presentation/screens/create_review_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/utils/size_config.dart';
import '../../data/models/review_model.dart';
import '../cubits/review_cubit.dart';
class RateCard extends StatelessWidget {
  final ReviewModel review;

  const RateCard({super.key, required this.review});

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ReviewCubit>();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: double.infinity,
          padding: EdgeInsets.only(
            top: 24 * SizeConfig.verticalBlock,
            left: 12 * SizeConfig.horizontalBlock,
            right: 12 * SizeConfig.horizontalBlock,
            bottom: 16 * SizeConfig.verticalBlock,
          ),
          margin: EdgeInsets.only(top: 16 * SizeConfig.verticalBlock),
          decoration: BoxDecoration(
            color: const Color(0xFFF2F2F2),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[300]!, width: 0.5),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 12 * SizeConfig.horizontalBlock,
              vertical: 12 * SizeConfig.verticalBlock,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      review.title,
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 14 * SizeConfig.textRatio,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12 * SizeConfig.verticalBlock),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      review.content,
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 12 * SizeConfig.textRatio,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (cubit.canEditReview(review))
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => BlocProvider.value(
                                value: cubit,
                                child: CreateReviewPage(
                                  productId: review.productId,
                                  review: review,
                                ),
                              ),
                            ),
                          );
                        },
                        child: Icon(
                          Icons.edit,
                          color: Colors.blueAccent,
                          size: 20 * SizeConfig.textRatio,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
        Positioned(
          top: -5,
          left: 0,
          child: Row(
            children: [
              CircleAvatar(
                radius: 21 * SizeConfig.verticalBlock,
                backgroundImage: NetworkImage(review.customerImageURL!),
              ),
              Container(
                padding: EdgeInsets.symmetric(
                    horizontal: 6 * SizeConfig.horizontalBlock,
                    vertical: 2 * SizeConfig.verticalBlock),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.only(
                    topRight: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                  border: Border(
                    top: BorderSide(color: Colors.black12),
                    right: BorderSide(color: Colors.black12),
                    bottom: BorderSide(color: Colors.black12),
                  ),
                ),
                child: Text(
                  '${review.customerFirstName!} ${review.customerLastName![0]}.',
                  style: TextStyle(
                      fontSize: 12 * SizeConfig.textRatio,
                      color: const Color(0xFF160202)),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          top: 5,
          right: 3,
          child: Container(
            padding: EdgeInsets.symmetric(
                horizontal: 6 * SizeConfig.horizontalBlock,
                vertical: 4 * SizeConfig.verticalBlock),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                ...List.generate(
                  review.rating,
                      (index) => Icon(Icons.star,
                      size: 12 * SizeConfig.verticalBlock, color: Colors.amber),
                ),
                ...List.generate(
                  5 - review.rating,
                      (index) => Icon(Icons.star,
                      size: 12 * SizeConfig.verticalBlock,
                      color: Colors.grey[300]!),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
