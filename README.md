# API for statistic Prebid.js and GPT

With this API you can track the initial information about available slots on your website, and you can also track bidders.

## Installation

You have to clone this repository to your local PC.

```bash
git clone https://github.com/allx-under/test-ads.git <your directory>
```

Next, you have to link the prebidStats.js (src= "client/prebidStats.js") to your project in the <head></head> tag. And also connect the styles (<link rel= stylesheet href= client/css/style.css/>) to your project, which are in the directory client/css/styles.css

## Usage

```javascript
import { initAPI } from "./prebidStats";

To start the API you need to call the following function.

initAPI()
```

## Additional

You can also track all the fetch requests that have been made on your website. To do this you need to change the directory to test-ads/server

```bash
cd server
```

and run the server on the http://localhost:3000/ using next scriprt in terminal

```bash
npm start
```

When you start the project in the log you will see the URL for each native fetch() request made.
