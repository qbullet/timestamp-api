const axios = require("axios");
const model = require("../models/db");
const otpStatus = require("../enum/otpStatus.enum");
const sms = require("./sms");

const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

require("dotenv").config();

const expireTime = 5; //minute

async function createOtp(tel) {
  const otp = randomForm(4, "digits");
  const ref = randomForm(6, "alphanum");

  const created = new model.otp({
    otp,
    ref,
    expire: dayjs().add(expireTime, "minute"),
    status: otpStatus.WAITING,
  }).save();

  sms.send({
    to: tel,
    text: `รหัส OTP ของคุณคือ "${otp}" รหัสอ้างอิง ${ref}, OTP นี้จะหมดอายุใน ${expireTime} นาที`,
    from: "timestamp-api",
  });

  return created;
}

async function checkOtp(otp, ref) {
  const doc = await model.otp.findOne({ ref, status: otpStatus.WAITING });

  if (!!doc && otp === doc.otp && dayjs(doc.expire).isAfter(dayjs())) {
    model.otp.findOneAndUpdate({ ref }, { status: otpStatus.VERIFIED });

    return {
      success: true,
      message: "otp confirmed",
    };
  } else if (!!doc && otp === doc.otp && dayjs(doc.expire).isBefore(dayjs())) {
    return {
      success: false,
      message: "otp expired",
    };
  } else if (!!doc && otp !== doc.otp) {
    return {
      success: false,
      message: "otp not match",
    };
  } else {
    return {
      success: false,
      message: "ref is invalid",
    };
  }
}

function randomForm(length, type) {
  let result = "";
  const alphaNum =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const digits = "0123456789";
  const format = type === "digits" ? digits : alphaNum;
  for (let i = 0; i < length; i++) {
    result += format.charAt(Math.floor(Math.random() * format.length));
  }

  return result;
}

module.exports = {
  createOtp,
  checkOtp,
};
