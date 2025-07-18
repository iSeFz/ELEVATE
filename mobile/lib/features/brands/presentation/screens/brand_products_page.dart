import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/brand_products_cubit.dart';
import 'package:elevate/core/widgets/product_card.dart';
import 'package:elevate/core/utils/size_config.dart';
import '../../../wishlist/presentation/cubits/wishlist_cubit.dart';
import '../../../wishlist/presentation/cubits/wishlist_state.dart';
import '../../../cart/presentation/cubits/cart_cubit.dart';

class BrandProductsPage extends StatelessWidget {
  final String brandId;
  final String brandName;

  const BrandProductsPage({
    super.key,
    required this.brandId,
    required this.brandName,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => BrandProductsCubit()..fetchInitial(brandId),
      child: Scaffold(
        appBar: AppBar(title: Text(brandName)),
        body: MultiBlocListener(
          listeners: [
            BlocListener<WishlistCubit, WishlistState>(
              listener: (context, state) {
                if (state is WishlistProductRemoved) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Product removed from wishlist')),
                  );
                } else if (state is WishlistProductAdded) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Product added to wishlist')),
                  );
                } else if (state is WishlistError) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.message),
                      backgroundColor: Theme.of(context).primaryColor,
                    ),
                  );
                }
              },
            ),
          ],
          child: BlocBuilder<BrandProductsCubit, BrandProductsState>(
            builder: (context, state) {
              if (state is BrandProductsLoading) {
                return const Center(child: CircularProgressIndicator());
              } else if (state is BrandProductsError) {
                return Center(child: Text(state.message));
              } else if (state is BrandProductsLoaded) {
                final products = state.products;
                final hasNextPage = state.hasNextPage;
                final isLoadingMore = state.isLoadingMore;

                return Column(
                  children: [
                    Expanded(
                      child: NotificationListener<ScrollNotification>(
                        onNotification: (scrollInfo) {
                          if (scrollInfo.metrics.pixels == scrollInfo.metrics.maxScrollExtent &&
                              hasNextPage &&
                              !isLoadingMore) {
                            context.read<BrandProductsCubit>().loadMore(brandId);
                          }
                          return false;
                        },
                        child: GridView.builder(
                          padding: const EdgeInsets.all(15),
                          itemCount: products.length,
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 8,
                            mainAxisSpacing: 8,
                            mainAxisExtent: 350 * (SizeConfig.verticalBlock ?? 1),
                          ),
                          itemBuilder: (context, index) {
                            return ProductCard(
                              product: products[index],
                              userId: context.read<CartCubit>().userId,
                            );
                          },
                        ),
                      ),
                    ),
                    if (isLoadingMore)
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        child: const CircularProgressIndicator(),
                      ),
                  ],
                );
              }

              return const SizedBox();
            },
          ),
        ),
      ),
    );
  }
}
