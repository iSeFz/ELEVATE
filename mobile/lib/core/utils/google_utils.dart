import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

// Helper to get UserCredential from Google
Future<UserCredential?> getGoogleUserCredential() async {
  // Trigger the authentication flow - show Google account selection popup
  final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

  // If user cancelled the sign-in process
  if (googleUser == null) {
    return null;
  }

  // Obtain the auth details from the request
  final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

  // Create a new credential for the selected Google account
  final AuthCredential credential = GoogleAuthProvider.credential(
    accessToken: googleAuth.accessToken,
    idToken: googleAuth.idToken,
  );

  // Sign in with the selected Google account
  return await FirebaseAuth.instance.signInWithCredential(credential);
}

// Sign out of Google
Future<void> signOutGoogle() async {
  await GoogleSignIn().signOut();
  // await FirebaseAuth.instance.signOut();
}
