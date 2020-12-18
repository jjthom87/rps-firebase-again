## Deploy to internet using firebase cli
* ```npm install -g firebase-tools```
  * note: if permission error, then run ```sudo npm install -g firebase-tools```
* ```firebase login```
* ```firebase init```
  * ? What do you want to use as your public directory? <strong>public</strong>
  * ? Configure as a single-page app (rewrite all urls to /index.html)? <strong>No</strong>
  * ? Set up automatic builds and deploys with GitHub? <strong>No</strong>
* Move you firebase files into the <strong>public</strong> folder that is created for you.
* ```firebase deploy```
* <strong>Hosting URL</strong> will be your application url

## Thoughts
* Attempting to perform functionality when someone closes browser: // https://stackoverflow.com/questions/20853142/trying-to-detect-browser-close-event
