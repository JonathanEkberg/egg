import { createTRPCRouter } from "../../init"
import { makeReviewRoute } from "./makeReview"
import { deleteReviewRoute } from "./deleteReview"
import { updateReviewRoute } from "./updateReview"

export const reviewRouter = createTRPCRouter({
  makeReview: makeReviewRoute,
  deleteReview: deleteReviewRoute,
  updateReview: updateReviewRoute,
})
