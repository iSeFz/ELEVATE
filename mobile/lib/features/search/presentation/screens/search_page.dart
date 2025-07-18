import 'package:elevate/features/wishlist/presentation/cubits/wishlist_cubit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/size_config.dart';
import '../../../../core/widgets/product_card.dart';
import '../../../common/camera.dart';
import '../cubits/filter/filter_cubit.dart';
import '../cubits/filter/filter_state.dart';
import '../widgets/filter_button.dart';
import '../../../cart/presentation/cubits/cart_cubit.dart';

class SearchPage extends StatelessWidget {
  SearchPage({super.key});
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<WishlistCubit>(
          create: (context) => WishlistCubit(),
        ),
        BlocProvider<FilterCubit>(
          create: (_) => FilterCubit()
        ),
      ],
      child: Builder(
        builder: (context) {
          // cubit.getAllBrands();
          // final List<String> brands = cubit.brands;
          // final List<ProductCardModel>products = cubit.products;
          return Scaffold(
            backgroundColor: Colors.white,
            body: SafeArea(
              child: Padding(
                padding: EdgeInsets.all(16 * SizeConfig.horizontalBlock),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              Padding(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 12 * SizeConfig.horizontalBlock,
                                  vertical: 10 * SizeConfig.verticalBlock,
                                ),
                                child: TextField(
                                  controller: _searchController,
                                  textAlign: TextAlign.start,
                                  decoration: InputDecoration(
                                    hintText: 'Tops, Pants, etc.',
                                    hintStyle: TextStyle(
                                      fontSize: 14 * SizeConfig.textRatio,
                                      color: Colors.grey,
                                    ),
                                    border: InputBorder.none,
                                    prefixIcon: Icon(
                                      Icons.search,
                                      size: 20 * SizeConfig.verticalBlock,
                                    ),
                                    contentPadding: EdgeInsets.symmetric(
                                      vertical: 12 * SizeConfig.verticalBlock,
                                    ),
                                  ),
                                  textInputAction: TextInputAction.search,
                                  onSubmitted: (value) {
                                    context.read<FilterCubit>().searchProductsByAlgolia(query: value);
                                  },
                                ),
                              ),
                              Divider(height: 1, color: Colors.grey.shade200),
                  Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: 10 * SizeConfig.horizontalBlock,
                      vertical: 10 * SizeConfig.verticalBlock,
                    ),
                    child: Row(
                      children: [
                        // 👉 Scrollable buttons
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                FilterButton(
                                  label: 'Category',
                                  filterOptions: 1,
                                  onFetch: () async {
                                    await context.read<FilterCubit>().getAllCategories();
                                  },
                                  isExpanded: true,
                                ),
                                SizedBox(width: 6 * SizeConfig.horizontalBlock),
                                FilterButton(
                                  label: 'Brand',
                                  filterOptions: 2,
                                  onFetch: () async {
                                    await context.read<FilterCubit>().getAllBrands();
                                  },
                                ),
                                SizedBox(width: 14 * SizeConfig.horizontalBlock),
                                FilterButton(
                                  label: 'Dep',
                                  filterOptions: 3,
                                  onFetch: () async {
                                    await context.read<FilterCubit>().getAllDepartments();
                                  },
                                ),
                                SizedBox(width: 6 * SizeConfig.horizontalBlock),
                                FilterButton(
                                  label: 'Color',
                                  filterOptions: 4,
                                  onFetch: () async {
                                    await context.read<FilterCubit>().getAllColors();
                                  },
                                ),
                                SizedBox(width: 6 * SizeConfig.horizontalBlock),
                                FilterButton(
                                  label: 'Size',
                                  filterOptions: 5,
                                  onFetch: () async {
                                    await context.read<FilterCubit>().getAllSizes();
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),
                        // 👉 Fixed icons
                        SizedBox(width: 6 * SizeConfig.horizontalBlock),

                        InkWell(
                          onTap: () async {
                            final selected = await showDialog<String>(
                                context: context,
                                builder: (context) => Dialog(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  ListTile(
                                    leading: Icon(Icons.camera_alt_outlined),
                                    title: Text('Camera'),
                                    onTap: () {
                                      Navigator.of(context).pop('Camera');
                                    },
                                  ),
                                  Divider(height: 1, color: Colors.grey.shade200),
                                  ListTile(
                                    leading: Icon(Icons.image_outlined),
                                    title: Text('Gallery'),
                                    onTap: () {
                                      Navigator.of(context).pop('Gallery');
                                    },
                                  ),
                                ],
                              ),
                            ),
                            );

                            if (selected == 'Camera') {
                              context.read<FilterCubit>().pickImage(gallery: false);
                            } else if (selected == 'Gallery') {
                              context.read<FilterCubit>().pickImage(gallery: true);
                            }
                          },
                          child: Icon(
                            Icons.image_outlined,
                            size: 24 * SizeConfig.verticalBlock,
                          ),
                        ),
                        SizedBox(width: 10 * SizeConfig.horizontalBlock),
                        InkWell(
                          onTap: () async {
                            final selected = await showDialog<String>(
                              context: context,
                              builder: (context) => Dialog(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    ListTile(
                                      leading: Icon(Icons.arrow_upward),
                                      title: Text('Price: Low to High'),
                                      onTap: () {
                                        Navigator.of(context).pop('low');
                                      },
                                    ),
                                    Divider(height: 1, color: Colors.grey.shade200),
                                    ListTile(
                                      leading: Icon(Icons.arrow_downward),
                                      title: Text('Price: High to Low'),
                                      onTap: () {
                                        Navigator.of(context).pop('high');
                                      },
                                    ),
                                    Divider(height: 1, color: Colors.grey.shade200),
                                    ListTile(
                                      leading: Icon(Icons.sort_by_alpha_outlined),
                                      title: Text('Name: A to Z'),
                                      onTap: () {
                                        Navigator.of(context).pop('a');
                                      },
                                    ),
                                    Divider(height: 1, color: Colors.grey.shade200),
                                    ListTile(
                                      leading: Icon(Icons.sort_by_alpha_outlined),
                                      title: Text('Name : Z to A'),
                                      onTap: () {
                                        Navigator.of(context).pop('z');
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );

                            if (selected == 'low') {
                              context.read<FilterCubit>().sortProductsByPrice(ascending: true);
                            } else if (selected == 'high') {
                              context.read<FilterCubit>().sortProductsByPrice(ascending: false);
                            }
                            else if (selected == 'a') {
                              context.read<FilterCubit>().sortProductsByName(ascending: true);
                            } else if (selected == 'z') {
                              context.read<FilterCubit>().sortProductsByName(ascending: false);
                            }
                          },
                          child: Icon(
                            Icons.compare_arrows_outlined,
                            size: 24 * SizeConfig.verticalBlock,
                          ),
                        )

                      ],
                ),
              ),
              ]
            ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20 * SizeConfig.verticalBlock),
                    Expanded(
                      child: BlocBuilder<FilterCubit, FilterState>(
                        builder: (context, state) {
                          if (state is SearchLoading) {
                            return const Center(child: CircularProgressIndicator());
                          }
                          else if (state is FilterInitial) {
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Opacity(
                                    opacity: 0.3, // Low opacity like a watermark
                                    child: Image.asset(
                                      'assets/elevate.png',
                                      width: 200* SizeConfig.horizontalBlock,
                                      height: 200 * SizeConfig.horizontalBlock,
                                      fit: BoxFit.contain,
                                    ),
                                  ),
                                  SizedBox(height: 30 * SizeConfig.verticalBlock),
                                  Text(
                                    'Explore Now !',
                                    style: TextStyle(
                                      fontSize: 24 * SizeConfig.textRatio,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey.shade400,
                                    ),
                                  ),
                                ],
                              ),
                            );


                          }
                          else if(state is SearchEmpty) {
                            return const Center(
                              child: Text(
                                'No results found.',
                                style: TextStyle(fontSize: 20),
                              ),
                            );
                          }
                          else if (state is SearchError || state is ImageError) {
                            return Center(child: Text('Error happened'));
                          }else if (state is ImageLoading) {
                            return Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircularProgressIndicator(),
                                  SizedBox(height: 16*SizeConfig.verticalBlock),
                                  Text('Loading image...', style: TextStyle(fontSize: 16)),
                                ],
                              ),
                            );
                          }
                          else
                          {
                            final cubit = context.read<FilterCubit>();
                            return GridView.builder(
                              padding: const EdgeInsets.all(8),
                              itemCount: cubit.products.length,
                              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 8,
                                mainAxisSpacing: 8,
                                mainAxisExtent: 350 * SizeConfig.verticalBlock,
                              ),
                              itemBuilder: (context, index) {

                                final tempCartCubit = context.read<CartCubit>();
                                return BlocProvider.value(
                                  value: tempCartCubit,
                                  child: ProductCard(
                                    product: cubit.products[index],
                                    userId: tempCartCubit.userId,
                                  ),
                                );
                              },
                            );
                          }
                          // return const Center(child: Text('Start searching...'));
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }


}
