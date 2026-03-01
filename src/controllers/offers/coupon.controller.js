exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.json({ success: true, data: coupons });
};

exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Not found" });

  await coupon.update(req.body);
  res.json({ success: true });
};

exports.deactivateCoupon = async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Not found" });

  await coupon.update({ isActive: false });
  res.json({ success: true });
};