import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/utils/size_config.dart';
import '../cubits/filter/filter_cubit.dart';
import '../cubits/filter/filter_state.dart';
import '../../../../core/utils/filters_utils.dart';

class FilterSheet extends StatefulWidget {
  final int options;
  final bool isExpanded;

  const FilterSheet({
    Key? key,
    required this.options,
    required this.isExpanded, // Control expanded view
  }) : super(key: key);

  @override
  State<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<FilterSheet> {
  List<String> selectedOptions = [];

  @override
  void initState() {
    super.initState();
    final cubit = context.read<FilterCubit>();
    selectedOptions = List<String>.from(FilterUtils.getSelectedFacetsByOption(widget.options, cubit));
  }

  void toggleSelection(String option, bool isSelected) {
    setState(() {
      if (isSelected) {
        selectedOptions.remove(option);
      } else {
        selectedOptions.add(option);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.5,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      builder: (context, scrollController) {
        return BlocBuilder<FilterCubit, FilterState>(
          builder: (context, state) {
            final cubit = context.read<FilterCubit>();

            if (state is FilterLoading) {
              return Center(child: CircularProgressIndicator());
            } else if (state is FilterError) {
              return Center(child: Text('Error: ${state.message}'));
            } else{
              List<String> facetsData = FilterUtils.getFacetsViewByOption(widget.options, cubit);

              if (facetsData.isEmpty) {
                return const Center(child: Text('No filters found.'));
              }

              return Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: 12 * SizeConfig.horizontalBlock,
                          vertical: 10 * SizeConfig.verticalBlock,
                        ),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white, // grey button
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(color: theme.colorScheme.tertiary, width: 2), // black border
                            ),
                          ),
                          onPressed: () {
                            setState(() {
                              selectedOptions.clear(); // clear selections
                              Navigator.pop(context, selectedOptions);
                            });
                          },
                          child: Text('Clear', style: TextStyle(color: theme.primaryColor)),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: 12 * SizeConfig.horizontalBlock,
                          vertical: 10 * SizeConfig.verticalBlock,
                        ),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFA51930),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onPressed: () {
                            Navigator.pop(context, selectedOptions);
                          },
                          child: const Text('Apply', style: TextStyle(color: Colors.white)),
                        ),
                      ),
                    ],
                  ),

                  Expanded(
                    child: widget.isExpanded
                        ? buildExpandableList(facetsData, scrollController)
                        : buildSimpleList(facetsData, scrollController),
                  ),
                ],
              );
            }
            // else {
            //   return const Center(child: Text('Start searching...'));
            // }
          },
        );
      },
    );
  }

  Widget buildSimpleList(List<String> data, ScrollController controller) {
    return ListView.builder(
      controller: controller,
      itemCount: data.length,
      itemBuilder: (context, index) {
        final option = data[index];
        final isSelected = selectedOptions.contains(option);

        return ListTile(
          title: Text(option),
          leading: Checkbox(
            shape: CircleBorder(),
            value: isSelected,
            onChanged: (bool? value) => toggleSelection(option, isSelected),
          ),
          onTap: () => toggleSelection(option, isSelected),
        );
      },
    );
  }


  Widget buildExpandableList(List<String> data, ScrollController controller) {
    Map<String, List<String>> groupedItems = {};
    List<String> singleItems = [];

    // Group items based on the dash
    for (var item in data) {
      if (item.contains('-')) {
        final parts = item.split('-');
        final key = parts[0].trim();
        final value = parts.sublist(1).join('-').trim();

        if (!groupedItems.containsKey(key)) {
          groupedItems[key] = [];
        }
        groupedItems[key]!.add(value);
      } else {
        singleItems.add(item.trim());
      }
    }

    return ListView(
      controller: controller,
      children: [
        // Single (ungrouped) items with circular checkbox
        ...singleItems.map((option) {
          final isSelected = selectedOptions.contains(option);
          return ListTile(
            title: Row(
              mainAxisSize: MainAxisSize.min, // prevent Row from taking full width
              children: [
                Checkbox(
                  shape: CircleBorder(),
                  value: isSelected,
                  onChanged: (bool? value) => toggleSelection(option, isSelected),
                ),
                SizedBox(width: 4), // optional, small space
                Text(option),
              ],
            ),
            onTap: () => toggleSelection(option, isSelected),
          );

        }).toList(),

        // Grouped items (sets)
        ...groupedItems.entries.map((entry) {
          final groupTitle = entry.key;
          final groupItems = entry.value;

          final isGroupSelected = groupItems.every((val) => selectedOptions.contains('$groupTitle - $val'));

          return ExpansionTile(
            title: Row(
              children: [
                Checkbox(
                  shape: CircleBorder(),
                  value: isGroupSelected,
                  onChanged: (bool? value) {
                    setState(() {
                      if (value == true) {
                        groupItems.forEach((val) {
                          final fullValue = '$groupTitle - $val';
                          if (!selectedOptions.contains(fullValue)) {
                            selectedOptions.add(fullValue);
                          }
                        });
                      } else {
                        groupItems.forEach((val) {
                          final fullValue = '$groupTitle - $val';
                          selectedOptions.remove(fullValue);
                        });
                      }
                    });
                  },
                ),
                Text(groupTitle),
              ],
            ),
            children: groupItems.map((val) {
              final fullValue = '$groupTitle - $val';
              final isSelected = selectedOptions.contains(fullValue);

              return Padding(
                padding: EdgeInsets.symmetric(horizontal: 22*SizeConfig.horizontalBlock, vertical: 2*SizeConfig.verticalBlock), // Add side and vertical padding
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.15), // Background color
                    borderRadius: BorderRadius.circular(12), // Rounded corners
                  ),
                  child: ListTile(
                    dense: true,
                    visualDensity: VisualDensity.compact,
                    title: Text(val),
                    trailing: Checkbox(
                      shape: CircleBorder(),
                      value: isSelected,
                      onChanged: (bool? value) => toggleSelection(fullValue, isSelected),
                    ),
                    onTap: () => toggleSelection(fullValue, isSelected),
                  ),
                ),
              );


            }).toList(),
          );
        }).toList(),
      ],
    );
  }



}
