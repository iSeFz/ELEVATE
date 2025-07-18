import 'package:algolia_insights/algolia_insights.dart';
import '../constants/constants.dart';

class AlgoliaInsightsService {
  static Insights? _insights;

  static Insights? get insights => _insights;

  static void initializeInsights(String userId) {
    try {
      _insights = Insights(
        applicationID: algoliaAppIDValue, 
        apiKey: algoliaAPIKeyValue
      );
      _insights!.userToken = userId;
      print('Algolia Insights initialized for user: $userId');
    } catch (e) {
      print('Error initializing Algolia Insights: $e');
    }
  }
}