import { createTRPCRouter } from "../../init"
import { makeReviewRoute } from "./makeReview"
import { deleteReviewRoute } from "./deleteReview"

export const reviewRouter = createTRPCRouter({
  makeReview: makeReviewRoute,
  deleteReview: deleteReviewRoute,
})
