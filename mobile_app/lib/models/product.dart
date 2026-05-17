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
  ),
];
