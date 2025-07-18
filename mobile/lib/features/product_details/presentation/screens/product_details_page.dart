import 'package:elevate/core/utils/filters_utils.dart';
import 'package:elevate/core/utils/string_extensions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../cart/presentation/cubits/cart_cubit.dart';
import '../../../cart/presentation/cubits/cart_state.dart';
import '../../../wishlist/presentation/cubits/wishlist_cubit.dart';
import '../../../wishlist/presentation/cubits/wishlist_state.dart';
import '../../data/models/product_card_model.dart';
import '../cubits/product_details_cubit.dart';
import '../cubits/product_details_state.dart';
import '../widgets/about_section.dart';
import '../widgets/reviews_section.dart';
import '../../../../core/utils/size_config.dart';
import '../../../../core/widgets/full_screen_image.dart';
import '../widgets/size_container.dart';
import '../widgets/recommendation_section.dart';
import '../../../../core/services/algolia_insights_service.dart';
import 'package:elevate/features/ai_tryon/presentation/widgets/ai_tryon_dialog.dart';
import 'package:elevate/features/ai_tryon/presentation/cubits/ai_tryon_cubit.dart';

class ProductDetails extends StatefulWidget {
  const ProductDetails({
    required this.productView,
    required this.userId,
    required this.productId,
    super.key,
  });

  final String productId;
  final ProductCardModel productView;
  final String userId;

  @override
  State<ProductDetails> createState() => _ProductDetailsState();
}

class _ProductDetailsState extends State<ProductDetails> {
  bool _hasTrackedClick = false;
  String selectedSizeId = '';
  // String size = "M";
  // List<String> sizes = ['S', 'M', 'L', 'XL'];
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<ProductDetailsCubit>(create: (_) => ProductDetailsCubit()),
        BlocProvider<CartCubit>(
          create: (context) => CartCubit(userId: widget.userId),
        ),
      ],
      child: Builder(
        builder: (context) {
          return Scaffold(
            appBar: AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              centerTitle: true,
              title: Text('', style: TextStyle(color: Colors.black)),
              leading: IconButton(
                icon: Icon(Icons.arrow_back, color: Colors.black),
                onPressed: () => Navigator.of(context).pop(),
              ),
              bottom: PreferredSize(
                preferredSize: Size.fromHeight(4),
                child: Container(
                  height: 4 * SizeConfig.verticalBlock,
                  decoration: BoxDecoration(
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 6,
                        spreadRadius: 1,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            body: BlocBuilder<ProductDetailsCubit, ProductDetailsState>(
              builder: (context, state) {
                if (state is ProductDetailsInitial) {
                  context.read<ProductDetailsCubit>().fetchProductDetails(
                    widget.productId,
                  );
                  return const Center(child: CircularProgressIndicator());
                } else if (state is ProductDetailsLoading) {
                  return const Center(child: CircularProgressIndicator());
                } else if (state is ProductDetailsLoaded) {
                  // Track product click once when product details are loaded
                  if (!_hasTrackedClick) {
                    _hasTrackedClick = true;
                    try {
                      // Send the click event to Algolia
                      if (AlgoliaInsightsService.insights != null) {
                        AlgoliaInsightsService.insights!.clickedObjects(
                          indexName: 'product',
                          eventName: 'Product click',
                          objectIDs: [state.product.id],
                        );
                      }
                    } catch (e) {
                      print('Error tracking product click: $e');
                    }
                  }
                  // Extract color-image pairs from product variantsf
                  return Stack(
                    children: [
                      SizedBox(
                        height: MediaQuery.of(context).size.height * 0.5,
                        child: PageView.builder(
                          itemCount: state.product.images.length,
                          itemBuilder: (context, index) {
                            final imageUrl = state.product.images[index];
                            return GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder:
                                        (_) =>
                                            FullScreenImage(imageUrl: imageUrl),
                                  ),
                                );
                              },
                              child: Stack(
                                children: [
                                  Image.network(
                                    imageUrl,
                                    width: double.infinity,
                                    fit: BoxFit.fitWidth,
                                    alignment: Alignment.topCenter,
                                  ),
                                  // Wishlist Toggle Button
                                  Positioned(
                                    top: 15 * SizeConfig.verticalBlock,
                                    left: 15 * SizeConfig.horizontalBlock,
                                    child: BlocBuilder<
                                      WishlistCubit,
                                      WishlistState
                                    >(
                                      builder: (context, state) {
                                        final wishlistCubit =
                                            context.read<WishlistCubit>();
                                        final bool isInWishlist = wishlistCubit
                                            .isProductInWishlist(
                                              widget.productView.id,
                                            );

                                        return CircleAvatar(
                                          radius:
                                              24 * SizeConfig.horizontalBlock,
                                          backgroundColor: Colors.white,
                                          child: IconButton(
                                            padding: EdgeInsets.zero,
                                            icon: Icon(
                                              isInWishlist
                                                  ? Icons.favorite_rounded
                                                  : Icons
                                                      .favorite_outline_rounded,
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).colorScheme.primary,
                                              size:
                                                  32 *
                                                  SizeConfig.horizontalBlock,
                                            ),
                                            tooltip:
                                                isInWishlist
                                                    ? 'Remove from Wishlist'
                                                    : 'Add to Wishlist',
                                            onPressed: () {
                                              if (isInWishlist) {
                                                wishlistCubit
                                                    .removeFromWishlist(
                                                      widget.userId,
                                                      widget.productView.id,
                                                    );
                                              } else {
                                                wishlistCubit.addToWishlist(
                                                  widget.userId,
                                                  widget.productView.id,
                                                );
                                              }
                                            },
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  // AI Try-On Button
                                  Positioned(
                                    top: 15 * SizeConfig.verticalBlock,
                                    right: 15 * SizeConfig.horizontalBlock,
                                    child: GestureDetector(
                                      onTap: () {
                                        // Get the existing AITryOnCubit instance.
                                        final aiTryOnCubit =
                                            context.read<AITryOnCubit>();

                                        // Update the product image on the existing cubit.
                                        aiTryOnCubit.setProductImage(imageUrl);

                                        showDialog(
                                          context: context,
                                          builder: (BuildContext context) {
                                            return BlocProvider.value(
                                              value: aiTryOnCubit,
                                              child: AITryOnDialog(),
                                            );
                                          },
                                        );
                                      },
                                      child: Container(
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Colors.white,
                                          boxShadow: [
                                            BoxShadow(
                                              color: Theme.of(
                                                context,
                                              ).primaryColor.withAlpha(80),
                                              blurRadius: 10,
                                              spreadRadius: 6,
                                              offset: Offset(0, 4),
                                            ),
                                          ],
                                        ),
                                        child: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            ClipOval(
                                              child: Image.asset(
                                                'assets/AR.png', // your asset image
                                                width: 50,
                                                height: 50,
                                                fit: BoxFit.cover,
                                              ),
                                            ),
                                            Text(
                                              'AI',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 6,
                                                shadows: [
                                                  Shadow(
                                                    color: Colors.black
                                                        .withAlpha(180),
                                                    blurRadius: 4,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),

                      DraggableScrollableSheet(
                        initialChildSize: 0.4,
                        minChildSize: 0.3,
                        maxChildSize: 0.9,
                        builder: (context, scrollController) {
                          return Container(
                            padding: EdgeInsets.all(
                              16 * SizeConfig.verticalBlock,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.vertical(
                                top: Radius.circular(25),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black26,
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            child: ListView(
                              controller: scrollController,
                              children: [
                                Container(
                                  alignment: Alignment.center,
                                  child: Container(
                                    width: 50 * SizeConfig.horizontalBlock,
                                    height: 5 * SizeConfig.verticalBlock,
                                    decoration: BoxDecoration(
                                      color: Colors.grey[300],
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),

                                // Product card information
                                SizedBox(height: 16 * SizeConfig.verticalBlock),
                                Text(
                                  widget.productView.name
                                      .split(' ')
                                      .map((word) {
                                        if (word.isEmpty) return '';
                                        return word[0].toUpperCase() +
                                            word.substring(1).toLowerCase();
                                      })
                                      .join(' '),
                                  style: TextStyle(
                                    fontSize: 18 * SizeConfig.textRatio,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 8 * SizeConfig.verticalBlock),
                                Text(
                                  widget.productView.brandName,
                                  style: TextStyle(
                                    fontSize: 15 * SizeConfig.textRatio,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFA51930),
                                  ),
                                ),
                                SizedBox(height: 12 * SizeConfig.verticalBlock),
                                Text(
                                  'EGP ${state.product.price}',
                                  style: TextStyle(
                                    fontSize: 20 * SizeConfig.textRatio,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),

                                //color info
                                SizedBox(height: 13 * SizeConfig.verticalBlock),
                                Text(
                                  'Color: ${state.product.color.capitalize()}',
                                  style: TextStyle(
                                    fontSize: 13 * SizeConfig.textRatio,
                                  ),
                                ),

                                //sizes (variants) row
                                SizedBox(height: 10 * SizeConfig.verticalBlock),
                                Text(
                                  'Sizes:',
                                  style: TextStyle(
                                    fontSize: 13 * SizeConfig.textRatio,
                                  ),
                                ),
                                SizedBox(height: 5 * SizeConfig.verticalBlock),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children:
                                      state.product.variants.map((variant) {
                                        final shortLabel = FilterUtils.getShortSize(variant.size);
                                        selectedSizeId =context
                                                .watch<ProductDetailsCubit>()
                                                .state
                                                .selectedSizeId;

                                        return Padding(
                                          padding: EdgeInsets.only(
                                            right:
                                                7 * SizeConfig.horizontalBlock,
                                          ),
                                          child: SizeContainer(
                                            text: shortLabel,
                                            selected:
                                                selectedSizeId == variant.id,
                                            onTap: () {
                                              context
                                                  .read<ProductDetailsCubit>()
                                                  .selectSize(variant.id);
                                              setState(() {
                                                selectedSizeId = variant.id;
                                              });
                                            },
                                          ),
                                        );
                                      }).toList(),
                                ),

                                SizedBox(height: 20 * SizeConfig.verticalBlock),
                                BlocListener<CartCubit, CartState>(
                                  listener: (context, cartState) {
                                    if (cartState is CartError) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text(cartState.message)),
                                      );
                                    }
                                  },
                                  child: BlocBuilder<CartCubit, CartState>(
                                    builder: (context, cartState) {
                                      bool isInCart = context.watch<CartCubit>().isInCart(selectedSizeId);

                                      return ElevatedButton(
                                        onPressed: () {
                                          if (isInCart) {
                                            context.read<CartCubit>().removeFromCart(variantId: selectedSizeId);
                                          } else {
                                            context.read<CartCubit>().addToCart(
                                              widget.productView,
                                              state.product.variants.firstWhere((v) => v.id == state.selectedSizeId),
                                            );
                                          }
                                        },
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: isInCart ? Theme.of(context).primaryColor : Colors.black,
                                          minimumSize: Size(double.infinity, 50 * SizeConfig.textRatio),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: (cartState is CartItemLoading)
                                            ? CircularProgressIndicator(color: Colors.white)
                                            : Text(
                                          isInCart ? 'ADDED TO CART' : 'ADD TO CART',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),

                                SizedBox(height: 30 * SizeConfig.verticalBlock),
                                //about prod
                                AboutSection(product: state.product),

                                SizedBox(height: 30 * SizeConfig.verticalBlock),

                                //reviews section
                                ReviewsSection(
                                  productId: state.product.id,
                                  userId: widget.userId,
                                ),
                                SizedBox(height: 20 * SizeConfig.verticalBlock),

                                // Similar Products Section
                                RecommendationSection(
                                  userId: widget.userId,
                                  recommendationType:
                                      RecommendationType.similar,
                                ),

                                SizedBox(height: 30 * SizeConfig.verticalBlock),

                                // Customer Viewed Section
                                RecommendationSection(
                                  userId: widget.userId,
                                  recommendationType:
                                      RecommendationType.customerViewed,
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  );
                } else if (state is ProductDetailsError) {
                  return Center(child: Text('Error: ${state.message}'));
                }
                return const Center(child: Text('loading...'));
              },
            ),
          );
        },
      ),
    );
  }
}

// Helper to parse color names to Color objects
// Color _parseColor(String colorName) {
//   switch (colorName.toLowerCase()) {
//     case 'black':
//       return Colors.black;
//     case 'blue':
//       return Colors.blue[900]!;
//     case 'red':
//       return Color(0xFFA51930);
//   // Add more color mappings as needed
//     default:
//       return Colors.grey;
//   }
// }
