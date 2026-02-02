"use server"

export async function processPayment(paymentData: {
  amount: string
  cardNumber: string
  expiryDate: string
  cardCode: string
  firstName: string
  lastName: string
  email: string
}) {
  const API_LOGIN_ID = "7t37xPX5"
  const TRANSACTION_KEY = "8Wp4F4T9fqK5gq6M"
  const API_ENDPOINT = "https://api.authorize.net/xml/v1/request.api"

  console.log("[v0] Processing payment:", {
    amount: paymentData.amount,
    cardLast4: paymentData.cardNumber.slice(-4),
    email: paymentData.email,
  })

  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: API_LOGIN_ID,
        transactionKey: TRANSACTION_KEY,
      },
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: paymentData.amount,
        payment: {
          creditCard: {
            cardNumber: paymentData.cardNumber,
            expirationDate: paymentData.expiryDate,
            cardCode: paymentData.cardCode,
          },
        },
        customer: {
          email: paymentData.email,
        },
        billTo: {
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          email: paymentData.email,
        },
      },
    },
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    console.log("[v0] Authorize.net response:", JSON.stringify(data, null, 2))

    // Check if we have a transaction response
    if (data.messages?.resultCode === "Ok" && data.transactionResponse) {
      const transactionResponse = data.transactionResponse

      // Response code 1 = Approved
      if (transactionResponse.responseCode === "1") {
        return {
          success: true,
          transactionId: transactionResponse.transId,
          message: "Payment successful!",
        }
      } else {
        // Transaction was declined or had an error
        let errorMessage = "Transaction declined. Please check your card details and try again."

        if (transactionResponse.errors && transactionResponse.errors.length > 0) {
          errorMessage = transactionResponse.errors[0].errorText
        } else if (transactionResponse.messages && transactionResponse.messages.length > 0) {
          errorMessage = transactionResponse.messages[0].description
        }

        console.error("[v0] Transaction declined:", {
          responseCode: transactionResponse.responseCode,
          message: errorMessage,
        })

        return {
          success: false,
          message: errorMessage,
        }
      }
    } else {
      // API call failed or error message from Authorize.net
      let errorMessage = "Payment declined. Please try again or use a different card."

      if (data.messages?.message && data.messages.message.length > 0) {
        errorMessage = data.messages.message[0].text
      } else if (data.transactionResponse?.errors && data.transactionResponse.errors.length > 0) {
        errorMessage = data.transactionResponse.errors[0].errorText
      }

      console.error("[v0] API error:", errorMessage)

      return {
        success: false,
        message: errorMessage,
      }
    }
  } catch (error) {
    console.error("[v0] Payment error:", error)
    return {
      success: false,
      message: "Payment could not be processed. Please check your card information and try again.",
    }
  }
}
