
const ProductPrice = require("../models/products/price.model");

exports.upsert = async (productId, price, transaction) => {
  const [row] = await ProductPrice.findOrCreate({
    where: { productId },
    defaults: {
      productId,
      ...price, 
      currency: price.currency || "INR",
    },
    transaction,
  });

  // If not created, update the existing one
  if (!row.isNewRecord) {
    await row.update(
      {
        ...price,
        currency: price.currency || "INR",
      },
      { transaction },
    );
  }

  return row;
};

exports.calculatePrice = ({ mrp, sellingPrice, discountPercentage }) => {
  if (!mrp) {
    throw new Error("MRP is required");
  }

  mrp = Number(mrp);

  // CASE 1 → Admin gives discount %
  if (discountPercentage !== undefined && discountPercentage !== null) {
    discountPercentage = Number(discountPercentage);

    sellingPrice = mrp - (mrp * discountPercentage) / 100;
  }

  // CASE 2 → Admin gives selling price
  else if (sellingPrice !== undefined && sellingPrice !== null) {
    sellingPrice = Number(sellingPrice);

    discountPercentage = ((mrp - sellingPrice) / mrp) * 100;
  } else {
    throw new Error(
      "Either sellingPrice or discountPercentage must be provided",
    );
  }

  return {
    mrp,
    sellingPrice: Math.round(sellingPrice),
    discountPercentage: Math.round(discountPercentage),
  };
};
