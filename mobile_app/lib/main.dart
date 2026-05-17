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
            
            final errorMsg = 'Error (${error.errorCode}): ${error.description}';
            setState(() {
              errorMessage = errorMsg;
              isLoading = false;
            });
            debugPrint('WebView Error: $errorMsg');
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

  void _retryConnection() {
    setState(() {
      errorMessage = null;
      isLoading = true;
      usedFallback = false;
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
            if (errorMessage != null)
              Center(
                child: Container(
                  color: Colors.black87,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: Colors.red,
                        size: 48,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Connection Error',
                        style: Theme.of(
                          context,
                        ).textTheme.titleLarge?.copyWith(color: Colors.white),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Trying to connect to: $currentUrl',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _retryConnection,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry Connection'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC5A059),
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
