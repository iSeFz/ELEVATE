import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart'; // For mobile platforms
import '../../features/auth/data/models/customer.dart';
import '../../features/profile/data/models/address.dart';

class LocalDatabaseService {
  static late Box<Customer> box = Hive.box<Customer>('user');
  static Future<void> initDatabase() async {
    final dir = await getApplicationDocumentsDirectory();
    Hive.init(dir.path);

    Hive.registerAdapter(CustomerAdapter());
    Hive.registerAdapter(UserAddressAdapter());
    await Hive.openBox<Customer>('user');

  }

  static void saveCustomer(Customer customer) {
    box.put('current', customer);
  }

  static Customer? getCustomer() {
    try {
      final customer = box.get('current');

      if (customer == null) {
        throw Exception('No customer found in local storage');
      }

      return customer;
    } catch (e) {
      throw Exception('Error getting customer from Hive: $e');
    }
  }

  static String getCustomerId()  {
    try {
      final customer = box.get('current');

      if (customer == null) {
        throw Exception('No customer found in local storage');
      }
      if (customer.id == null || customer.id!.isEmpty) {
        throw Exception('Customer ID is null or empty');
      }
      return customer.id!;
    } catch (e) {
      throw Exception('Error getting customer ID from Hive: $e');
    }
  }
  static String getfirstName()  {
    try {
      final customer = box.get('current');

      if (customer == null) {
        throw Exception('No customer found in local storage');
      }
      if (customer.firstName == null || customer.firstName!.isEmpty) {
        throw Exception('Customer first name is null or empty');
      }
      return customer.firstName!;
    } catch (e) {
      throw Exception('Error getting first name from Hive: $e');
    }
  }

  static String getLastName()  {
    try {
      final customer = box.get('current');

      if (customer == null) {
        throw Exception('No customer found in local storage');
      }
      if (customer.lastName == null || customer.lastName!.isEmpty) {
        throw Exception('Customer last name is null or empty');
      }
      return customer.lastName!;
    } catch (e) {
      throw Exception('Error getting last name from Hive: $e');
    }
  }

  static String getImageURL()  {
    try {
      final customer = box.get('current');

      if (customer == null) {
        throw Exception('No customer found in local storage');
      }
      if (customer.imageURL == null) {
        return 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
      }
      if( customer.imageURL!.isEmpty){
        return 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
      }
      return customer.imageURL!;
    } catch (e) {
      throw Exception('Error getting image URL from Hive: $e');
    }
  }
  static getToken()  {
    try {
      final customer = box.get('current');

      if (customer == null) {
        throw Exception('No customer found in local storage');
      }
      if (customer.token == null || customer.token!.isEmpty) {
        throw Exception('Customer token is null or empty');
      }
      return customer.token;
    } catch (e) {
      throw Exception('Error getting token from Hive: $e');
    }
  }
  static void deleteCustomer()  {
    box.delete('current');
  }
}
