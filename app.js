const puppeteer = require('puppeteer');
const fs = require('fs')

var itemData = [];

var categoryName = ["Shirts", "T-Shirts", "Polos","Jeans", "Pants", "Shorts"];
var colors = ['beige', 'black', 'blue', 'brown', 'green', 'grey', 'navy', 'purple', 'red', 'white', 'orange', 'yellow'];

async function webScrape() {
   var browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--window-size=1600,600']
   });

   var page = await browser.newPage();

   for (let categoryNumber = 6; categoryNumber <= 6; categoryNumber++) {

      itemData = [];
      let category = categoryName[categoryNumber];

      for (let colorNumber = 0; colorNumber < colors.length; colorNumber++) {

        let color = colors[colorNumber];
        itemData = [];

         for (let pageNumber = 1; pageNumber <= 5; pageNumber++) {

            let url = "https://www.zalora.com.ph/men/clothing/" + category + "/?from=header" + "&color=" + color + "&page=" + pageNumber;
            await page.goto(url, {
               waitUntil: 'networkidle2'
            });
            await autoScroll(page);
            let tempItemData = await page.evaluate((categoryNumber) => {

               //-------------------------------Processing of Individual Items------------------------------------//
               let itemCount = document.querySelectorAll('img[class="b-catalogList__itm-img b-catalogList__itm-img"]').length;
               let tempData = [];
               let categoryName = ["Shirts", "T-Shirts", "Polos", "Jeans", "Pants", "Shorts"];

               for (let x = 0; x < itemCount; x++) {

                  let itemName = document.querySelectorAll('em[class="b-catalogList__itmTitle fss"]')[x].innerText;
                  let itemImageLink = document.querySelectorAll('img[class="b-catalogList__itm-img b-catalogList__itm-img--hovered"]')[x].src;
                  let itemPageLink = document.querySelectorAll('a[class="b-catalogList__itmLink itm-link"]')[x].href;
                  let itemPrice = 0;
                  let priceBox = document.querySelectorAll('span[class="b-catalogList__itmPriceBox itm-priceBox fsm txtDark"]')[x];
                  if (priceBox.childElementCount == 2) {
                     itemPrice = priceBox.children[1].innerText;
                  } else {
                     itemPrice = priceBox.children[0].innerText;
                  }
                  itemPrice = parseInt(itemPrice.replace(/[^0-9\.]/g, ''));
                  let itemBrand = document.querySelectorAll('span[class="b-catalogList__itmBrand fsm txtDark uc"]')[x].innerText;
                  let itemCategory = categoryName[categoryNumber];

                  tempData.push({
                     itemName: itemName,
                     itemImageLink: itemImageLink,
                     itemPageLink: itemPageLink,
                     itemPrice: itemPrice,
                     itemCategory: itemCategory,
                     itemBrand: itemBrand
                  });

               }

               return tempData;
               //END----------------------------Processing of Individual Items------------------------------END//

            });

            tempItemData.forEach((item, i) => {
               itemData.push(item);
            });

         }

         saveToDatabase(categoryName[categoryNumber],color);

      }
   }

}

async function webScrapeOuterwear(){

  var browser = await puppeteer.launch({
     headless: false,
     defaultViewport: null,
     args: ['--window-size=1600,600']
  });

  var page = await browser.newPage();

  itemData = [];
  outerwearCategory = [105,5622,5613];
  outerwearCategoryName = ["Jackets","Blazers","Hoodies"];
  let category = "Outerwear";

  for(let categoryNumber = 0; categoryNumber < outerwearCategory.length; categoryNumber++){

    for (let colorNumber = 0; colorNumber < colors.length; colorNumber++) {

      let color = colors[colorNumber];
      itemData = [];

       for (let pageNumber = 1; pageNumber <= 5; pageNumber++) {

          let url = "https://www.zalora.com.ph/men/clothing/" + category + "/?from=header" + "&color=" + color + "&page=" + pageNumber + "&category_id=" + outerwearCategory[categoryNumber];
          await page.goto(url, {
             waitUntil: 'networkidle2'
          });
          await autoScroll(page);
          let tempItemData = await page.evaluate((categoryNumber) => {

             //-------------------------------Processing of Individual Items------------------------------------//
             let itemCount = document.querySelectorAll('img[class="b-catalogList__itm-img b-catalogList__itm-img"]').length;
             let tempData = [];
             let categoryName = ["Shirts", "T-Shirts", "Polos", "Jeans", "Pants", "Shorts"];

             for (let x = 0; x < itemCount; x++) {

                let itemName = document.querySelectorAll('em[class="b-catalogList__itmTitle fss"]')[x].innerText;
                let itemImageLink = document.querySelectorAll('img[class="b-catalogList__itm-img b-catalogList__itm-img--hovered"]')[x].src;
                let itemPageLink = document.querySelectorAll('a[class="b-catalogList__itmLink itm-link"]')[x].href;
                let itemPrice = 0;
                let priceBox = document.querySelectorAll('span[class="b-catalogList__itmPriceBox itm-priceBox fsm txtDark"]')[x];
                if (priceBox.childElementCount == 2) {
                   itemPrice = priceBox.children[1].innerText;
                } else {
                   itemPrice = priceBox.children[0].innerText;
                }
                itemPrice = parseInt(itemPrice.replace(/[^0-9\.]/g, ''));
                let itemBrand = document.querySelectorAll('span[class="b-catalogList__itmBrand fsm txtDark uc"]')[x].innerText;
                let itemCategory = categoryName[categoryNumber];

                tempData.push({
                   itemName: itemName,
                   itemImageLink: itemImageLink,
                   itemPageLink: itemPageLink,
                   itemPrice: itemPrice,
                   itemCategory: itemCategory,
                   itemBrand: itemBrand
                });

             }

             return tempData;
             //END----------------------------Processing of Individual Items------------------------------END//

          });

          tempItemData.forEach((item, i) => {
             itemData.push(item);
          });

       }

       saveToDatabase(outerwearCategoryName[categoryNumber],color);

    }
  }


}


async function autoScroll(page) {
   await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
         var totalHeight = 0;
         var distance = 100;
         var timer = setInterval(() => {
            var scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
               clearInterval(timer);
               resolve();
            }
         }, 25);
      });
   });
}

function saveToDatabase(category,color) {
   fs.writeFile("./database/" + category + "/" + color + ".json", JSON.stringify(itemData), 'utf8', (err) => {
      if (err) {
         console.log("AN ERROR OCCURED!");
         return console.log(err);
      }
      console.log("FILE SAVED!");
   })
}



//webScrape();
webScrapeOuterwear();
