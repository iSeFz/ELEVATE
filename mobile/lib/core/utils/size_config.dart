import 'package:flutter/material.dart';
import 'dart:ui';
import 'dart:math';

class MyCustomScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
    PointerDeviceKind.touch,
    PointerDeviceKind.mouse,
  };
}

class SizeConfig {
  static const double designWidth = 430;
  static const double designHeight = 932;
  static late MediaQueryData _mediaQueryData;
  static late double screenWidth;
  static late double screenHeight;
  static late double horizontalBlock;
  static late double verticalBlock;
  static late double statusBarHeight;
  static late double textRatio;
  void init(BuildContext context) {
    _mediaQueryData = MediaQuery.of(context);
    screenWidth = _mediaQueryData.size.width;
    screenHeight = _mediaQueryData.size.height;
    statusBarHeight = _mediaQueryData.padding.top;
    horizontalBlock = (_mediaQueryData.size.width) / designWidth;
    verticalBlock = (screenHeight - statusBarHeight) / (designHeight);
    textRatio = min(verticalBlock, horizontalBlock);
  }
}
