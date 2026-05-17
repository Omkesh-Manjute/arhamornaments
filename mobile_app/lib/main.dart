import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Arham Ornaments',
      theme: ThemeData(
        primaryColor: const Color(0xFFC5A059), // Gold color from your website
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFC5A059)),
        useMaterial3: true,
      ),
      debugShowCheckedModeBanner: false,
      home: const WebAppScreen(),
    );
  }
}

class WebAppScreen extends StatefulWidget {
  const WebAppScreen({super.key});

  @override
  State<WebAppScreen> createState() => _WebAppScreenState();
}

class _WebAppScreenState extends State<WebAppScreen> {
  late final WebViewController controller;
  bool isLoading = true;
  String? errorMessage;
  bool isOfflineMode = false;
  
  // Custom domain & fallback URLs
  final String primaryUrl = 'https://www.arhamornaments.com';
  final String fallbackUrl = 'https://arham-ornaments-ee5f3.web.app';
  
  late String currentUrl;
  bool usedFallback = false;

  @override
  void initState() {
    super.initState();
    currentUrl = primaryUrl;
    
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent("ArhamOrnamentsWebView")
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              isLoading = true;
              errorMessage = null;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
              // If dynamic online URL is loaded, ensure offline mode is disabled
              if (url.startsWith('http')) {
                isOfflineMode = false;
              }
            });
          },
          onWebResourceError: (WebResourceError error) {
            // Ignore non-main-frame resource errors (like fonts, images, trackers)
            if (error.isForMainFrame != true) {
              debugPrint('Ignoring subresource error: ${error.description}');
              return;
            }

            // Ignore custom scheme or WhatsApp launching errors
            final String desc = error.description.toLowerCase();
            if (desc.contains('whatsapp') || 
                desc.contains('unknown url scheme') || 
                error.errorCode == -10) {
              debugPrint('Ignoring custom scheme/whatsapp error: ${error.description}');
              return;
            }

            // Auto-fallback if the custom domain fails to load
            if (!usedFallback && currentUrl == primaryUrl) {
              usedFallback = true;
              currentUrl = fallbackUrl;
              debugPrint('Primary URL failed: ${error.description}. Retrying with fallback: $fallbackUrl');
              controller.loadRequest(Uri.parse(fallbackUrl));
              return;
            }
            
            // Both primary and fallback URLs failed. We are definitely offline.
            // Load the bundled offline shell natively for a flawless offline experience!
            debugPrint('Both network connection attempts failed. Gracefully loading offline shell asset...');
            try {
              controller.loadFlutterAsset('assets/offline_shell.html');
              setState(() {
                errorMessage = null; // Clear error to prevent blocking overlay
                isLoading = false;
                isOfflineMode = true; // Mark as offline mode to show the floating Reconnect button
              });
            } catch (e) {
              debugPrint('Failed to load local offline asset: $e');
              final errorMsg = 'Error (${error.errorCode}): ${error.description}';
              setState(() {
                errorMessage = errorMsg;
                isLoading = false;
                isOfflineMode = false;
              });
            }
          },
          onNavigationRequest: (NavigationRequest request) async {
            final String url = request.url;
            
            // Check for custom schemes (whatsapp, phone calls, mail, or direct wa.me links)
            if (url.startsWith('whatsapp:') || 
                url.startsWith('tel:') || 
                url.startsWith('mailto:') || 
                url.contains('wa.me') || 
                url.contains('api.whatsapp.com')) {
              try {
                final Uri uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                } else {
                  // Fallback for custom schemes in newer Android versions
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              } catch (e) {
                debugPrint('Could not launch URL externally: $e');
              }
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(currentUrl));
  }

  String _getFriendlyErrorMessage(String rawError) {
    final String errorLower = rawError.toLowerCase();
    if (errorLower.contains('err_internet_disconnected') || 
        errorLower.contains('err_name_not_resolved') || 
        errorLower.contains('err_connection_aborted') ||
        errorLower.contains('err_failed') ||
        errorLower.contains('-1')) {
      return "Please check your internet connection. Make sure Wi-Fi or Mobile Data is turned on and try again.";
    } else if (errorLower.contains('err_connection_timed_out') || 
               errorLower.contains('timeout')) {
      return "The connection timed out. The server might be temporarily busy. Please try again in a few moments.";
    } else if (errorLower.contains('err_connection_refused')) {
      return "We are undergoing a brief maintenance update. Please try again shortly!";
    }
    return "We're having trouble connecting to our servers. Please tap below to retry.";
  }

  void _retryConnection() {
    setState(() {
      errorMessage = null;
      isLoading = true;
      usedFallback = false;
      isOfflineMode = false; // Reset offline mode flag on explicit manual retry
      currentUrl = primaryUrl;
    });
    controller.loadRequest(Uri.parse(currentUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: controller),
            if (isLoading)
              const Center(
                child: CircularProgressIndicator(color: Color(0xFFC5A059)),
              ),
            
            // Premium Floating "Go Live" indicator button in offline mode
            if (isOfflineMode)
              Positioned(
                bottom: 24,
                right: 24,
                child: GestureDetector(
                  onTap: _retryConnection,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0x4DC5A059),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.wifi_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Go Live',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            if (errorMessage != null)
              Positioned.fill(
                child: Container(
                  color: const Color(0xFFF9F9F9), // Luxurious warm off-white background
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Spacer(flex: 3),
                      // Animated-like Glowing Gold/Charcoal Container
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0x26C5A059),
                              blurRadius: 24,
                              spreadRadius: 8,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0x4DC5A059),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.wifi_off_rounded,
                              color: Colors.white,
                              size: 36,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 36),
                      
                      // Heading
                      const Text(
                        'Connection Lost',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFF2C2C2C),
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      
                      // Hindi Translation subtitle
                      const Text(
                        'इंटरनेट कनेक्शन अनुपलब्ध है',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFFC5A059),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.2,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Friendly Message
                      Text(
                        _getFriendlyErrorMessage(errorMessage!),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFF707070),
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 36),
                      
                      // Premium Gold Gradient Button
                      GestureDetector(
                        onTap: _retryConnection,
                        child: Container(
                          width: double.infinity,
                          height: 54,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(27),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0x4DC5A059),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.refresh_rounded,
                                color: Colors.white,
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Retry Connection',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Secondary "Contact Support" Button
                      TextButton(
                        onPressed: () async {
                          final Uri phoneUri = Uri.parse('tel:+919876543210');
                          try {
                            if (await canLaunchUrl(phoneUri)) {
                              await launchUrl(phoneUri);
                            }
                          } catch (e) {
                            debugPrint('Could not launch support number: $e');
                          }
                        },
                        child: const Text(
                          'Contact Customer Support',
                          style: TextStyle(
                            color: Color(0xFF2C2C2C),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                      
                      const Spacer(flex: 4),
                      
                      // Raw Error Footer (for developers, subtle)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Text(
                          'Details: $errorMessage\nTarget: $currentUrl',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.black26,
                            fontSize: 9,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
