import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

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
  final String baseUrl = 'http://192.168.31.78:5173';

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
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
            final errorMsg = 'Error (${error.errorCode}): ${error.description}';
            setState(() {
              errorMessage = errorMsg;
              isLoading = false;
            });
            debugPrint('WebView Error: $errorMsg');
          },
        ),
      )
      ..loadRequest(Uri.parse(baseUrl));
  }

  void _retryConnection() {
    setState(() {
      errorMessage = null;
      isLoading = true;
    });
    controller.loadRequest(Uri.parse(baseUrl));
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
                        'Trying to connect to: $baseUrl',
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
