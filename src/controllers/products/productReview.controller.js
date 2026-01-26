const ProductReview = require("../../models/products/productReview.model")

/**
 * CREATE REVIEW
 */
exports.createReview = async (req, res) => {
  try {
    const {
      productId,
      userId,
      userName,
      rating,
      title,
      reviewText,
      isVerifiedBuyer
    } = req.body

    if (!productId || !rating) {
      return res.status(400).json({
        message: "productId and rating are required"
      })
    }

    const review = await ProductReview.create({
      productId,
      userId,
      userName,
      rating,
      title,
      reviewText,
      isVerifiedBuyer
    })

    res.status(201).json({
      message: "Review added successfully",
      data: review
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to create review",
      error: error.message
    })
  }
}

/**
 * GET ALL REVIEWS OF A PRODUCT
 */
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params

    const reviews = await ProductReview.findAll({
      where: { productId },
      order: [["createdAt", "DESC"]]
    })

    res.status(200).json({
      total: reviews.length,
      data: reviews
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    })
  }
}

/**
 * UPDATE REVIEW
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params

    const review = await ProductReview.findByPk(id)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    await review.update(req.body)

    res.status(200).json({
      message: "Review updated successfully",
      data: review
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to update review",
      error: error.message
    })
  }
}

/**
 * DELETE REVIEW
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params

    const review = await ProductReview.findByPk(id)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    await review.destroy()

    res.status(200).json({
      message: "Review deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message
    })
  }
}


// // 
// exports.createOrUpdateReview = async (req, res) => {
//   try {
//     const {
//       productId,
//       userId,
//       userName,
//       rating,
//       title,
//       reviewText,
//       isVerifiedBuyer
//     } = req.body

//     const existingReview = await ProductReview.findOne({
//       where: { productId, userId }
//     })

//     let review

//     if (existingReview) {
//       review = await existingReview.update({
//         rating,
//         title,
//         reviewText,
//         isVerifiedBuyer
//       })

//       return res.status(200).json({
//         message: "Review updated successfully",
//         data: review
//       })
//     }

//     review = await ProductReview.create({
//       productId,
//       userId,
//       userName,
//       rating,
//       title,
//       reviewText,
//       isVerifiedBuyer
//     })

//     res.status(201).json({
//       message: "Review added successfully",
//       data: review
//     })
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to save review",
//       error: error.message
//     })
//   }
// }
