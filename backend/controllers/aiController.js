/**
 * AI Product Description Generator Controller
 * Provides automatic enterprise catalog copy for procurement products.
 */
exports.generateDescription = async (req, res) => {
  try {
    const { product_name, category, brand, features } = req.body;

    if (!product_name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required to generate description.'
      });
    }

    const cat = (category || 'General Equipment').toLowerCase();
    const brandName = brand || 'Enterprise Grade';
    const featureText = features ? features.trim() : '';

    let generatedDescription = '';

    // Smart ERP Template & Semantic Generator
    if (cat.includes('laptop') || cat.includes('computer')) {
      generatedDescription = `${brandName} ${product_name} engineered for high-performance enterprise workflows, multitasking, and seamless mobility. Features robust security, all-day battery efficiency, and optimized processing power tailored for corporate and technical workloads. ${featureText ? `Key highlights include: ${featureText}.` : 'Built to meet stringent organizational standards with reliable thermal management and modern connectivity.'}`;
    } else if (cat.includes('monitor') || cat.includes('display')) {
      generatedDescription = `Professional ${brandName} ${product_name} featuring ultra-clear display resolution, wide viewing angles, and flicker-free eye comfort technology. Designed for engineering, design studios, and multitasking office desks with versatile tilt, swivel, and ergonomic mounting options. ${featureText ? `Includes: ${featureText}.` : 'Equipped with versatile HDMI, DisplayPort, and USB-C connectivity.'}`;
    } else if (cat.includes('peripheral') || cat.includes('accessory') || cat.includes('mouse') || cat.includes('keyboard')) {
      generatedDescription = `Durable and precision-crafted ${brandName} ${product_name} designed for intensive commercial daily usage. Offers responsive feedback, plug-and-play compatibility across enterprise operating systems, and ergonomic strain reduction. ${featureText ? `Specifications: ${featureText}.` : 'Engineered for longevity with low latency and tactile reliability.'}`;
    } else if (cat.includes('network') || cat.includes('server') || cat.includes('switch') || cat.includes('cable')) {
      generatedDescription = `High-availability ${brandName} ${product_name} designed for mission-critical IT infrastructure and high-throughput data networking. Provides enterprise security protocols, low latency transmission, and seamless rackmount scalability. ${featureText ? `Technical specs: ${featureText}.` : 'Tested for rigorous continuous 24/7 uptime compliance.'}`;
    } else if (cat.includes('furniture') || cat.includes('chair') || cat.includes('desk')) {
      generatedDescription = `Ergonomically engineered ${brandName} ${product_name} crafted to maximize posture support and workplace productivity. Features heavy-duty structural framing, multi-point adjustments, and premium breathable materials meeting commercial BIFMA standards. ${featureText ? `Attributes: ${featureText}.` : 'Designed for extended 8+ hour comfort.'}`;
    } else if (cat.includes('printer') || cat.includes('scanner')) {
      generatedDescription = `High-yield ${brandName} ${product_name} built for high-volume office documentation and sharp quality output. Features secure network printing, duplex efficiency, and low cost-per-page consumable economics. ${featureText ? `Equipped with: ${featureText}.` : 'Includes automated document feeding and mobile print capability.'}`;
    } else {
      generatedDescription = `High-quality ${brandName} ${product_name} cataloged under ${category || 'General Supplies'}. Manufactured to meet organizational quality benchmarks with high durability, dependable warranty support, and competitive total cost of ownership. ${featureText ? `Features: ${featureText}.` : 'Ideal for centralized enterprise procurement and departmental deployment.'}`;
    }

    res.json({
      success: true,
      description: generatedDescription,
      source: 'AI Catalog Assistant v2.0'
    });
  } catch (error) {
    console.error('AI generator error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate product description.' });
  }
};
