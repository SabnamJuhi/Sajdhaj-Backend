const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/admin", require("./routes/admin.auth.routes"))

app.use("/api/categories", require("./routes/category/category.routes"))
app.use("/api/subcategories", require("./routes/category/subcategory.routes"))
app.use("/api/productCategories", require("./routes/category/productCategory.routes"))

app.use("/api/products", require("./routes/products/product.routes"))
app.use("/api/productSpec", require("./routes/products/productSpec.routes"))
app.use("/api/reviews", require("./routes/products/review.routes"))
app.use("/api/ratings", require("./routes/products/rating.routes"))
app.use("/api/prices", require("./routes/products/price.routes"))

app.use("/api/variants", require("./routes/variants/productVariant.routes"))

app.use("/api/offers", require("./routes/offers/offer.routes"))

app.use("/api/aggregate", require("./routes/products/product.Agreegate.route"))


module.exports = app
