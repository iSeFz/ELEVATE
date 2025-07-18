import 'package:flutter/material.dart';
import 'package:elevate/features/product_details/data/services/product_service.dart';
import 'package:elevate/core/widgets/product_card.dart';
import 'package:elevate/features/product_details/data/models/product_card_model.dart';
import 'package:elevate/core/utils/size_config.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:elevate/features/cart/presentation/cubits/cart_cubit.dart';
import 'package:elevate/features/wishlist/presentation/cubits/wishlist_cubit.dart';
import 'package:elevate/features/wishlist/presentation/cubits/wishlist_state.dart';

class BrandIcon extends StatelessWidget {
  final String imageUrl;
  final String brandName;
  final VoidCallback onTap;
  const BrandIcon({super.key, required this.imageUrl, required this.brandName, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 70,
        height: 80,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 28,
              backgroundImage: imageUrl.isNotEmpty ? NetworkImage(imageUrl) : null,
              backgroundColor: Colors.grey[200],
              child: imageUrl.isEmpty ? Icon(Icons.store, size: 28, color: Colors.grey) : null,
            ),
            const SizedBox(height: 4),
            Flexible(
              child: Text(
                brandName,
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BrandProductsPage extends StatefulWidget {
  final String brandId;
  final String brandName;
  const BrandProductsPage({required this.brandId, required this.brandName});
  @override
  State<BrandProductsPage> createState() => _BrandProductsPageState();
}

class _BrandProductsPageState extends State<BrandProductsPage> {
  final ProductService _productService = ProductService();
  final ScrollController _scrollController = ScrollController();
  List<ProductCardModel> _products = [];
  int _currentPage = 1;
  bool _isLoading = false;
  bool _isLoadingMore = false;
  bool _hasNextPage = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchProducts();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200 && !_isLoadingMore && _hasNextPage) {
      _loadMoreProducts();
    }
  }

  Future<void> _fetchProducts() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });
    try {
      final result = await _productService.getProductsByBrand(brandId: widget.brandId, page: _currentPage);
      final List<ProductCardModel> newProducts = List<ProductCardModel>.from(result['products']);
      final pagination = result['pagination'];
      setState(() {
        _products = newProducts;
        _hasNextPage = pagination['hasNextPage'] == true || pagination['hasNextPage'] == 1;
        _currentPage = 2;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMoreProducts() async {
    if (!_hasNextPage || _isLoadingMore) return;
    setState(() {
      _isLoadingMore = true;
    });
    try {
      final result = await _productService.getProductsByBrand(brandId: widget.brandId, page: _currentPage);
      final List<ProductCardModel> newProducts = List<ProductCardModel>.from(result['products']);
      final pagination = result['pagination'];
      setState(() {
        _products.addAll(newProducts);
        _hasNextPage = pagination['hasNextPage'] == true || pagination['hasNextPage'] == 1;
        _currentPage++;
      });
    } catch (e) {
      // Optionally handle error
    } finally {
      setState(() {
        _isLoadingMore = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<WishlistCubit, WishlistState>(
      listener: (context, state) {
        if (state is WishlistProductRemoved) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Product removed from wishlist')),
          );
        } else if (state is WishlistProductAdded) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Product added to wishlist')));
        } else if (state is WishlistError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Theme.of(context).primaryColor,
            ),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(title: Text(widget.brandName)),
        body:
            _error.isNotEmpty
                ? Center(child: Text(_error))
                : _isLoading
                ? const Center(child: CircularProgressIndicator())
                : Column(
                  children: [
                    Expanded(
                      child: NotificationListener<ScrollNotification>(
                        onNotification: (ScrollNotification scrollInfo) {
                          if (scrollInfo.metrics.pixels == scrollInfo.metrics.maxScrollExtent && !_isLoadingMore && _hasNextPage) {
                            _loadMoreProducts();
                          }
                          return false;
                        },
                        child: GridView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(15),
                          itemCount: _products.length,
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 8,
                                mainAxisSpacing: 8,
                                mainAxisExtent:
                                    350 * (SizeConfig.verticalBlock),
                              ),
                          itemBuilder: (context, index) {
                            return SizedBox(
                              width: 200 * SizeConfig.horizontalBlock,
                              child: BlocBuilder<WishlistCubit, WishlistState>(
                                builder: (context, state) {
                                  return ProductCard(
                                    product: _products[index],
                                    userId: context.read<CartCubit>().userId,
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    if (_isLoadingMore)
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        color: Colors.transparent,
                        child: CircularProgressIndicator(),
                      ),
                  ],
                ),
      ),
    );
  }
}
