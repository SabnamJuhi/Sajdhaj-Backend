// const sequelize = require("../../config/db")
// const {
//   Offer,
//   OfferSub,
//   OfferApplicableCategory,
//   OfferApplicableProduct
// } = require("../../models")

// const ALLOWED_DISCOUNT_TYPES = ["FLAT", "PERCENTAGE"]

// /**
//  * CREATE OFFER
//  */
// exports.createOffer = async (req, res) => {
//   const t = await sequelize.transaction()

//   try {
//     const {
//       offerCode,
//       title,
//       festival,
//       description,
//       startDate,
//       endDate,
//       isActive = true,
//       applicability = {},
//       subOffers = []
//     } = req.body

//     if (!offerCode || !title || !startDate || !endDate) {
//       throw new Error("offerCode, title, startDate and endDate are required")
//     }

//     if (!Array.isArray(subOffers) || subOffers.length === 0) {
//       throw new Error("At least one subOffer is required")
//     }

//     // validate discountType ENUM
//     for (const s of subOffers) {
//       if (!ALLOWED_DISCOUNT_TYPES.includes(s.discountType)) {
//         throw new Error(
//           `Invalid discountType '${s.discountType}'. Allowed: FLAT, PERCENTAGE`
//         )
//       }
//     }

//     // create offer
//     const offer = await Offer.create(
//       {
//         offerCode,
//         title,
//         festival,
//         description,
//         startDate,
//         endDate,
//         isActive
//       },
//       { transaction: t }
//     )

//     // create sub offers
//     await OfferSub.bulkCreate(
//       subOffers.map(s => ({
//         offerId: offer.id,
//         code: s.code,
//         title: s.title,
//         description: s.description,
//         discountType: s.discountType,
//         discountValue: s.discountValue,
//         maxDiscount: s.maxDiscount,
//         minOrderValue: s.minOrderValue,
//         bank: s.bank,
//         paymentMethod: s.paymentMethod,
//         validFrom: s.validFrom,
//         validTill: s.validTill,
//         priority: s.priority
//       })),
//       { transaction: t }
//     )

//     // category applicability
//     if (Array.isArray(applicability.categories)) {
//       for (const cat of applicability.categories) {
//         for (const sub of cat.subCategories || []) {
//           for (const subOfferId of sub.subOfferIds || []) {
//             await OfferApplicableCategory.create(
//               {
//                 offerId: offer.id,
//                 categoryId: cat.categoryId,
//                 subCategoryId: sub.subCategoryId,
//                 subOfferId
//               },
//               { transaction: t }
//             )
//           }
//         }
//       }
//     }

//     // product applicability
//     if (Array.isArray(applicability.products)) {
//       for (const p of applicability.products) {
//         for (const subOfferId of p.subOfferIds || []) {
//           await OfferApplicableProduct.create(
//             {
//               offerId: offer.id,
//               productId: p.productId,
//               subOfferId
//             },
//             { transaction: t }
//           )
//         }
//       }
//     }

//     await t.commit()

//     return res.status(201).json({
//       message: "Offer created successfully",
//       offerId: offer.id
//     })
//   } catch (err) {
//     await t.rollback()
//     return res.status(500).json({
//       message: "Failed to create offer",
//       error: err.message
//     })
//   }
// }

//  // GET ALL OFFERS (Fully Nested)

// exports.getAllOffers = async (req, res) => {
//   try {
//     const offers = await Offer.findAll({
//       include: [
//         {
//           model: OfferSub,
//           as: "subOffers"
//         },
//         {
//           model: OfferApplicableCategory,
//           as: "applicableCategories"
//         },
//         {
//           model: OfferApplicableProduct,
//           as: "offerApplicableProducts"
//         }
//       ],
//       order: [["createdAt", "DESC"]] // Newest offers at the top
//     });

//     return res.status(200).json({
//       success: true,
//       count: offers.length,
//       data: offers
//     });
//   } catch (err) {
//     console.error("GetAllOffers Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch offers",
//       error: err.message
//     });
//   }
// };

// /**
//  * GET OFFER BY ID
//  */
// exports.getOffer = async (req, res) => {
//   try {
//     const offer = await Offer.findByPk(req.params.id, {
//       include: [
//         { model: OfferSub, as: "subOffers" },
//         { model: OfferApplicableCategory, as: "applicableCategories" },
//         // CHANGE THIS LINE BELOW:
//         { model: OfferApplicableProduct, as: "offerApplicableProducts" }
//       ]
//     });

//     if (!offer) {
//       return res.status(404).json({ message: "Offer not found" });
//     }

//     return res.json(offer);
//   } catch (err) {
//     return res.status(500).json({
//       message: "Failed to fetch offer",
//       error: err.message
//     });
//   }
// };

// /**
//  * GET ACTIVE OFFERS FOR A PRODUCT
//  */
// exports.getOffersForProduct = async (productId) => {
//   return Offer.findAll({
//     where: { isActive: true },
//     include: [
//       {
//         model: OfferApplicableProduct,
//         where: { productId },
//         required: false
//       },
//       {
//         model: OfferApplicableCategory,
//         required: false
//       },
//       {
//         model: OfferSub
//       }
//     ]
//   })
// }

// /**
//  * DEACTIVATE OFFER
//  */
// exports.deactivateOffer = async (req, res) => {
//   const t = await sequelize.transaction()

//   try {
//     const offer = await Offer.findByPk(req.params.id, { transaction: t })

//     if (!offer) {
//       await t.rollback()
//       return res.status(404).json({ message: "Offer not found" })
//     }

//     await offer.update({ isActive: false }, { transaction: t })

//     await t.commit()

//     return res.json({
//       message: "Offer deactivated successfully",
//       offerId: offer.id
//     })
//   } catch (err) {
//     await t.rollback()
//     return res.status(500).json({
//       message: "Failed to deactivate offer",
//       error: err.message
//     })
//   }
// }

// /**
//  * UPDATE OFFER
//  */
// exports.updateOffer = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const {
//       offerCode,
//       title,
//       festival,
//       description,
//       startDate,
//       endDate,
//       isActive,
//       applicability = {},
//       subOffers = []
//     } = req.body;

//     // 1. Check if Offer exists
//     const offer = await Offer.findByPk(id, { transaction: t });
//     if (!offer) {
//       await t.rollback();
//       return res.status(404).json({ message: "Offer not found" });
//     }

//     // 2. Validate discount types if subOffers are provided
//     if (subOffers.length > 0) {
//       for (const s of subOffers) {
//         if (!ALLOWED_DISCOUNT_TYPES.includes(s.discountType)) {
//           throw new Error(`Invalid discountType '${s.discountType}'. Allowed: FLAT, PERCENTAGE`);
//         }
//       }
//     }

//     // 3. Update Main Offer Details
//     await offer.update({
//       offerCode: offerCode || offer.offerCode,
//       title: title || offer.title,
//       festival: festival || offer.festival,
//       description: description || offer.description,
//       startDate: startDate || offer.startDate,
//       endDate: endDate || offer.endDate,
//       isActive: isActive !== undefined ? isActive : offer.isActive
//     }, { transaction: t });

//     // --- REFRESH RELATIONS (Delete Old and Create New) ---

//     // 4. Update Sub Offers
//     if (subOffers.length > 0) {
//       await OfferSub.destroy({ where: { offerId: id }, transaction: t });
//       await OfferSub.bulkCreate(
//         subOffers.map(s => ({
//           offerId: id,
//           code: s.code,
//           title: s.title,
//           description: s.description,
//           discountType: s.discountType,
//           discountValue: s.discountValue,
//           maxDiscount: s.maxDiscount,
//           minOrderValue: s.minOrderValue,
//           bank: s.bank,
//           paymentMethod: s.paymentMethod,
//           validFrom: s.validFrom,
//           validTill: s.validTill,
//           priority: s.priority
//         })),
//         { transaction: t }
//       );
//     }

//     // 5. Update Category Applicability
//     if (applicability.categories) {
//       await OfferApplicableCategory.destroy({ where: { offerId: id }, transaction: t });
//       for (const cat of applicability.categories) {
//         for (const sub of cat.subCategories || []) {
//           for (const subOfferId of sub.subOfferIds || []) {
//             await OfferApplicableCategory.create({
//               offerId: id,
//               categoryId: cat.categoryId,
//               subCategoryId: sub.subCategoryId,
//               subOfferId
//             }, { transaction: t });
//           }
//         }
//       }
//     }

//     // 6. Update Product Applicability
//     if (applicability.products) {
//       await OfferApplicableProduct.destroy({ where: { offerId: id }, transaction: t });
//       for (const p of applicability.products) {
//         for (const subOfferId of p.subOfferIds || []) {
//           await OfferApplicableProduct.create({
//             offerId: id,
//             productId: p.productId,
//             subOfferId
//           }, { transaction: t });
//         }
//       }
//     }

//     await t.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Offer updated successfully",
//       offerId: id
//     });

//   } catch (err) {
//     await t.rollback();
//     console.error("UpdateOffer Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update offer",
//       error: err.message
//     });
//   }
// };







// controllers/offers/offer.controller.js

const sequelize = require("../../config/db");
const {
  Offer,
  OfferSub,
  OfferApplicableCategory,
  OfferApplicableProduct,
  OfferImage,
  SubOfferImage,
  Category,
  SubCategory,
  Product,
  ProductPrice,
  ProductImage,
} = require("../../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

const ALLOWED_DISCOUNT_TYPES = ["FLAT", "PERCENTAGE"];

// controllers/offers/offer.controller.js

exports.createOffer = async (req, res) => {
  const t = await sequelize.transaction();
  let uploadedFiles = []; // Initialize as array

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
      subOffers = [],
    } = req.body;

    // Parse JSON strings
    const parsedSubOffers =
      typeof subOffers === "string" ? JSON.parse(subOffers) : subOffers;
    const parsedApplicability =
      typeof applicability === "string"
        ? JSON.parse(applicability)
        : applicability;

    // Validation
    if (!offerCode || !title || !startDate || !endDate) {
      throw new Error("offerCode, title, startDate and endDate are required");
    }

    if (!Array.isArray(parsedSubOffers) || parsedSubOffers.length === 0) {
      throw new Error("At least one subOffer is required");
    }

    // Validate discount types
    for (const s of parsedSubOffers) {
      if (!ALLOWED_DISCOUNT_TYPES.includes(s.discountType)) {
        throw new Error(
          `Invalid discountType '${s.discountType}'. Allowed: FLAT, PERCENTAGE`,
        );
      }
    }

    // Create main offer
    const offer = await Offer.create(
      {
        offerCode,
        title,
        festival,
        description,
        startDate,
        endDate,
        isActive,
      },
      { transaction: t },
    );

    // Track uploaded files safely
    if (req.files && Array.isArray(req.files)) {
      uploadedFiles = [...req.files]; // Make a copy
    } else if (req.files && typeof req.files === "object") {
      // If req.files is an object (from upload.fields()), convert to array
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          uploadedFiles.push(...fileArray);
        }
      });
    }

    console.log(`Processing ${uploadedFiles.length} files`);

    // Process files - ONE IMAGE PER OFFER AND PER SUB-OFFER
    let offerImage = null;
    const subOfferImagesMap = {};

    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fieldName = file.fieldname;

        // Main offer image (only one)
        if (fieldName === "offerImages") {
          // Changed from offerImages_banner to offerImage
          offerImage = {
            offerId: offer.id,
            imageType: "banner",
            imageUrl: `/uploads/products/${file.filename}`,
            altText: `${offer.title} banner image`,
            displayOrder: 0,
            isPrimary: true,
          };
        }

        // Sub-offer images - one per sub-offer
        else if (fieldName.startsWith("subOfferImages_")) {
          // Format: subOfferImage_0, subOfferImage_1, etc.
          const parts = fieldName.split("_");
          if (parts.length >= 2) {
            const subOfferIndex = parseInt(parts[1]); // Get the index

            subOfferImagesMap[subOfferIndex] = {
              imageType: "badge", // Default type, or you can make this configurable
              file,
            };
          }
        }
      });
    }

    // Save offer image (if provided)
    if (offerImage) {
      await OfferImage.create(offerImage, { transaction: t });
      console.log("Offer image saved");
    }

    // Create sub offers and their images (one per sub-offer)
    for (let i = 0; i < parsedSubOffers.length; i++) {
      const s = parsedSubOffers[i];

      // Create sub offer
      const subOffer = await OfferSub.create(
        {
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
          validFrom: s.validFrom || startDate,
          validTill: s.validTill || endDate,
          priority: s.priority || 0,
        },
        { transaction: t },
      );

      // Create single image for this sub-offer (if provided)
      const subOfferImageData = subOfferImagesMap[i];
      if (subOfferImageData) {
        await SubOfferImage.create(
          {
            subOfferId: subOffer.id,
            imageType: "badge",
            imageUrl: `/uploads/products/${subOfferImageData.file.filename}`,
            altText: `${subOffer.title} image`,
            displayOrder: 0,
          },
          { transaction: t },
        );

        console.log(`Image saved for sub-offer ${i}`);
      }
    }

    // Handle applicability (categories and products)
    if (Array.isArray(parsedApplicability.categories)) {
      for (const cat of parsedApplicability.categories) {
        for (const sub of cat.subCategories || []) {
          for (const subOfferId of sub.subOfferIds || []) {
            await OfferApplicableCategory.create(
              {
                offerId: offer.id,
                categoryId: cat.categoryId,
                subCategoryId: sub.subCategoryId,
                subOfferId,
              },
              { transaction: t },
            );
          }
        }
      }
    }

    if (Array.isArray(parsedApplicability.products)) {
      for (const p of parsedApplicability.products) {
        for (const subOfferId of p.subOfferIds || []) {
          await OfferApplicableProduct.create(
            {
              offerId: offer.id,
              productId: p.productId,
              subOfferId,
            },
            { transaction: t },
          );
        }
      }
    }

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Offer created successfully with images",
      data: {
        offerId: offer.id,
        offerCode: offer.offerCode,
      },
    });
  } catch (err) {
    await t.rollback();

    // SAFELY delete uploaded files if transaction fails
    console.log("Cleaning up files...");

    if (
      uploadedFiles &&
      Array.isArray(uploadedFiles) &&
      uploadedFiles.length > 0
    ) {
      uploadedFiles.forEach((file) => {
        try {
          if (file && file.path) {
            const filePath = path.join(__dirname, "../../", file.path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
          }
        } catch (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      });
    }

    console.error("Create Offer Error:", err);

    // Better error messages
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message:
          "Offer code already exists. Please use a different offer code.",
        error: err.errors[0].message,
      });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create offer",
      error: err.message,
    });
  }
};

/**
 * UPDATE OFFER WITH IMAGES
 */
exports.updateOffer = async (req, res) => {
  const t = await sequelize.transaction();
  let uploadedFiles = []; // Track uploaded files for cleanup
  let oldImages = []; // Track old images to delete

  try {
    const { id } = req.params;
    const {
      offerCode,
      title,
      festival,
      description,
      startDate,
      endDate,
      isActive,
      applicability = {},
      subOffers = [],
    } = req.body;

    // Parse JSON strings
    const parsedSubOffers = typeof subOffers === "string" ? JSON.parse(subOffers) : subOffers;
    const parsedApplicability = typeof applicability === "string" ? JSON.parse(applicability) : applicability;

    // Find the offer
    const offer = await Offer.findByPk(id, { 
      transaction: t,
      include: [
        { model: OfferImage, as: 'images' },
        { model: OfferSub, as: 'subOffers', include: [{ model: SubOfferImage, as: 'images' }] }
      ]
    });

    if (!offer) {
      await t.rollback();
      return res.status(404).json({ message: "Offer not found" });
    }

    // Validation
    if (!offerCode || !title || !startDate || !endDate) {
      throw new Error("offerCode, title, startDate and endDate are required");
    }

    if (!Array.isArray(parsedSubOffers) || parsedSubOffers.length === 0) {
      throw new Error("At least one subOffer is required");
    }

    // Validate discount types
    for (const s of parsedSubOffers) {
      if (!ALLOWED_DISCOUNT_TYPES.includes(s.discountType)) {
        throw new Error(
          `Invalid discountType '${s.discountType}'. Allowed: FLAT, PERCENTAGE`,
        );
      }
    }

    // Update main offer
    await offer.update(
      {
        offerCode,
        title,
        festival,
        description,
        startDate,
        endDate,
        isActive: isActive !== undefined ? isActive : offer.isActive,
      },
      { transaction: t },
    );

    // Track uploaded files safely
    if (req.files && Array.isArray(req.files)) {
      uploadedFiles = [...req.files];
    } else if (req.files && typeof req.files === "object") {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          uploadedFiles.push(...fileArray);
        }
      });
    }

    console.log(`Processing ${uploadedFiles.length} new files for update`);

    // Process new images - ONE IMAGE PER OFFER AND PER SUB-OFFER
    let newOfferImage = null;
    const newSubOfferImagesMap = {};

    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fieldName = file.fieldname;

        // Main offer image
        if (fieldName === "offerImages") {
          newOfferImage = {
            offerId: offer.id,
            imageType: "banner",
            imageUrl: `/uploads/products/${file.filename}`,
            altText: `${offer.title} banner image`,
            displayOrder: 0,
            isPrimary: true,
          };
        }
        // Sub-offer images
        else if (fieldName.startsWith("subOfferImages_")) {
          const parts = fieldName.split("_");
          if (parts.length >= 2) {
            const subOfferIndex = parseInt(parts[1]);
            newSubOfferImagesMap[subOfferIndex] = {
              imageType: "badge",
              file,
            };
          }
        }
      });
    }

    // Handle Offer Image Update
    if (newOfferImage) {
      // Delete old offer images
      if (offer.images && offer.images.length > 0) {
        oldImages.push(...offer.images.map(img => ({
          path: img.imageUrl,
          id: img.id
        })));
        
        await OfferImage.destroy({
          where: { offerId: offer.id },
          transaction: t
        });
      }
      
      // Create new offer image
      await OfferImage.create(newOfferImage, { transaction: t });
      console.log("Offer image updated");
    }

    // Get existing sub-offers
    const existingSubOffers = offer.subOffers || [];
    
    // Create a map of existing sub-offers by index
    const existingSubOffersMap = {};
    existingSubOffers.forEach((sub, index) => {
      existingSubOffersMap[index] = sub;
    });

    // Track which sub-offer IDs to keep
    const keepSubOfferIds = [];

    // Update/Create sub offers
    for (let i = 0; i < parsedSubOffers.length; i++) {
      const s = parsedSubOffers[i];
      let subOffer;

      // Check if this sub-offer already exists (by id or by matching data)
      const existingSubOffer = s.id 
        ? existingSubOffers.find(sub => sub.id === s.id)
        : existingSubOffers[i];

      if (existingSubOffer) {
        // Update existing sub-offer
        subOffer = existingSubOffer;
        await subOffer.update(
          {
            code: s.code,
            title: s.title,
            description: s.description,
            discountType: s.discountType,
            discountValue: s.discountValue,
            maxDiscount: s.maxDiscount,
            minOrderValue: s.minOrderValue,
            bank: s.bank,
            paymentMethod: s.paymentMethod,
            validFrom: s.validFrom || startDate,
            validTill: s.validTill || endDate,
            priority: s.priority || 0,
          },
          { transaction: t },
        );
        keepSubOfferIds.push(subOffer.id);
      } else {
        // Create new sub-offer
        subOffer = await OfferSub.create(
          {
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
            validFrom: s.validFrom || startDate,
            validTill: s.validTill || endDate,
            priority: s.priority || 0,
          },
          { transaction: t },
        );
        keepSubOfferIds.push(subOffer.id);
      }

      // Handle sub-offer image update
      const newSubOfferImage = newSubOfferImagesMap[i];
      
      // Delete old sub-offer image if exists
      if (subOffer.images && subOffer.images.length > 0) {
        oldImages.push(...subOffer.images.map(img => ({
          path: img.imageUrl,
          id: img.id
        })));
        
        await SubOfferImage.destroy({
          where: { subOfferId: subOffer.id },
          transaction: t
        });
      }

      // Create new sub-offer image if provided
      if (newSubOfferImage) {
        await SubOfferImage.create(
          {
            subOfferId: subOffer.id,
            imageType: "badge",
            imageUrl: `/uploads/products/${newSubOfferImage.file.filename}`,
            altText: `${subOffer.title} image`,
            displayOrder: 0,
          },
          { transaction: t },
        );
        console.log(`Image updated for sub-offer ${i}`);
      }
    }

    // Delete sub-offers that are no longer needed
    const subOffersToDelete = existingSubOffers.filter(
      sub => !keepSubOfferIds.includes(sub.id)
    );

    for (const sub of subOffersToDelete) {
      // Delete sub-offer images
      if (sub.images && sub.images.length > 0) {
        oldImages.push(...sub.images.map(img => ({
          path: img.imageUrl,
          id: img.id
        })));
        
        await SubOfferImage.destroy({
          where: { subOfferId: sub.id },
          transaction: t
        });
      }
      
      // Delete sub-offer
      await sub.destroy({ transaction: t });
    }

    // Handle applicability update (categories and products)
    // First delete existing applicability
    await OfferApplicableCategory.destroy({
      where: { offerId: offer.id },
      transaction: t
    });

    await OfferApplicableProduct.destroy({
      where: { offerId: offer.id },
      transaction: t
    });

    // Create new applicability
    if (Array.isArray(parsedApplicability.categories)) {
      for (const cat of parsedApplicability.categories) {
        for (const sub of cat.subCategories || []) {
          for (const subOfferId of sub.subOfferIds || []) {
            await OfferApplicableCategory.create(
              {
                offerId: offer.id,
                categoryId: cat.categoryId,
                subCategoryId: sub.subCategoryId,
                subOfferId,
              },
              { transaction: t },
            );
          }
        }
      }
    }

    if (Array.isArray(parsedApplicability.products)) {
      for (const p of parsedApplicability.products) {
        for (const subOfferId of p.subOfferIds || []) {
          await OfferApplicableProduct.create(
            {
              offerId: offer.id,
              productId: p.productId,
              subOfferId,
            },
            { transaction: t },
          );
        }
      }
    }

    await t.commit();

    // Delete old image files from disk
    for (const oldImage of oldImages) {
      try {
        if (oldImage.path) {
          // Extract filename from URL
          const filename = oldImage.path.split('/').pop();
          const filePath = path.join(__dirname, "../../uploads/products/", filename);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old image file: ${filePath}`);
          }
        }
      } catch (unlinkErr) {
        console.error("Error deleting old image file:", unlinkErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully with images",
      data: {
        offerId: offer.id,
        offerCode: offer.offerCode,
      },
    });

  } catch (err) {
    await t.rollback();

    // Delete newly uploaded files if transaction fails
    console.log("Cleaning up new files...");
    if (uploadedFiles && Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        try {
          if (file && file.path) {
            const filePath = path.join(__dirname, "../../", file.path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted new file: ${filePath}`);
            }
          }
        } catch (unlinkErr) {
          console.error("Error deleting new file:", unlinkErr);
        }
      });
    }

    console.error("Update Offer Error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Offer code already exists. Please use a different offer code.",
        error: err.errors[0].message,
      });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: err.message,
    });
  }
};

/**
 * GET ACTIVE OFFERS FOR FRONTEND (with images grouped by type)
 */
exports.getActiveOffersForFrontend = async (req, res) => {
  try {
    const now = new Date();

    const offers = await Offer.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      include: [
        {
          model: OfferImage,
          as: "images",
          attributes: ["imageType", "imageUrl", "isPrimary"],
          required: false,
        },
        {
          model: OfferSub,
          as: "subOffers",
          where: {
            validFrom: { [Op.lte]: now },
            validTill: { [Op.gte]: now },
          },
          required: false,
          include: [
            {
              model: SubOfferImage,
              as: "images",
              attributes: ["imageType", "imageUrl"],
              required: false,
            },
          ],
        },
        {
          model: OfferApplicableCategory,
          as: "applicableCategories",
          required: false,
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: OfferApplicableProduct,
          as: "offerApplicableProducts",
          required: false,
          include: [
            {
              model: Product,
              attributes: ["id", "title"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOffers = offers.map((offer) => {
      const offerBanner = offer.images?.find(
        (img) => img.imageType === "banner"
      );

      return {
        id: offer.id,
        offerCode: offer.offerCode,
        title: offer.title,
        festival: offer.festival,
        description: offer.description,

        bannerImage: offerBanner?.imageUrl || null,

        subOffers:
          offer.subOffers?.map((sub) => {
            const badgeImage = sub.images?.find(
              (img) => img.imageType === "badge"
            );

            return {
              id: sub.id,
              code: sub.code,
              title: sub.title,
              description: sub.description,
              discountType: sub.discountType,
              discountValue: sub.discountValue,
              maxDiscount: sub.maxDiscount,
              minOrderValue: sub.minOrderValue,
              badgeImage: badgeImage?.imageUrl || null,
            };
          }) || [],

        applicableCategories:
          offer.applicableCategories?.map((ac) => ({
            categoryId: ac.categoryId,
            categoryName: ac.category?.name || null,
            subCategoryId: ac.subCategoryId,
            subOfferId: ac.subOfferId,
          })) || [],

        applicableProducts:
          offer.offerApplicableProducts?.map((ap) => {
            const product = ap.Product;

            return {
              productId: ap.productId,
              subOfferId: ap.subOfferId,
              title: product?.title || null,
            };
          }) || [],

        startDate: offer.startDate,
        endDate: offer.endDate,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedOffers.length,
      data: formattedOffers,
    });
  } catch (err) {
    console.error("GetActiveOffersForFrontend Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active offers",
      error: err.message,
    });
  }
};

/**
 * GET ALL OFFERS WITH IMAGES
 */
exports.getAllOffersWithImages = async (req, res) => {
  try {
    const offers = await Offer.findAll({
      include: [
        {
          model: OfferImage,
          as: "images",
          attributes: ["id", "imageType", "imageUrl", "altText", "isPrimary"],
          required: false,
        },
        {
          model: OfferSub,
          as: "subOffers",
          required: false,
          include: [
            {
              model: SubOfferImage,
              as: "images",
              attributes: ["id", "imageType", "imageUrl", "altText"],
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = offers.map((offer) => {
      const o = offer.toJSON();

      return {
        id: o.id,
        offerCode: o.offerCode,
        title: o.title,
        festival: o.festival,
        description: o.description,
        startDate: o.startDate,
        endDate: o.endDate,
        isActive: o.isActive,
        displayOrder: o.displayOrder,

        images: o.images?.map((img) => ({
          type: img.imageType,
          url: img.imageUrl,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),

        subOffers: o.subOffers?.map((sub) => ({
          id: sub.id,
          code: sub.code,
          title: sub.title,
          description: sub.description,
          discountType: sub.discountType,
          discountValue: sub.discountValue,
          images: sub.images?.map((img) => ({
            type: img.imageType,
            url: img.imageUrl,
            altText: img.altText,
          })),
        })),
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error("GetAllOffersWithImages Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: err.message,
    });
  }
};

/**
 * DEACTIVATE OFFER
 */
exports.deactivateOffer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const offer = await Offer.findByPk(req.params.id, { transaction: t });

    if (!offer) {
      await t.rollback();
      return res.status(404).json({ message: "Offer not found" });
    }

    await offer.update({ isActive: false }, { transaction: t });

    await t.commit();

    return res.json({
      message: "Offer deactivated successfully",
      offerId: offer.id,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Failed to deactivate offer",
      error: err.message,
    });
  }
};

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
        required: false,
      },
      {
        model: OfferApplicableCategory,
        required: false,
      },
      {
        model: OfferSub,
      },
    ],
  });
};

// GET ALL OFFERS (Fully Nested)

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({
      include: [
        {
          model: OfferSub,
          as: "subOffers",
        },
        {
          model: OfferApplicableCategory,
          as: "applicableCategories",
        },
        {
          model: OfferApplicableProduct,
          as: "offerApplicableProducts",
        },
      ],
      order: [["createdAt", "DESC"]], // Newest offers at the top
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (err) {
    console.error("GetAllOffers Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: err.message,
    });
  }
};

/**
 * GET OFFER BY ID
 */
/**
 * GET OFFER BY ID WITH IMAGES
 */
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [
        { 
          model: OfferImage, 
          as: "images",
          attributes: ['id', 'imageType', 'imageUrl', 'altText', 'isPrimary', 'displayOrder'],
          required: false 
        },
        { 
          model: OfferSub, 
          as: "subOffers",
          include: [
            {
              model: SubOfferImage,
              as: "images",
              attributes: ['id', 'imageType', 'imageUrl', 'altText', 'displayOrder'],
              required: false
            }
          ]
        },
        { 
          model: OfferApplicableCategory, 
          as: "applicableCategories",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ['id', 'name']
            },
            {
              model: SubCategory,
              as: "subCategory",
              attributes: ['id', 'name']
            }
          ]
        },
        { 
          model: OfferApplicableProduct, 
          as: "offerApplicableProducts",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ['id', 'title', 'brandName'],
            }
          ]
        },
      ],
    });

    if (!offer) {
      return res.status(404).json({ 
        success: false,
        message: "Offer not found" 
      });
    }

    // Format the response for better frontend consumption
    const formattedOffer = offer.toJSON();

    // Group offer images by type
    const imagesByType = {};
    if (formattedOffer.images && formattedOffer.images.length > 0) {
      formattedOffer.images.forEach(img => {
        if (!imagesByType[img.imageType]) {
          imagesByType[img.imageType] = [];
        }
        imagesByType[img.imageType].push({
          id: img.id,
          url: img.imageUrl,
          altText: img.altText,
          isPrimary: img.isPrimary
        });
      });
    }

    // Format sub-offers with their images
    if (formattedOffer.subOffers) {
      formattedOffer.subOffers = formattedOffer.subOffers.map(subOffer => {
        const subImagesByType = {};
        if (subOffer.images && subOffer.images.length > 0) {
          subOffer.images.forEach(img => {
            if (!subImagesByType[img.imageType]) {
              subImagesByType[img.imageType] = [];
            }
            subImagesByType[img.imageType].push({
              id: img.id,
              url: img.imageUrl,
              altText: img.altText
            });
          });
        }
        return {
          ...subOffer,
          images: subImagesByType
        };
      });
    }

    // Add formatted images to the response
    formattedOffer.imagesByType = imagesByType;

    return res.status(200).json({
      success: true,
      data: formattedOffer
    });

  } catch (err) {
    console.error("Get Offer Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch offer",
      error: err.message,
    });
  }
};
