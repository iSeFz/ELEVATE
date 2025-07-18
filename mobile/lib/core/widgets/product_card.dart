import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../features/wishlist/presentation/cubits/wishlist_cubit.dart';
import '../../features/ai_tryon/presentation/cubits/ai_tryon_cubit.dart';
import '/../core/utils/size_config.dart';
import '/../features/product_details/presentation/screens/product_details_page.dart';
import '/../features/product_details/data/models/product_card_model.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, required this.userId});
  final ProductCardModel product;
  final String userId;

  @override
  Widget build(BuildContext context) {
    final wishlistCubit = context.read<WishlistCubit>();
    final aiTryOnCubit = context.read<AITryOnCubit>();
    final bool isInWishlist = wishlistCubit.isProductInWishlist(product.id);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (_) => MultiBlocProvider(
                  providers: [
                    BlocProvider<AITryOnCubit>.value(value: aiTryOnCubit),
                    BlocProvider<WishlistCubit>.value(value: wishlistCubit),
                  ],
                  child: ProductDetails(
                    productId: product.id,
                    userId: userId,
                    productView: product,
                  ),
                ),
          ),
        );
      },
      child: SizedBox(
        width: SizeConfig.horizontalBlock * 200,
        height: 350 * SizeConfig.verticalBlock,
        child: Card(
          color: Colors.white,
          elevation: 3,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Stack(
                children: [
                  SizedBox(
                    // borderRadius: BorderRadius.circular(10),
                    width: double.infinity,
                    height: 225 * SizeConfig.verticalBlock,
                    child: Image.network(
                      product.image,
                      fit: BoxFit.cover,
                      errorBuilder:
                          (context, error, stackTrace) => Container(
                            color: Colors.grey[100],
                            // width: double.infinity,
                            // height: 220*SizeConfig.verticalBlock,
                            child: Icon(
                              Icons.broken_image_rounded,
                              size: 100 * SizeConfig.verticalBlock,
                              color: Color(0xFFE8BBC2),
                            ),
                          ),
                    ),
                  ),
                  Positioned(
                    top: 8 * SizeConfig.verticalBlock,
                    right: 6 * SizeConfig.horizontalBlock,
                    child: CircleAvatar(
                      radius: 18 * SizeConfig.horizontalBlock,
                      backgroundColor: Colors.white,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: Icon(
                          isInWishlist
                              ? Icons.favorite_rounded
                              : Icons.favorite_outline_rounded,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        tooltip:
                            isInWishlist
                                ? 'Remove from Wishlist'
                                : 'Add to Wishlist',
                        onPressed: () {
                          if (isInWishlist) {
                            wishlistCubit.removeFromWishlist(
                              userId,
                              product.id,
                            );
                          } else {
                            wishlistCubit.addToWishlist(userId, product.id);
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: EdgeInsets.all(18 * SizeConfig.verticalBlock),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name
                          .split(' ')
                          .map((word) {
                            if (word.isEmpty) return '';
                            return word[0].toUpperCase() +
                                word.substring(1).toLowerCase();
                          })
                          .join(' '),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14 * SizeConfig.textRatio,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 2 * SizeConfig.verticalBlock),
                    Text(
                      product.brandName,
                      style: TextStyle(
                        color: Color(0xFFA51930),
                        fontSize: 14 * SizeConfig.textRatio,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4 * SizeConfig.verticalBlock),
                    Text(
                      'EGP ${product.price}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14 * SizeConfig.textRatio,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
