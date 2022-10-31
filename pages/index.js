import Captcha from "../components/Captcha";
import {useState} from "react";
import {withIronSessionSsr} from 'iron-session/next';
import {newCaptchaImages} from "./api/captcha-image";

export default function Home({defaultCaptchaKey}) {
  const [message,setMessage] = useState('');
  const [selectedIndexes,setSelectedIndexes] = useState([]);
  const [captchaKey, setCaptchaKey] = useState(defaultCaptchaKey);
  function send() {
    if (!message) {
      alert('The message is required')
      return;
    }
    fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify({
        message,
        selectedIndexes
      }),
      headers: {'Content-Type':'application/json'},
    }).then(response => {
      response.json().then(json => {
        if (json.sent) {
          setCaptchaKey((new Date()).getTime());
          alert('message sent');
          setMessage('');
        }
        if (!json.captchaIsOk) {
          setCaptchaKey((new Date()).getTime());
          alert('wrong captcha. try again');
        }
      })
    });
  }
  return (
    <main>
      <input type="text"
             onChange={e => setMessage(e.target.value)}
             placeholder="Message" value={message}/>
      <div>
        <Captcha captchaKey={captchaKey} onChange={setSelectedIndexes} />
      </div>
      <button onClick={send}>Send</button>
    </main>
  )
}

export const getServerSideProps = withIronSessionSsr(async ({req}) => {
  {
    if (!req.session.captchaImages) {
      req.session.captchaImages = newCaptchaImages();
      await req.session.save();
    }
    return {
      props:{
        defaultCaptchaKey: (new Date).getTime(),
      }
    };
  }
}, {
  cookieName: 'session',
  password: process.env.SESSION_SECRET,
});