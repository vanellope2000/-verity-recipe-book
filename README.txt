VERITY'S RECIPE BOOK - VERSION 1

WHAT IT DOES
- Stores recipes privately in your browser on your device
- Search recipes
- Categories
- Favourites
- Manual recipe entry
- Paste recipe text and auto-sort it into a recipe draft
- Screenshot/photo import using Tesseract.js OCR
- Review/edit before saving
- Add a recipe photo
- Backup all recipes to a JSON file
- Restore from a JSON backup
- Installable as a Home Screen web app when hosted on HTTPS

IMPORTANT
- Recipes are stored in browser localStorage. Clearing website data can remove them, so use Backup regularly.
- OCR uses the Tesseract.js library from jsDelivr. The first scan needs internet access so the OCR library/language data can load.
- No paid AI service or API is used.

HOW TO TEST ON A COMPUTER
1. Put these files in one folder.
2. Serve the folder with any simple local web server.
3. Open index.html through that server.

HOW TO PUT IT ON AN IPHONE
The simplest free route is GitHub Pages:
1. Create a free GitHub account.
2. Create a repository and upload all of these files.
3. In repository Settings > Pages, publish from the main branch/root folder.
4. Open the new site in Safari on your iPhone.
5. Tap Share > Add to Home Screen.

Do not open index.html directly from the Files app for normal use; browser storage and service workers work properly when the app is served as a website.
