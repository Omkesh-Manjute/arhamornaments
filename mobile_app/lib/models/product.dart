class Product {
  final String id;
  final String name;
  final String category;
  final String imageUrl;
  final double weight; // Weight in grams (Crucial for jewelry!)
  final String purity; // "22KT Gold", "18KT Gold", "24KT Gold"
  final String description;
  final double basePrice; // Base price excluding dynamic gold rate changes
  final bool isBestSeller;
  final bool isNewArrival;
  final String designNo;

  const Product({
    required this.id,
    required this.name,
    required this.category,
    required this.imageUrl,
    required this.weight,
    required this.purity,
    required this.description,
    required this.basePrice,
    this.isBestSeller = false,
    this.isNewArrival = false,
    this.designNo = '',
  });

  // Calculate current price dynamically based on live gold rates (per gram)
  double calculatePrice(double goldRatePerGram) {
    // Price = (Weight * Gold Rate) + Making Charges (Approx. 12%) + 3% GST
    final double metalValue = weight * goldRatePerGram;
    final double makingCharges = metalValue * 0.12;
    final double subtotal = metalValue + makingCharges + basePrice;
    final double gst = subtotal * 0.03;
    return subtotal + gst;
  }

  String get displayDesignNo => designNo.isNotEmpty ? designNo : id.toUpperCase();

  factory Product.fromJson(Map<String, dynamic> jsonDoc) {
    final String namePath = jsonDoc['name'] ?? '';
    final String parsedId = namePath.split('/').last;
    
    final Map<String, dynamic> fields = jsonDoc['fields'] ?? {};
    
    // Parse Name
    final String rawName = fields['name']?['stringValue'] ?? 'Jewellery Item';
    final String parsedName = rawName.trim().toUpperCase();
    
    // Parse Category
    final String rawCategory = fields['category']?['stringValue'] ?? 'General';
    String parsedCategory = 'All';
    final String catLower = rawCategory.toLowerCase();
    
    if (catLower.contains('bangle')) {
      parsedCategory = 'Bangles';
    } else if (catLower.contains('ring')) {
      parsedCategory = 'Rings';
    } else if (catLower.contains('neck') || catLower.contains('thushi') || catLower.contains('choker') || catLower.contains('pendant')) {
      parsedCategory = 'Necklaces';
    } else if (catLower.contains('mangal')) {
      parsedCategory = 'Mangalsutras';
    } else if (catLower.contains('chain')) {
      parsedCategory = 'Chains';
    } else if (catLower.contains('ear') || catLower.contains('bali') || catLower.contains('jhumka')) {
      parsedCategory = 'Earrings';
    } else {
      // Capitalize first letter as fallback
      parsedCategory = rawCategory.isNotEmpty 
          ? '${rawCategory[0].toUpperCase()}${rawCategory.substring(1)}'
          : 'General';
    }
    
    // Parse Image URL
    String parsedImageUrl = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop';
    final imagesObj = fields['images'];
    if (imagesObj != null && imagesObj['arrayValue'] != null) {
      final List<dynamic>? values = imagesObj['arrayValue']['values'];
      if (values != null && values.isNotEmpty) {
        parsedImageUrl = values[0]['stringValue'] ?? parsedImageUrl;
      }
    }
    
    // Parse Weight safely from netWeight or grossWeight
    double parsedWeight = 0.0;
    final netWeightObj = fields['netWeight'];
    final grossWeightObj = fields['grossWeight'];
    
    if (netWeightObj != null) {
      parsedWeight = double.tryParse(netWeightObj['integerValue'] ?? netWeightObj['doubleValue']?.toString() ?? '0') ?? 0.0;
    } else if (grossWeightObj != null) {
      parsedWeight = double.tryParse(grossWeightObj['integerValue'] ?? grossWeightObj['doubleValue']?.toString() ?? '0') ?? 0.0;
    }
    
    if (parsedWeight == 0.0) {
      parsedWeight = 8.5; // realistic fallback weight in grams
    }
    
    // Parse Purity
    final String rawPurity = fields['purity']?['stringValue'] ?? '22K';
    String parsedPurity = '22KT Gold';
    if (rawPurity.toUpperCase().contains('18')) {
      parsedPurity = '18KT Gold';
    } else if (rawPurity.toUpperCase().contains('24')) {
      parsedPurity = '24KT Gold';
    } else {
      parsedPurity = '${rawPurity.toUpperCase().replaceAll('K', '')}KT Gold';
    }
    
    // Parse Description
    final String parsedDescription = fields['description']?['stringValue'] ?? 'Exquisite custom-crafted jewellery from Arham Ornaments.';
    
    // Parse Base Price (use the Firestore product price directly as basePrice if laborCharges is zero)
    double parsedBasePrice = 0.0;
    final priceObj = fields['price'];
    if (priceObj != null) {
      parsedBasePrice = double.tryParse(priceObj['integerValue'] ?? priceObj['doubleValue']?.toString() ?? '0') ?? 0.0;
    }
    
    // If weight is loaded, basePrice is usually the making charges portion, so we extract it or set it elegantly
    if (parsedBasePrice > 10000) {
      // This is a direct final price. We'll set basePrice such that dynamic calculation matches, or set it as a flat base
      parsedBasePrice = parsedBasePrice * 0.15; // making charges portion of the price
    }
    
    if (parsedBasePrice == 0.0) {
      parsedBasePrice = 3000.0; // fallback making/labor charges
    }
    
    // Parse featured/trending
    final bool isBestSeller = fields['trending']?['booleanValue'] ?? false;
    final bool isNewArrival = fields['featured']?['booleanValue'] ?? true;
    final String parsedDesignNo = fields['designNo']?['stringValue'] ?? '';
    
    return Product(
      id: parsedId,
      name: parsedName,
      category: parsedCategory,
      imageUrl: parsedImageUrl,
      weight: parsedWeight,
      purity: parsedPurity,
      description: parsedDescription,
      basePrice: parsedBasePrice,
      isBestSeller: isBestSeller,
      isNewArrival: isNewArrival,
      designNo: parsedDesignNo,
    );
  }
}

// Global High-Resolution Arham Ornaments Jewellery Catalog
const List<Product> mockProducts = [
  // 1. Bangles (कंगन)
  Product(
    id: 'b1',
    name: 'Royal Antique Gold Kada',
    category: 'Bangles',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop',
    weight: 24.50,
    purity: '22KT Gold',
    description: 'Exquisite handcrafted antique finish gold kada, detailed with traditional carvings. Perfect for bridal and festive occasions.',
    basePrice: 5500.0,
    isBestSeller: true,
    designNo: 'AO-B1',
  ),
  Product(
    id: 'b2',
    name: 'Sleek CNC Gold Bangles Set',
    category: 'Bangles',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    weight: 18.20,
    purity: '22KT Gold',
    description: 'Modern laser-cut design bangles set of 4, styled with micro-cuts for extreme sparkle and light reflection.',
    basePrice: 3200.0,
    isNewArrival: true,
    designNo: 'AO-B2',
  ),

  // 2. Rings (अंगूठी)
  Product(
    id: 'r1',
    name: 'Majestic Peacock Gold Ring',
    category: 'Rings',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    weight: 6.80,
    purity: '22KT Gold',
    description: 'Traditional cocktail peacock ring intricately designed with minakari work and ruby drop accents.',
    basePrice: 1800.0,
    isBestSeller: true,
    designNo: 'AO-R1',
  ),
  Product(
    id: 'r2',
    name: 'Classic Gold Solitaire Band',
    category: 'Rings',
    imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop',
    weight: 4.50,
    purity: '18KT Gold',
    description: 'Timeless engagement band featuring a premium American diamond solitaire nested in polished solid gold.',
    basePrice: 1200.0,
    isNewArrival: true,
    designNo: 'AO-R2',
  ),

  // 3. Necklaces (हार)
  Product(
    id: 'n1',
    name: 'Grand Temple Choker Necklace',
    category: 'Necklaces',
    imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
    weight: 45.00,
    purity: '22KT Gold',
    description: 'Breathtaking heavy temple choker necklace detailing Goddess Lakshmi motifs and green gem drops.',
    basePrice: 12000.0,
    isBestSeller: true,
    designNo: 'AO-N1',
  ),
  Product(
    id: 'n2',
    name: 'Minimalist Floral Gold Chain',
    category: 'Necklaces',
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop',
    weight: 12.30,
    purity: '18KT Gold',
    description: 'Elegant daily wear chain with a floating floral motif slider, highly polished and lightweight.',
    basePrice: 2800.0,
    isNewArrival: true,
    designNo: 'AO-N2',
  ),

  // 4. Mangalsutras (मंगलसूत्र)
  Product(
    id: 'm1',
    name: 'Royal Black Beads Mangalsutra',
    category: 'Mangalsutras',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    weight: 14.80,
    purity: '22KT Gold',
    description: 'Authentic maharashtrian style wati pendant mangalsutra arranged with auspicious double-layered black beads.',
    basePrice: 3500.0,
    isBestSeller: true,
    designNo: 'AO-M1',
  ),
  Product(
    id: 'm2',
    name: 'Infinity Floral Mangalsutra',
    category: 'Mangalsutras',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
    weight: 8.50,
    purity: '18KT Gold',
    description: 'Contemporary daily wear mangalsutra pendant featuring an infinity loop decorated with floral accents.',
    basePrice: 2200.0,
    isNewArrival: true,
    designNo: 'AO-M2',
  ),

  // 5. Chains (चेन)
  Product(
    id: 'c1',
    name: 'Solid 22KT Gold Rope Chain',
    category: 'Chains',
    imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b1a30dbb2a?q=80&w=600&auto=format&fit=crop',
    weight: 20.00,
    purity: '22KT Gold',
    description: 'Classic heavy ropes braid chain for men. Very strong links with a secure lobster clasp lock.',
    basePrice: 4000.0,
    isBestSeller: true,
    designNo: 'AO-C1',
  ),
  Product(
    id: 'c2',
    name: 'Delicate Italian Box Chain',
    category: 'Chains',
    imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
    weight: 7.20,
    purity: '18KT Gold',
    description: 'Ultra-smooth premium imported box chain with dynamic multi-faceted shine, highly refined.',
    basePrice: 1500.0,
    isNewArrival: true,
    designNo: 'AO-C2',
  ),
];
