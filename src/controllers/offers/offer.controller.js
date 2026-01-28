const sequelize = require("../../config/db")
const {
  Offer,
  OfferSub,
  OfferApplicableCategory,
  OfferApplicableProduct
} = require("../../models")

const ALLOWED_DISCOUNT_TYPES = ["FLAT", "PERCENTAGE"]

/**
 * CREATE OFFER
 */
exports.createOffer = async (req, res) => {
  const t = await sequelize.transaction()

  try {
    const {
      offerCode,
      title,
      festival,
      description,
      startDate,
      endDate,
      isActive = true,
      applicability = {},
      subOffers = []
    } = req.body

    if (!offerCode || !title || !startDate || !endDate) {
      throw new Error("offerCode, title, startDate and endDate are required")
    }

    if (!Array.isArray(subOffers) || subOffers.length === 0) {
      throw new Error("At least one subOffer is required")
    }

    // validate discountType ENUM
    for (const s of subOffers) {
      if (!ALLOWED_DISCOUNT_TYPES.includes(s.discountType)) {
        throw new Error(
          `Invalid discountType '${s.discountType}'. Allowed: FLAT, PERCENTAGE`
        )
      }
    }

    // create offer
    const offer = await Offer.create(
      {
        offerCode,
        title,
        festival,
        description,
        startDate,
        endDate,
        isActive
      },
      { transaction: t }
    )

    // create sub offers
    await OfferSub.bulkCreate(
      subOffers.map(s => ({
        offerId: offer.id,
        code: s.code,
        title: s.title,
        description: s.description,
        discountType: s.discountType,
        discountValue: s.discountValue,
        maxDiscount: s.maxDiscount,
        minOrderValue: s.minOrderValue,
        bank: s.bank,
        paymentMethod: s.paymentMethod,
        validFrom: s.validFrom,
        validTill: s.validTill,
        priority: s.priority
      })),
      { transaction: t }
    )

    // category applicability
    if (Array.isArray(applicability.categories)) {
      for (const cat of applicability.categories) {
        for (const sub of cat.subCategories || []) {
          for (const subOfferId of sub.subOfferIds || []) {
            await OfferApplicableCategory.create(
              {
                offerId: offer.id,
                categoryId: cat.categoryId,
                subCategoryId: sub.subCategoryId,
                subOfferId
              },
              { transaction: t }
            )
          }
        }
      }
    }

    // product applicability
    if (Array.isArray(applicability.products)) {
      for (const p of applicability.products) {
        for (const subOfferId of p.subOfferIds || []) {
          await OfferApplicableProduct.create(
            {
              offerId: offer.id,
              productId: p.productId,
              subOfferId
            },
            { transaction: t }
          )
        }
      }
    }

    await t.commit()

    return res.status(201).json({
      message: "Offer created successfully",
      offerId: offer.id
    })
  } catch (err) {
    await t.rollback()
    return res.status(500).json({
      message: "Failed to create offer",
      error: err.message
    })
  }
}

/**
 * GET OFFER BY ID
 */
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [
        { model: OfferSub, as: "subOffers" },
        { model: OfferApplicableCategory, as: "applicableCategories" },
        { model: OfferApplicableProduct, as: "applicableProducts" }
      ]
    })

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" })
    }

    return res.json(offer)
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch offer",
      error: err.message
    })
  }
}


/**
 * GET ACTIVE OFFERS FOR A PRODUCT
 */
exports.getOffersForProduct = async (productId) => {
  return Offer.findAll({
    where: { isActive: true },
    include: [
      {
        model: OfferApplicableProduct,
        where: { productId },
        required: false
      },
      {
        model: OfferApplicableCategory,
        required: false
      },
      {
        model: OfferSub
      }
    ]
  })
}

/**
 * DEACTIVATE OFFER
 */
exports.deactivateOffer = async (req, res) => {
  const t = await sequelize.transaction()

  try {
    const offer = await Offer.findByPk(req.params.id, { transaction: t })

    if (!offer) {
      await t.rollback()
      return res.status(404).json({ message: "Offer not found" })
    }

    await offer.update({ isActive: false }, { transaction: t })

    await t.commit()

    return res.json({
      message: "Offer deactivated successfully",
      offerId: offer.id
    })
  } catch (err) {
    await t.rollback()
    return res.status(500).json({
      message: "Failed to deactivate offer",
      error: err.message
    })
  }
}
