var express = require('express');
var router = express.Router();
var axios = require('axios')

/* GET token */
const regionOpts = [
  {
    key:"us-east-1",
    value: "mypurecloud.com"
  },
  {
    key:"us-east-2",
    value: "use2.us-gov-pure.cloud"
  },
  {
    key:"us-west-2",
    value: "usw2.pure.cloud/"
  },
  {
    key:"ca-central-1",
    value: "cac1.pure.cloud"
  },
  {
    key:"sa-east-1",
    value: "sae1.pure.cloud/"
  },
  {
    key:"eu-central-1",
    value: "mypurecloud.de"
  },
  {
    key:"eu-west-1",
    value: "mypurecloud.ie"
  },
  {
    key:"eu-west-2",
    value: "euw2.pure.com"
  },
  {
    key:"ap-south-1",
    value: "aps1.pure.com"
  },
  {
    key:"ap-northeast-2",
    value: "apne2.pure.com"
  },
  {
    key:"ap-southeast-2",
    value: "mypurecloud.com.au"
  },
  {
    key:"ap-northeast-1",
    value: "mypurecloud.jp"
  }
]
const getRegionUrl = (paramRegion) => { 
  const region = regionOpts.filter(r => r.key === paramRegion); 
  return region[0]?.value || null;
}

router.get('/', async function(req, res, next) {
  const clientId = "66051fa3-846e-450b-9e05-a92aee1a688a";// process.env.CLIENT_ID;
  const clientSecret ="NBEdLenP3dS-PVnlVrWhCVn1Nqg_1wHgijpfYf5f_7E";// process.env.CLIENT_SECRET; 
  const regionUrl = getRegionUrl(req.query.region); 
  if (regionUrl === null) {
    return res.send({'error': 'select a region'}); 
  }
  try {
    let response_token = await axios(`https://login.${regionUrl}/oauth/token`, {
      method: "POST",
      data: `grant_type=client_credentials&client_id=${req.query.client_id}&client_secret=${req.query.secret_key}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
     
    res.send(response_token.data); 
  
    
  } catch (e) {
    res.send(e);
  }
});

router.get('/getToken', function(req, res, next) {
  res.send('respond with a getToken');
});
// TODO: Refactor
router.get('/acn', async function(req, res, next) {
  const clientId = process.env.ACN_CLIENT_ID;
  const clientSecret = process.env.ACN_CLIENT_SECRET;
  console.log("clientId", clientId)
  console.log("clientSecret", clientSecret)
  const regionUrl = getRegionUrl(req.query.region); 
  if (regionUrl === null) {
    return res.send({'error': 'Select a valid region'}); 
  }
  try {
    let response_token = await axios(`https://login.${regionUrl}/oauth/token`, {
      method: "POST",
      data: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
     
    res.send(response_token.data); 
  
    
  } catch (e) {
    res.send(e);
  }
});

router.get('/aig', async function(req, res, next) {
  const clientId = process.env.AIG_CLIENT_ID;
  const clientSecret = process.env.AIG_CLIENT_SECRET;
  const regionUrl = getRegionUrl(req.query.region); 
  if (regionUrl === null) {
    return res.send({'error': 'Select a valid region'}); 
  }
  try {
    let response_token = await axios(`https://login.${regionUrl}/oauth/token`, {
      method: "POST",
      data: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
     
    res.send(response_token.data); 
  
    
  } catch (e) {
    res.send(e);
  }
});
 
 


module.exports = router;
