import { db, userEmailVerificationTable } from "@egg/database"
import { isFuture, addMinutes, differenceInSeconds } from "date-fns"
import { sendEmail } from "./mq"
import { randomInt } from "crypto"

export async function sendUserEmailVerificationCode(
  userId: string,
  userEmail: string,
  userName: string,
) {
  try {
    const code = randomInt(100000, 999999)
    await db
      .insert(userEmailVerificationTable)
      .values({
        code,
        expires: addMinutes(Date.now(), 10),
        userId: userId,
      })
      .onConflictDoUpdate({
        target: userEmailVerificationTable.userId,
        set: { code: code, expires: addMinutes(Date.now(), 10) },
      })

    const url = new URL(
      "/auth/verify",
      process.env.SITE_URL ?? "http://localhost:3000",
    )
    url.searchParams.set("code", String(code))
    const link = url.toString()
    const emailBody = `<h1>Hello, ${userName}</h1>
<p>Here is your one time code to enter to verify your login to your account: <b>${code}</b></p>
<p>Alternatively use this link: <a href="${link}">${link}</a></p>`

    console.log(`Sending verificatiom email to ${userEmail}`)
    await sendEmail(userEmail, emailBody)
    console.log(`Sent verificatiom email`)
  } catch (e) {
    console.error(e)
    console.error("Failed sending verification email")
  }
}
