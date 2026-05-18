import 'dart:math' as math;
import 'package:flutter/material.dart';

class CustomLogoLoader extends StatefulWidget {
  final double size;
  const CustomLogoLoader({super.key, this.size = 80});

  @override
  State<CustomLogoLoader> createState() => _CustomLogoLoaderState();
}

class _CustomLogoLoaderState extends State<CustomLogoLoader> with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _shimmerController;
  late AnimationController _fadeController;

  @override
  void initState() {
    super.initState();
    // Rotation controller for smooth infinite 3D spin around Y axis
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat();

    // Shimmer controller for sweeping gold glow effect
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();

    // Fade-in controller when loader is mounted
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..forward();
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _shimmerController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeController,
      child: Center(
        child: AnimatedBuilder(
          animation: Listenable.merge([_rotationController, _shimmerController]),
          builder: (context, child) {
            // Real 3D horizontal rotation (coin spin effect)
            final angle = _rotationController.value * 2 * math.pi;
            final transform = Matrix4.identity()
              ..setEntry(3, 2, 0.002) // Perspective projection to make it look truly 3D
              ..rotateY(angle);

            // Metallic gold shimmer glow offsets
            final shimmerValue = _shimmerController.value;
            final alignment = Alignment(
              -2.0 + (shimmerValue * 4.0),
              -2.0 + (shimmerValue * 4.0),
            );

            return Transform(
              transform: transform,
              alignment: Alignment.center,
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    // Outer golden luxurious glow shadow
                    BoxShadow(
                      color: const Color(0xFFC5A059).withValues(alpha: 0.35),
                      blurRadius: 16,
                      spreadRadius: 2,
                      offset: const Offset(0, 8),
                    ),
                    // Ambient drop shadow for the 3D depth floating feel
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.12),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                  border: Border.all(
                    color: const Color(0xFFC5A059),
                    width: 2.5,
                  ),
                ),
                child: ClipOval(
                  child: ShaderMask(
                    shaderCallback: (bounds) {
                      return LinearGradient(
                        colors: const [
                          Colors.transparent,
                          Color(0x22FFFFFF),
                          Color(0xDDFFDF79),
                          Color(0x22FFFFFF),
                          Colors.transparent,
                        ],
                        stops: const [0.0, 0.3, 0.5, 0.7, 1.0],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        transform: _GradientSweepTransform(alignment),
                      ).createShader(bounds);
                    },
                    blendMode: BlendMode.srcOver,
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/logo.jpg',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: const Color(0xFF111827),
                            child: const Center(
                              child: Icon(
                                Icons.filter_vintage_rounded,
                                color: Color(0xFFC5A059),
                                size: 36,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _GradientSweepTransform extends GradientTransform {
  final Alignment alignment;
  const _GradientSweepTransform(this.alignment);

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    final w = bounds.width;
    final h = bounds.height;
    final tx = alignment.x * w * 0.5;
    final ty = alignment.y * h * 0.5;
    return Matrix4.translationValues(tx, ty, 0.0);
  }
}
