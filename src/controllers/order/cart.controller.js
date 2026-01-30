const { CartItem, Product, ProductPrice, ProductVariant, VariantImage } = require("../../models");

// 1. Get Cart (The "Industry Standard" Fetch)
exports.getCart = async (req, res) => {
  try {
    const cart = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: ProductPrice, as: "price" }] // Fetch real-time price
        },
        {
          model: ProductVariant,
          as: "variant",
          include: [{ model: VariantImage, as: "images" }] // Fetch the color-specific image
        }
      ]
    });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Add / Increase Quantity
exports.addToCart = async (req, res) => {
  const { productId, variantId } = req.body;
  const userId = req.user.id;

  // Find existing row or create new one
  const [item, created] = await CartItem.findOrCreate({
    where: { userId, productId, variantId },
    defaults: { quantity: 1 }
  });

  if (!created) {
    await item.increment('quantity', { by: 1 });
  }
  res.json({ success: true, message: "Cart updated" });
};

// 3. Decrease / Delete Logic (Industry Standard)
exports.decreaseQuantity = async (req, res) => {
  const { productId, variantId } = req.body;
  const userId = req.user.id;

  const item = await CartItem.findOne({ where: { userId, productId, variantId } });

  if (!item) return res.status(404).json({ message: "Item not found" });

  if (item.quantity > 1) {
    await item.decrement('quantity', { by: 1 });
  } else {
    // If it was the last 1, remove the row entirely
    await item.destroy();
  }
  res.json({ success: true, message: "Quantity updated" });
};