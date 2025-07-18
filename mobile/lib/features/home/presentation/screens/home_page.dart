import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/size_config.dart';
import '../../../ai_tryon/presentation/cubits/ai_tryon_cubit.dart';
import '../cubits/home_cubit.dart';
import '../cubits/home_state.dart';
import '/../core/widgets/product_card.dart';
import '/core/widgets/video_player_widget.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../cart/presentation/cubits/cart_cubit.dart';
import '../../../wishlist/presentation/cubits/wishlist_cubit.dart';
import '../../../wishlist/presentation/cubits/wishlist_state.dart';
import 'package:elevate/features/brands/data/models/brand_model.dart';
import 'package:elevate/features/brands/data/services/brand_service.dart';
import 'package:elevate/features/brands/presentation/widgets/brand_widgets.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocProvider(
      // Initialize HomeCubit and fetch products grouped by department
      create:
          (_) {
            final cubit = HomeCubit();
            cubit.fetchTopRatedProducts();
            cubit.fetchProductsByDepartments(['Men', 'Women', 'Kids']);
            return cubit;
          },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          centerTitle: true,
          automaticallyImplyLeading: false,
          title: Padding(
            padding: EdgeInsets.only(
              top: 20 * SizeConfig.verticalBlock,
              bottom: 20 * SizeConfig.verticalBlock,
              left: 15 * SizeConfig.verticalBlock,
              right: 15 * SizeConfig.verticalBlock,
            ),
            child: Text(
              'ELEVATE',
              style: TextStyle(
                color: theme.colorScheme.primary,
                fontSize: 24 * SizeConfig.textRatio,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          bottom: PreferredSize(
            preferredSize: Size.fromHeight(1),
            child: Container(color: Colors.grey[300], height: 1),
          ),
        ),
        body: MultiBlocListener(
          listeners: [
            BlocListener<HomeCubit, HomeState>(
              listener: (context, state) {
                if (state is HomeError) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(state.message)));
                }
              },
            ),
            BlocListener<WishlistCubit, WishlistState>(
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
            ),
          ],
          child: BlocBuilder<HomeCubit, HomeState>(
            builder: (context, state) {
              final departmentProducts = context.read<HomeCubit>().departmentProducts;
              final topRatedProducts = context.read<HomeCubit>().topRatedProducts;

              if (state is HomeLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              return SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Video with overlayed phrase
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        AspectRatio(
                          aspectRatio: 5 / 7,
                          child: VideoPlayerWidget(
                            assetPath: 'assets/hs_video.mp4',
                          ),
                        ),
                        Positioned(
                          bottom: 40,
                          child: TweenAnimationBuilder<double>(
                            tween: Tween<double>(begin: 0, end: 1),
                            duration: const Duration(seconds: 2),
                            builder: (context, opacity, child) {
                              return Opacity(
                                opacity: opacity,
                                child: child,
                              );
                            },
                            child: SizedBox(
                              width: 260,
                              height: 80,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.6),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  'SUMMER IS HERE',
                                  style: GoogleFonts.bebasNeue(
                                    textStyle: TextStyle(
                                      color: const Color(0xFFA51930).withValues(alpha: 0.6),
                                      fontSize: 40 * SizeConfig.textRatio,
                                      fontWeight: FontWeight.w400,
                                      letterSpacing: 1.2* SizeConfig.textRatio,
                                      shadows: [
                                        Shadow(blurRadius: 4, color: Colors.black12),
                                      ],
                                    ),
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    // Top Rated Products Section
                    if (topRatedProducts.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 8.0),
                        child: Text(
                          'Top Rated Products',
                          style: TextStyle(
                            fontSize: 22 * SizeConfig.textRatio,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 350 * SizeConfig.verticalBlock,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          itemCount: topRatedProducts.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 12),
                          itemBuilder: (context, index) {
                            return SizedBox(
                              width: 200 * SizeConfig.horizontalBlock,
                              child: BlocBuilder<WishlistCubit, WishlistState>(
                                builder: (context, state) {
                                  return ProductCard(
                                    product: topRatedProducts[index],
                                    userId: context.read<CartCubit>().userId,
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                    // Shop By Brand
                    const SizedBox(height: 24),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Shop by Brand',
                            style: TextStyle(
                              fontSize: 22 * SizeConfig.textRatio,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          SafeArea(
                            bottom: true,
                            child: SizedBox(
                              height: 80,
                              child: FutureBuilder<List<Brand>>(
                                future: BrandService.fetchBrands(),
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState == ConnectionState.waiting) {
                                    return const Center(child: CircularProgressIndicator());
                                  } else if (snapshot.hasError) {
                                    return Center(child: Text('Failed to load brands'));
                                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                                    return Center(child: Text('No brands found'));
                                  }
                                  final brands = snapshot.data!;
                                  return ListView.separated(
                                    scrollDirection: Axis.horizontal,
                                    itemCount: brands.length,
                                    separatorBuilder: (_, __) => const SizedBox(width: 18),
                                    itemBuilder: (context, index) {
                                      final brand = brands[index];
                                      return BrandIcon(
                                        imageUrl: brand.imageURL,
                                        brandName: brand.brandName,
                                        onTap: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (_) => MultiBlocProvider(
                                                providers: [
                                                  BlocProvider.value(value: context.read<WishlistCubit>()),
                                                  BlocProvider.value(value: context.read<CartCubit>()),
                                                  BlocProvider.value(value: context.read<AITryOnCubit>()),
                                                ],
                                                child: BrandProductsPage(brandId: brand.id, brandName: brand.brandName),
                                              ),
                                            ),
                                          );
                                        },
                                      );
                                    },
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Shop by department
                    ...departmentProducts.entries
                        .where((entry) => entry.value.isNotEmpty)
                        .map(
                          (entry) => Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: EdgeInsets.symmetric(
                                  horizontal:
                                      (entry.key.toLowerCase() == 'men' ||
                                              entry.key.toLowerCase() ==
                                                  'women' ||
                                              entry.key.toLowerCase() == 'kids')
                                          ? 32.0
                                          : 16.0,
                                  vertical: 8.0,
                                ),
                                child: Text(
                                  entry.key,
                                  style: TextStyle(
                                    fontSize: 22 * SizeConfig.textRatio,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              SizedBox(
                                height: 350 * SizeConfig.verticalBlock,
                                child: ListView.separated(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0,
                                  ),
                                  itemCount: entry.value.length,
                                  separatorBuilder:
                                      (_, __) => const SizedBox(width: 12),
                                  itemBuilder: (context, index) {
                                    return SizedBox(
                                      width: 200 * SizeConfig.horizontalBlock,
                                      child: BlocBuilder<WishlistCubit, WishlistState>(
                                        builder: (context, state) {
                                          return ProductCard(
                                            product: entry.value[index],
                                            userId: context.read<CartCubit>().userId,
                                            // Here we get the userId from the cart cubit which seems to be confusing but we use the provided cubits to get the information we need
                                            // It is not the best practice but it is a workaround to avoid passing the whole profile cubit to the whole app
                                          );
                                        },
                                      ),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(height: 24),
                            ],
                          ),
                        ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
