import 'package:elevate/core/utils/string_extensions.dart';
import 'package:elevate/features/product_details/data/models/product_details_model.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../../../../core/utils/size_config.dart';

class AboutSection extends StatelessWidget {
  const AboutSection({super.key, required this.product});
  final ProductDetailsModel product;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: 8.0 * SizeConfig.horizontalBlock,
          ),
          child: Text(
            "About product",
            style: TextStyle(
              fontSize: 18 * SizeConfig.textRatio,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        SizedBox(height: 20 * SizeConfig.verticalBlock),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(
              8 * SizeConfig.verticalBlock,
            ),
          ),
          child: Column(
            children: [
              ExpansionTile(
                title: Row(
                  children: [
                    Icon(
                      Icons.person,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                    SizedBox(width: 8),
                    Text(
                      "Department",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18 * SizeConfig.textRatio,
                      ),
                    ),
                  ],
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min, // Keeps it tight
                  children: product.department.map((gender) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: Text(
                      gender.capitalize(),
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )).toList(),
                ),
                onExpansionChanged: (_) {}, // Disable expansion
                children: const [],
              ),
              Divider(
                color: Colors.grey.shade300,
                height: 1 * SizeConfig.verticalBlock,
              ),
              ExpansionTile(
                title: Row(
                  children: [
                    Icon(
                      Icons.water_drop,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                    SizedBox(width: 8),
                    Text(
                      "Material",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18 * SizeConfig.textRatio,
                      ),
                    ),
                  ],
                ),
                trailing: Text(
                      product.material.capitalize(),
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                onExpansionChanged: (_) {}, // Disable expansion
                children: const [],
              ),
              Divider(
                color: Colors.grey.shade300,
                height: 1 * SizeConfig.verticalBlock,
              ),
              ExpansionTile(
                title: Row(
                  children: [
                    Icon(
                      Icons.checkroom,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                    SizedBox(width: 8),
                    Text(
                      "Description",
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18 * SizeConfig.textRatio
                      ),
                    ),
                  ],
                ),
                trailing: Icon(Icons.expand_more),
                children: [
                  Padding(
                    padding: EdgeInsets.all(
                      16 * SizeConfig.verticalBlock,),
                    child: Text(
                      product.description,
                      style: TextStyle(
                        fontSize: 14 * SizeConfig.textRatio,
                        color: Colors.grey[700],
                      ),
                    ),
                  ),
                ],
              ),
              Divider(
                color: Colors.grey.shade300,
                height: 1 * SizeConfig.verticalBlock,
              ),

              // ExpansionTile(
              //   title: Row(
              //     children: [
              //       Icon(
              //         Icons.reviews_outlined,
              //         color: Colors.black,
              //       ),
              //       SizedBox(
              //         width: 8 * SizeConfig.horizontalBlock,
              //       ),
              //       Text(
              //         "Reviews",
              //         style: TextStyle(
              //             fontWeight: FontWeight.bold,
              //             fontSize: 18 * SizeConfig.textRatio
              //         ),
              //       ),
              //     ],
              //   ),
              //   trailing: Icon(Icons.expand_more),
              //   children: [
              //     Padding(
              //       padding: EdgeInsets.symmetric(
              //         horizontal:
              //         24 * SizeConfig.horizontalBlock,
              //         vertical: 10 * SizeConfig.verticalBlock,
              //       ),
              //
              //     ),
              //   ],
              // ),
              Divider(
                color: Colors.grey.shade300,
                height: 1 * SizeConfig.verticalBlock,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
