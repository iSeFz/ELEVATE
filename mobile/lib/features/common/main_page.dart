import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/services/local_database_service.dart';
import '../search/presentation/screens/search_page.dart';
import '/../core/utils/size_config.dart';
import '../auth/data/models/customer.dart';
import '../home/presentation/screens/home_page.dart';
import '../wishlist/presentation/screens/wishlist_page.dart';
import '../cart/presentation/screens/cart_page.dart';
import '../cart/presentation/cubits/cart_cubit.dart';
import '../cart/presentation/cubits/cart_state.dart';
import '../wishlist/presentation/cubits/wishlist_cubit.dart';
import '../profile/presentation/screens/profile_page.dart';
import '../ai_tryon/presentation/cubits/ai_tryon_cubit.dart';

class MainPage extends StatefulWidget {
  final Customer customer;
  const MainPage({super.key, required this.customer});
  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _selectedIndex = 0;
  late final PageController _pageController;
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    LocalDatabaseService.saveCustomer(widget.customer);
    _pageController = PageController(initialPage: _selectedIndex);
    _pages = [
      HomePage(),
      SearchPage(),
      CartPage(userID: widget.customer.id!),
      WishlistPage(userID: widget.customer.id!),
      ProfilePage(customer: widget.customer),
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _pageController.jumpToPage(index);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return MultiBlocProvider(
      providers: [
        BlocProvider<CartCubit>.value(
          value: CartCubit(userId: widget.customer.id!)..fetchCartItems(),
        ),
        BlocProvider<WishlistCubit>.value(
          value: WishlistCubit()..fetchWishlist(widget.customer.id!),
        ),
        BlocProvider<AITryOnCubit>(
          create:
              (context) => AITryOnCubit(
                productImage: '',
                customerID: widget.customer.id!,
              ),
        ),
      ],
      child: Scaffold(
        body: PageView(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          children: _pages,
        ),
        bottomNavigationBar: Padding(
          padding: EdgeInsets.only(bottom: 5 * SizeConfig.verticalBlock),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(8),
                  blurRadius: 8,
                  offset: Offset(0, -4),
                ),
              ],
            ),
            child: BottomNavigationBar(
              type: BottomNavigationBarType.fixed,
              elevation: 0,
              iconSize: 30 * SizeConfig.verticalBlock,
              currentIndex: _selectedIndex,
              unselectedItemColor: Colors.black,
              selectedItemColor: theme.colorScheme.primary,
              showSelectedLabels: false,
              showUnselectedLabels: false,
              onTap: _onItemTapped,
              items: <BottomNavigationBarItem>[
                BottomNavigationBarItem(
                  icon: Center(
                    child: Icon(
                      _selectedIndex == 0
                          ? Icons.home_rounded
                          : Icons.home_outlined,
                    ),
                  ),
                  label: 'Home',
                ),
                BottomNavigationBarItem(
                  icon: Center(
                    child: Icon(
                      _selectedIndex == 1
                          ? Icons.search_rounded
                          : Icons.search_outlined,
                    ),
                  ),
                  label: 'Search',
                ),

                BottomNavigationBarItem(
                  icon: BlocBuilder<CartCubit, CartState>(
                    builder: (context, state) {
                      final cartCount =
                          context.read<CartCubit>().cartItems.length;
                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            _selectedIndex == 2
                                ? Icons.shopping_bag_rounded
                                : Icons.shopping_bag_outlined,
                          ),
                          if (cartCount > 0)
                            Positioned(
                              top: -6,
                              right: -8,
                              child: CircleAvatar(
                                radius: 8,
                                backgroundColor:
                                    _selectedIndex == 2
                                        ? Colors.grey[700]?.withAlpha(220)
                                        : theme.colorScheme.primary,
                                child: Text(
                                  '$cartCount',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  label: 'Cart',
                ),
                BottomNavigationBarItem(
                  icon: Center(
                    child: Icon(
                      _selectedIndex == 3
                          ? Icons.favorite_rounded
                          : Icons.favorite_outline_rounded,
                    ),
                  ),
                  label: 'Wishlist',
                ),
                BottomNavigationBarItem(
                  icon: Center(
                    child: Icon(
                      _selectedIndex == 4
                          ? Icons.person_rounded
                          : Icons.person_outline_rounded,
                    ),
                  ),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
