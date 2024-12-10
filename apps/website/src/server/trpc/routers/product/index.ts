import { createTRPCRouter } from "../../init"
import { createProductRoute } from "./createProduct"
import { getProductsRoute } from "./getProducts"
import { getProductRoute } from "./getProduct"
import { getProductsPaginationRoute } from "./getProductsPagination"
import { addProductToCartRoute } from "../cart/addProductToCart"
import { editProductRoute } from "./editProduct"
import { deleteProductRoute } from "./deleteProduct"

export const productRouter = createTRPCRouter({
  createProduct: createProductRoute,
  editProduct: editProductRoute,
  deleteProduct: deleteProductRoute,
  getProducts: getProductsRoute,
  getProductsPagination: getProductsPaginationRoute,
  getProduct: getProductRoute,
  addProductToCart: addProductToCartRoute,
})
