import * as fs from 'fs';
import { withIronSessionApiRoute } from "iron-session/next";

const dogProbability = 0.5;
export function newCaptchaImages() {
  return (new Array(9))
    .fill(null)
    .map((val,index) => {
      const shouldBeDog = Math.random() < dogProbability;
      const number = Math.floor(Math.random() * (shouldBeDog ? 10 : 13)) + 1;
      const filename = (shouldBeDog ? 'dog' : 'muffin') + number + '.png';
      return `./public/dogs-and-muffins/${filename}`;
    });
}

export default withIronSessionApiRoute(async function handler(req, res) {
  const index = req.query.index;
  if (!req.session.captchaImages) {
    req.session.captchaImages = newCaptchaImages();
    await req.session.save();
  }
  res.setHeader('Content-Type', 'image/png');
  const imageBuffer = fs.readFileSync(req.session.captchaImages[index]);
  res.send(imageBuffer);
}, {
  cookieName: 'session',
  password: process.env.SESSION_SECRET,
});

