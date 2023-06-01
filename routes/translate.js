var express = require('express');
var router = express.Router();
const cors = require('cors')
const bodyParser = require('body-parser');
const axios = require('axios');

const CLIENT_ID = 'e29ba9d3-1058-4597-9901-faee2e259ee6';
const CLIENT_SECRET = '61UeIlGqyCraVOPBJ/quhiKHG2hr]7:-';
const RESOURCE = 'e29ba9d3-1058-4597-9901-faee2e259ee6';
const getBearerToken = async () => {
    console.log("Token getBearerToken");
    try {
      let res = await axios("https://login.microsoftonline.com/e0793d39-0939-496d-b129-198edd916feb/oauth2/token", {
        method: "POST",
        data: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&resource=${RESOURCE}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log("Token Generated");
      return res.data;
      
    } catch (e) {
      console.log(e.data.message);
    }
  };
  
  const translateHandler = async (params) => {
      try {
          let bodyTemplate = JSON.stringify({
              "TranslationEngine":"aws",
              "TextInput":[      
                  { 
                      "InputID":"12131",
                      "InputText":`${params.Text}`,
                      "SourceLanguage":`${params.SourceLanguageCode}`,
                      "OutputLanguage": `${params.TargetLanguageCode}`        
                  }
              ]
          })
          let res = await axios({
              method: 'post',
              url: `https://apigatewayazeu.accenture.com/taas/test/v1/TranslateText`,
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              data: bodyTemplate
            })
  
            return res;
      } catch(err){
          console.log(err)
      }
  }
// router.get('/', function(req, res, next) {
//   res.send('respond with a translate');
// });

router.post('/', async function(req, res, next) {
  
  const body = req.body;
    const params = {
      Text: body.raw_text,
      SourceLanguageCode: body.source_language,
      TargetLanguageCode: body.target_language
    };
   
    let response_token = await getBearerToken();
   
    token = response_token.access_token;
    console.log('---')
    console.log(params)
    let response_translate = await translateHandler(params) 
    let response_obj = {
      source_language: response_translate.data.Response[0].SourceLanguage,
      translated_text: response_translate.data.Response[0].OutputText
    }
    res.send(response_obj) 
});

module.exports = router;
