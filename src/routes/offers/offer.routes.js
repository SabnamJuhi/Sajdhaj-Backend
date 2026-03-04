// const router = require("express").Router()
// const offerCtrl = require("../../controllers/offers/offer.controller")
// const adminAuthMiddleware = require("../../middleware/admin.auth.middleware")

// router.post("/", adminAuthMiddleware, offerCtrl.createOffer)
// router.get("/", adminAuthMiddleware, offerCtrl.getAllOffers)
// router.get("/:id", adminAuthMiddleware, offerCtrl.getOffer)
// router.patch("/:id", adminAuthMiddleware, offerCtrl.updateOffer)
// router.delete("/:id/deactivate", adminAuthMiddleware, offerCtrl.deactivateOffer)

// module.exports = router




// routes/offers/offer.routes.js

const express = require("express");
const router = express.Router();
const offerController = require("../../controllers/offers/offer.controller");
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");
const { protected } = require("../../middleware/user.logout.middleware");
const upload = require("../../middleware/upload");

// // Dynamic field generator for multiple sub-offer images
// const uploadFields = (subOfferCount) => {
//   const fields = [
//     { name: 'offerImages_banner', maxCount: 1 },
//     { name: 'offerImages_mobile_banner', maxCount: 1 },
//     { name: 'offerImages_thumbnail', maxCount: 1 }
//   ];
  
//   for (let i = 0; i < subOfferCount; i++) {
//     fields.push({ name: `subOfferImages_${i}_badge`, maxCount: 1 });
//     fields.push({ name: `subOfferImages_${i}_icon`, maxCount: 1 });
//     fields.push({ name: `subOfferImages_${i}_background`, maxCount: 1 });
//     // fields.push({ name: `subOfferImages_${i}_brand_logo`, maxCount: 1 });
//     // fields.push({ name: `subOfferImages_${i}_promo`, maxCount: 3 });
//   }
  
//   return fields;
// };
// SIMPLIFIED - Use upload.any() to accept all files

// Debug middleware to see raw request
router.post(
  "/",
  adminAuthMiddleware,
  (req, res, next) => {
    console.log("1. Headers:", req.headers['content-type']);
    
    // Log the raw request for debugging
    let rawData = '';
    req.on('data', chunk => {
      rawData += chunk.toString();
      console.log(`Received chunk of size: ${chunk.length}`);
    });
    
    req.on('end', () => {
      console.log(`Total data received: ${rawData.length} bytes`);
      console.log('First 200 chars:', rawData.substring(0, 200));
    });
    
    next();
  },
  upload.any(),
  (req, res, next) => {
    console.log("2. After upload.any()");
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files count:", req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach(f => console.log(`- ${f.fieldname}: ${f.originalname}`));
    }
    next();
  },
  offerController.createOffer
);

router.get("/", adminAuthMiddleware, offerController.getAllOffers);
router.get("/withImages", adminAuthMiddleware, offerController.getAllOffersWithImages);
router.get("/:id", adminAuthMiddleware, offerController.getOffer);
router.patch("/:id/deactivate", adminAuthMiddleware, offerController.deactivateOffer)
// In your routes file
router.put(
  "/:id", 
  adminAuthMiddleware, 
  upload.any(), // This MUST come before your controller
  offerController.updateOffer
);


// Public/user routes for frontend
router.get("/active/frontend", protected, offerController.getActiveOffersForFrontend);
router.get("/:id/offersProducts", protected, offerController.getOffersForProduct);


module.exports = router;