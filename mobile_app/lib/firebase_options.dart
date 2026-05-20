// File generated from Firebase project configuration.
// Do not manually edit this file.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError(
        'DefaultFirebaseOptions have not been configured for web - '
        'you can reconfigure this by running the FlutterFire CLI again.',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyA2t-iofMSo6r2d_gFkp8nUKTx-l6Gkd84',
    appId: '1:800807427205:android:13bff587c7e53ca1c79dec',
    messagingSenderId: '800807427205',
    projectId: 'arham-ornaments-ee5f3',
    storageBucket: 'arham-ornaments-ee5f3.firebasestorage.app',
    databaseURL: 'https://arham-ornaments-ee5f3-default-rtdb.asia-southeast1.firebasedatabase.app',
  );

  // iOS options placeholder — configure when ready for iOS testing
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'PLACEHOLDER_IOS_API_KEY',
    appId: 'PLACEHOLDER_IOS_APP_ID',
    messagingSenderId: '800807427205',
    projectId: 'arham-ornaments-ee5f3',
    storageBucket: 'arham-ornaments-ee5f3.firebasestorage.app',
    databaseURL: 'https://arham-ornaments-ee5f3-default-rtdb.asia-southeast1.firebasedatabase.app',
    iosBundleId: 'com.example.mobileApp',
  );
}
