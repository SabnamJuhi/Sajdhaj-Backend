const router = require("express").Router()
const offerCtrl = require("../../controllers/offers/offer.controller")
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware")

router.post("/", adminAuthMiddleware, offerCtrl.createOffer)
router.get("/", adminAuthMiddleware, offerCtrl.getAllOffers)
router.get("/:id", adminAuthMiddleware, offerCtrl.getOffer)
router.patch("/:id", adminAuthMiddleware, offerCtrl.updateOffer)
router.delete("/:id/deactivate", adminAuthMiddleware, offerCtrl.deactivateOffer)

module.exports = router
