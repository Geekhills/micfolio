require('dotenv').config()

const express = require('express')
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

app.get('/', (req, res) => {
  initApi(req).then(api => {
    api.query([
      Prismic.Predicates.any('document.type', ['meta','home']),
      ]).then(response => {
      const { results } = response
     const [meta,home] = results
     console.log(home.data.title)
      res.render('pages/home', {
        meta,home
        
        });
    });
  });})

app.get('/about', async (req, res) => {

    initApi(req).then(api => {
      api.query([
        Prismic.Predicates.any('document.type', ['meta','about']),
        ]).then(response => {
        const { results } = response
       const [meta,about] = results
       console.log(meta,about)
        res.render('pages/about', {
          meta,about
          
          });
      });
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