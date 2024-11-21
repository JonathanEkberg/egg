import { db, userEmailVerificationTable } from "@egg/database"
import { isFuture, addMinutes, differenceInSeconds } from "date-fns"
import { sendEmail } from "./mq"

export async function sendUserEmailVerificationCode(
  userId: string,
  userEmail: string,
  userName: string,
) {
  try {
    const code = Math.floor(Math.random() * 799999) + 100000
    await db.insert(userEmailVerificationTable).values({
      code,
      expires: addMinutes(Date.now(), 10),
      userId: userId,
    })

    const url = new URL(
      "/auth/verify",
      process.env.SITE_URL ?? "http://localhost:3000",
    )
    url.searchParams.set("code", String(code))
    const link = url.toString()
    const emailBody = `<h1>Hello, ${userName}</h1>
<p>Here is your one time code to enter to verify your account: <b>${code}</b></p>
<p>Alternatively use this link: <a href="${link}">${link}</a></p>`

    console.log(`Sending verificatiom email to ${userEmail}`)
    await sendEmail(userEmail, emailBody)
    console.log(`Sent verificatiom email`)
  } catch (e) {
    console.error(e)
    console.error("Failed sending verification email")
  }
}

export async function checkSendUserEmailVerificationCode(
  userId: string,
  userEmail: string,
  userName: string,
) {
  try {
    const existingCode = await db.query.userEmailVerificationTable.findFirst({
      where: (t, { eq }) => eq(t.userId, userId),
      columns: { id: true, expires: true },
    })

    if (
      existingCode &&
      isFuture(existingCode.expires) &&
      // Don't send new if existing doesn't expire within 5 minutes
      differenceInSeconds(existingCode.expires, Date.now()) > 300
    ) {
      return
    }

    await sendUserEmailVerificationCode(userId, userEmail, userName)
  } catch (e) {
    console.error(e)
    console.error("Failed sending verification email")
  }
}
