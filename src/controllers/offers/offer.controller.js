const sequelize = require("../config/db")
const {
  Offer,
  OfferSub,
  OfferApplicableCategory,
  OfferApplicableProduct
} = require("../models")

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
      isActive,
      applicability,
      subOffers
    } = req.body

    const offer = await Offer.create(
      { offerCode, title, festival, description, startDate, endDate, isActive },
      { transaction: t }
    )

    // sub offers
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
    for (const cat of applicability.categories || []) {
      for (const sub of cat.subCategories) {
        for (const subOfferId of sub.subOfferIds) {
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

    // product applicability
    for (const p of applicability.products || []) {
      for (const subOfferId of p.subOfferIds) {
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

    await t.commit()

    res.status(201).json({
      message: "Offer created successfully",
      offerId: offer.id
    })
  } catch (err) {
    await t.rollback()
    res.status(500).json({
      message: "Failed to create offer",
      error: err.message
    })
  }
}

exports.getOffer = async (req, res) => {
  const offer = await Offer.findByPk(req.params.id, {
    include: [
      { model: OfferSub },
      { model: OfferApplicableCategory },
      { model: OfferApplicableProduct }
    ]
  })

  if (!offer) {
    return res.status(404).json({ message: "Offer not found" })
  }

  res.json(offer)
}

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
