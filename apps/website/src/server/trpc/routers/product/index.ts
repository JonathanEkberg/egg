import { baseProcedure, createTRPCRouter } from "../../init"
import { createProductRoute } from "./createProduct"
import { getProductsRoute } from "./getProducts"
import { getProductRoute } from "./getProduct"
import { getProductsPaginationRoute } from "./getProductsPagination"
import { makeReviewRoute } from "./makeReview"
import { deleteReviewRoute } from "./deleteReview"
import { addProductToCart } from "./addProductToCart"

export const productRouter = createTRPCRouter({
  createProduct: createProductRoute,
  getProducts: getProductsRoute,
  getProductsPagination: getProductsPaginationRoute,
  getProduct: getProductRoute,
  makeReview: makeReviewRoute,
  deleteReview: deleteReviewRoute,
  addProductToCart: addProductToCart,
})
