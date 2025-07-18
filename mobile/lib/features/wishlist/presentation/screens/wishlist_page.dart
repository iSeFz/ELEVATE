import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/widgets/product_card.dart';
import '../cubits/wishlist_cubit.dart';
import '../cubits/wishlist_state.dart';

// Wishlist Page
class WishlistPage extends StatelessWidget {
  final String userID;
  const WishlistPage({super.key, required this.userID});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final theme = Theme.of(context);

    return BlocProvider<WishlistCubit>(
      create: (context) => WishlistCubit()..fetchWishlist(userID),
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: Text(
            'Wishlist',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          centerTitle: true,
        ),
        body: BlocConsumer<WishlistCubit, WishlistState>(
          listener: (context, state) {
            if (state is WishlistProductRemoved) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Product removed from wishlist')),
              );
            } else if (state is WishlistProductAdded) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Product added to wishlist')),
              );
            } else if (state is WishlistError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: theme.primaryColor,
                ),
              );
            }
          },
          builder: (context, state) {
            final wishlistProducts =
                context.read<WishlistCubit>().wishlistProducts;
            if (state is WishlistLoading) {
              return Center(child: CircularProgressIndicator());
            } else if (state is WishlistEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.shopping_bag_outlined,
                      size: screenWidth * 0.3,
                      color: theme.colorScheme.primary,
                    ),
                    SizedBox(height: screenHeight * 0.02),
                    Text(
                      'Nothing added to wishlist yet.\nStart shopping now!',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: screenHeight * 0.02),
                    ElevatedButton(
                      onPressed: () {
                        // TODO: Navigate to the home page via the main page
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary,
                        padding: EdgeInsets.symmetric(
                          vertical: screenHeight * 0.015,
                          horizontal: screenWidth * 0.15,
                        ),
                        textStyle: TextStyle(
                          fontSize: screenWidth * 0.04,
                          fontWeight: FontWeight.bold,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      child: Text(
                        'Continue Shopping',
                        style: TextStyle(color: theme.colorScheme.onPrimary),
                      ),
                    ),
                  ],
                ),
              );
            }
            // Finally if the wishlist is loaded and is not empty, display the products
            return Padding(
              padding: const EdgeInsets.all(8),
              child: ListView.builder(
                itemCount: (wishlistProducts.length / 2).ceil(),
                itemBuilder: (context, index) {
                  final int firstIndex = index * 2;
                  final int secondIndex = firstIndex + 1;

                  return Row(
                    children: [
                      ProductCard(
                        userId: userID,
                        product: wishlistProducts[firstIndex],
                      ),
                      if (secondIndex < wishlistProducts.length)
                        ProductCard(
                          userId: userID,
                          product: wishlistProducts[secondIndex],
                        )
                      else
                        SizedBox(width: screenWidth / 2 - 8),
                    ],
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
