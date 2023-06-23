const commonHeaders = {
  "Content-Type": "application/json",
  "x-api-key": process.env.RECOGNITION_APIKEY!
}

const requestConfig = {
  validateStatus: () => true,
  timeout: parseInt(process.env.TIMEOUT!)
}

export { commonHeaders, requestConfig }