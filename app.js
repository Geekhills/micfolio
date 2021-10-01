require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const Prismic = require('@prismicio/client');
const PrismicDOM = require('prismic-dom');



const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  });
}

function handleLinkResolver(doc) {
  
  // Define the url depending on the document type
  // if (doc.type === 'page') {
  //   return '/page/' + doc.uid;
  // } else if (doc.type === 'blog_post') {
  //   return '/blog/' + doc.uid;
  // }
  
  // Default to homepage
  return '/';
}
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  };
  res.locals.PrismicDOM = PrismicDOM;
  next();
});

const path = require('path')
const port = 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleResquest = async api => {
  const meta = await api.getSingle('meta')
  const preloader = await api.getSingle('preloader')
  const navigation = await api.getSingle('navigation')

      return {
        meta,
        navigation,
        preloader
      }
}

app.get('/', async(req, res) => {
  const api = await initApi(req)
  const defaults = await handleResquest(api)
    const home = await api.getSingle('home')
      res.render('pages/home', {
        ...defaults,
        home
        
        });
    
  })

app.get('/about', async(req, res) => {

      const api = await initApi(req)
      const defaults = await handleResquest(api)
      const about = await api.getSingle('about')

      //  console.log(about.data.body)
        res.render('pages/about', {
         ...defaults,
          about,
          
          });
})


app.get('/collections', (req, res) => {
    res.render('pages/collections')
}) 

app.get('/detail/:id', (req, res) => {
    res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})