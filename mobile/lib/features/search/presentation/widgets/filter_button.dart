import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/size_config.dart';
import '../cubits/filter/filter_cubit.dart';
import '../../../../core/utils/filters_utils.dart';
import 'filter_sheet.dart';

class FilterButton extends StatelessWidget {
  final String label;
  final int filterOptions;
  final VoidCallback onFetch;
  final bool isExpanded;

  const FilterButton({
    Key? key,
    required this.label,
    required this.filterOptions,
    required this.onFetch,
    this.isExpanded = false, // ✔️ Optional parameter to control expanded view
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final cubit = context.watch<FilterCubit>();
    final selectedOptionsCount = FilterUtils.getSelectedFacetsByOption(filterOptions, cubit).length;
    final bool isActive = selectedOptionsCount > 0;

    return InkWell(
      child: Stack(
        clipBehavior: Clip.none, // Allow overflow for the badge
        children: [
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: 12 * SizeConfig.horizontalBlock,
              vertical: 8 * SizeConfig.verticalBlock,
            ),
            decoration: BoxDecoration(
              color: isActive ? Theme.of(context).primaryColor : Colors.black,
              borderRadius: BorderRadius.circular(5),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$label ',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12 * SizeConfig.textRatio,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Icon(Icons.arrow_drop_down, color: Colors.white, size: 20 * SizeConfig.verticalBlock),
              ],
            ),
          ),
          if (isActive)
            Positioned(
              top: selectedOptionsCount > 9 ? -1*SizeConfig.verticalBlock: -4*SizeConfig.verticalBlock,
              right: -4*SizeConfig.horizontalBlock,
              child: Container(
                padding: EdgeInsets.all(4*SizeConfig.horizontalBlock),
                decoration: BoxDecoration(
                  color: Colors.black,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1 * SizeConfig.horizontalBlock),
                ),
                child: Text(
                  '$selectedOptionsCount',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: selectedOptionsCount > 9 ? 6 * SizeConfig.textRatio : 8 * SizeConfig.textRatio,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
      onTap: () async {
        if (FilterUtils.getFacetsViewByOption(filterOptions, cubit).isEmpty) {
          onFetch();
        }
        final selectedOptions = await showModalBottomSheet<List<String>>(
          context: context,
          isScrollControlled: true,
          builder: (bottomSheetContext) {
            return BlocProvider.value(
              value: BlocProvider.of<FilterCubit>(context),
              child: FilterSheet(options: filterOptions, isExpanded: this.isExpanded),
            );
          },
        );
        if (selectedOptions != null) {
          FilterUtils.updateSelectedOptions(filterOptions, selectedOptions, cubit);
          cubit.searchProductsByAlgolia();
        }
      },
    );
  }

}
