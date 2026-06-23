module.exports = {
  port: 4200,
  directory: 'dist/DataShare_Frontend/browser', 
  https: true,
  cert: '.certs/localhost.pem',
  key: '.certs/localhost-key.pem',
  spa: 'index.html', // Handle SPA routing by redirecting all requests to index.html
  rewrite: [
    {
      from: '/api/(.*)',
      to: 'https://localhost:8443/api/$1' // Redirect API requests to the backend server
    }
  ]
};