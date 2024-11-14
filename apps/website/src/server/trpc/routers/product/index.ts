import { createTRPCRouter } from "../../init"
import { createProductRoute } from "./createProduct"
import { getProductsRoute } from "./getProducts"
import { getProductRoute } from "./getProduct"
import { getProductsPaginationRoute } from "./getProductsPagination"
import { addProductToCartRoute } from "../cart/addProductToCart"

export const productRouter = createTRPCRouter({
  createProduct: createProductRoute,
  getProducts: getProductsRoute,
  getProductsPagination: getProductsPaginationRoute,
  getProduct: getProductRoute,
  addProductToCart: addProductToCartRoute,
})
