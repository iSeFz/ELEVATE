import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/size_config.dart';
import '../../data/models/review_model.dart';
import '../cubits/review_cubit.dart';
import '../cubits/review_state.dart';

class CreateReviewPage extends StatefulWidget {
  final String productId;

  final dynamic review;

  const CreateReviewPage({super.key, required this.productId, this.review});

  @override
  State<CreateReviewPage> createState() => _CreateReviewPageState();
}

class _CreateReviewPageState extends State<CreateReviewPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final ValueNotifier<int> _rating = ValueNotifier<int>(0);

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _rating.dispose();
    super.dispose();
  }

  Future<void> _submitForm(BuildContext context) async {
    final cubit = context.read<ReviewCubit>();
    if (!_formKey.currentState!.validate()) {
      return; // Stop if title or content are empty
    }
    if (_rating.value == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a rating')),
      );
      return; // Stop submission if no rating selected
    }


    final review = ReviewModel(
      productId: widget.productId,
      title: _titleController.text,
      content: _contentController.text,
      rating: _rating.value,
    );

    if (widget.review != null && widget.review.id != null) {
      review.id = widget.review.id;
      review.customerFirstName= widget.review.customerFirstName;
      review.customerLastName= widget.review.customerLastName;
      review.customerImageURL= widget.review.customerImageURL;
      cubit.editReview(review);
    } else {
      cubit.createReview(review);
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.review != null) {
      _titleController.text = widget.review.title ?? '';
      _contentController.text = widget.review.content ?? '';
      _rating.value = widget.review.rating ?? 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Write a Review'),
        centerTitle: true,
      ),
      body: BlocConsumer<ReviewCubit, ReviewState>(
        listener: (context, state) {
          if (state is ReviewSuccess) {
            // ScaffoldMessenger.of(context).showSnackBar(
            //   const SnackBar(content: Text('Task done successfully!')),
            // );
            Navigator.pop(context, true);
          }
          else if (state is ReviewError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('${state.message}')),
            );
          }

        },
        builder: (context, state) {
          // if (state is ReviewLoading) {
          //   return const Center(child: CircularProgressIndicator());
          // }
          return Center (
              child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 30* SizeConfig.horizontalBlock, vertical: 16* SizeConfig.verticalBlock),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextFormField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      labelText: 'Title',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12), // Set the circular border here
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a review title';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 20*SizeConfig.verticalBlock),
                  TextFormField(
                    controller: _contentController,
                    decoration: InputDecoration(
                      labelText: 'Content',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12), // Circular border here too
                      ),
                    ),
                    maxLines: 2,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please write your review';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 30),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return ValueListenableBuilder<int>(
                        valueListenable: _rating,
                        builder: (context, value, _) => IconButton(
                          icon: Icon(
                            index < value ? Icons.star : Icons.star_border,
                            color: Colors.amber,
                            size: 32,
                          ),
                          onPressed: () {
                            _rating.value = index + 1;
                          },
                        ),
                      );
                    }),
                  ),
                  SizedBox(height: 15*SizeConfig.verticalBlock),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: state is ReviewLoading ? null : () => _submitForm(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.secondary,
                        padding: EdgeInsets.symmetric(vertical: 10 * SizeConfig.verticalBlock),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      child: state is ReviewLoading
                          ? CircularProgressIndicator(color: Colors.grey[200])
                          : Text(
                        'Submit Review',
                        style: TextStyle(color: theme.colorScheme.onPrimary),
                      ),
                    ),
                  ),
                  SizedBox(height: 20 * SizeConfig.verticalBlock),

                  // Delete Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if (widget.review != null) {
                          context.read<ReviewCubit>().deleteReview(widget.review);
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('No review to delete')),
                          );
                        }
                      },

                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary,
                        padding: EdgeInsets.symmetric(vertical: 10 * SizeConfig.verticalBlock),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      child: Text(
                        'Delete Review',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ),

                ],
              ),
            ),)
          );
        },
      ),
    );
  }
}
