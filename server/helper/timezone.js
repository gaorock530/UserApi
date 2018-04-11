
const ConvertUTCTimeToLocalTime = (timeStamp, UTCDateString, expires_day) =>
{
  const now = UTCDateString || Date.now();
  const expires = (expires_day && expires_day > 0) ? expires_day * 24 : 0;
  const convertdLocalTime = new Date(now);
  const hourOffset = convertdLocalTime.getTimezoneOffset() / 60;

  convertdLocalTime.setHours( convertdLocalTime.getHours() - hourOffset + expires ); 

  return timeStamp? convertdLocalTime.getTime() : convertdLocalTime;
}

module.exports = {ConvertUTCTimeToLocalTime};