import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Top-level background message handler — must be a top-level function.
/// Called when the app is in the background or terminated.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('[FCM] Background message received: ${message.messageId}');
  debugPrint('[FCM]   Title: ${message.notification?.title}');
  debugPrint('[FCM]   Body: ${message.notification?.body}');
  debugPrint('[FCM]   Data: ${message.data}');
}

/// Centralized notification service for Firebase Cloud Messaging.
/// Handles initialization, permission requests, token management,
/// foreground display, and notification tap routing.
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  /// Android notification channel for high-importance notifications.
  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'arham_ornaments_channel',
    'Arham Ornaments Notifications',
    description: 'Notifications for offers, orders, and updates from Arham Ornaments.',
    importance: Importance.high,
    enableVibration: true,
    playSound: true,
  );

  /// Callback for handling notification taps (set by the app).
  void Function(Map<String, dynamic> data)? onNotificationTap;

  /// Initialize the entire notification system.
  Future<void> initialize() async {
    // 1. Create the Android notification channel
    await _createNotificationChannel();

    // 2. Initialize flutter_local_notifications
    await _initLocalNotifications();

    // 3. Request notification permissions
    await requestPermission();

    // 4. Get and store the FCM token
    await _retrieveAndStoreToken();

    // 5. Listen for token refreshes
    _messaging.onTokenRefresh.listen((newToken) {
      debugPrint('[FCM] Token refreshed: $newToken');
      _saveToken(newToken);
    });

    // 6. Set up foreground message handler
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // 7. Set up notification tap handlers (when app is opened from notification)
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // 8. Check if app was launched from a terminated state via notification
    final RemoteMessage? initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('[FCM] App opened from terminated state via notification');
      _handleNotificationTap(initialMessage);
    }

    debugPrint('[FCM] NotificationService initialized successfully');
  }

  /// Request notification permission from the user.
  Future<bool> requestPermission() async {
    final NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    final bool isGranted =
        settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;

    debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('[FCM] ⚠️ Notification permission denied by user');
    } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
      debugPrint('[FCM] Notification permission granted provisionally');
    } else if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('[FCM] ✅ Notification permission fully authorized');
    }

    return isGranted;
  }

  /// Retrieve the current FCM device token.
  Future<String?> getToken() async {
    return await _messaging.getToken();
  }

  // ========== Private Implementation ==========

  /// Create the Android notification channel.
  Future<void> _createNotificationChannel() async {
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);
  }

  /// Initialize flutter_local_notifications for foreground display.
  Future<void> _initLocalNotifications() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        debugPrint('[FCM] Local notification tapped, payload: ${response.payload}');
        if (response.payload != null && onNotificationTap != null) {
          try {
            final data = jsonDecode(response.payload!) as Map<String, dynamic>;
            onNotificationTap!(data);
          } catch (_) {
            onNotificationTap!({'payload': response.payload});
          }
        }
      },
    );
  }

  /// Get, log, and persist the FCM token.
  Future<void> _retrieveAndStoreToken() async {
    try {
      final String? token = await _messaging.getToken();
      if (token != null) {
        debugPrint('[FCM] ═══════════════════════════════════════════');
        debugPrint('[FCM] Device Token: $token');
        debugPrint('[FCM] ═══════════════════════════════════════════');
        await _saveToken(token);
      } else {
        debugPrint('[FCM] ⚠️ Failed to retrieve FCM token');
      }
    } catch (e) {
      debugPrint('[FCM] ❌ Error getting FCM token: $e');
    }
  }

  /// Save the token to SharedPreferences for persistence.
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcm_token', token);
    debugPrint('[FCM] Token saved to SharedPreferences');
  }

  /// Handle a foreground notification by displaying it locally.
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('[FCM] Foreground message received: ${message.messageId}');
    debugPrint('[FCM]   Title: ${message.notification?.title}');
    debugPrint('[FCM]   Body: ${message.notification?.body}');
    debugPrint('[FCM]   Data: ${message.data}');

    final RemoteNotification? notification = message.notification;
    if (notification != null) {
      _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            _channel.id,
            _channel.name,
            channelDescription: _channel.description,
            importance: Importance.high,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
            color: const Color(0xFFC5A059),
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: jsonEncode(message.data),
      );
    }
  }

  /// Handle tapping on a notification (background or terminated).
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('[FCM] Notification tapped — Data: ${message.data}');
    if (onNotificationTap != null) {
      onNotificationTap!(message.data);
    }
  }
}
